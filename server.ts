import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const app = express();
const PORT = 3000;
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const animes = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/lib/anime_database.json'), 'utf-8'));

// A pseudo-random generator for the shop rotation
function getShopRotation() {
  const EPOCH_5H = Math.floor(Date.now() / (5 * 60 * 60 * 1000));
  
  // simple seeded random
  function seededRandom(seed: number) {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  
  const rand = seededRandom(EPOCH_5H);
  const packs = [];
  const dbCopy = [...animes];
  
  // get 4 packs
  for(let i=0; i<4; i++) {
    const idx = Math.floor(seededRandom(EPOCH_5H + i + 10) * dbCopy.length);
    packs.push(dbCopy.splice(idx, 1)[0]);
  }
  return packs;
}

let cachedPacks = null;
let lastPackGen = 0;

app.get('/api/shop/packs', async (req, res) => {
  const EPOCH_5H = Math.floor(Date.now() / (5 * 60 * 60 * 1000));
  
  if (lastPackGen === EPOCH_5H && cachedPacks) {
    return res.json({ packs: cachedPacks });
  }

  const packsNames = getShopRotation();
  const packsWithImages = [];
  
  for (let anime of packsNames) {
    try {
      await new Promise(r => setTimeout(r, 400));
      const anilistQuery = "query ($search: String) { Media(search: $search, type: ANIME) { coverImage { extraLarge } } }";
      const resAnilist = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: anilistQuery, variables: { search: anime } })
      });
      const jsonAnilist = await resAnilist.json();
      let img = jsonAnilist.data?.Media?.coverImage?.extraLarge;
      packsWithImages.push({ name: anime, imageURL: img || null });
    } catch (e) {
      packsWithImages.push({ name: anime, imageURL: null });
    }
  }

  cachedPacks = packsWithImages;
  lastPackGen = EPOCH_5H;
  res.json({ packs: cachedPacks });
});

const rateLimitMap = new Map();

app.post('/api/shop/open', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const lastOpen = rateLimitMap.get(ip) || 0;
    if (Date.now() - lastOpen < 1000) {
       return res.status(429).json({ error: "Opening packs too fast!" });
    }
    rateLimitMap.set(ip, Date.now());

    const { anime, quantity = 1 } = req.body;
    
    // 1. Roll rarities
    const rolls = [];
    for(let i=0; i<quantity; i++) {
      const r = Math.random();
      let rarity = 'common';
      if (r > 0.98) rarity = 'mythic';
      else if (r > 0.85) rarity = 'legendary';
      else if (r > 0.60) rarity = 'epic';
      else if (r > 0.30) rarity = 'rare';
      rolls.push(rarity);
    }

    // 2. Ask Gemini to generate characters
    const prompt = `You are an expert anime Trading Card Game generator. We are opening a pack for the anime "${anime}".
    Generate EXACTLY ${quantity} characters matching these exact rarities: ${rolls.join(', ')}.
    
    STRICT RULES:
    1. ALWAYS use 100% REAL characters that actually exist in the anime/manga "${anime}". DO NOT invent characters!
    2. The "searchQuery" field MUST be the official romanized base name of the character WITHOUT ANY FORMS, TITLES, OR BRACKETS to ensure the Jikan API finds their photo (e.g., "Naruto Uzumaki" instead of "Naruto Uzumaki (Sage Mode)", "Monkey D. Luffy").
    3. The "name" field can have specific forms (e.g., "Goku (Super Saiyan)", "Gon (Adult)").
    4. Rarity dictates the base stats:
       - Mythic: Power 120-200, Resistance 120-200
       - Legendary: Power 80-120, Resistance 80-120
       - Epic: Power 40-80, Resistance 40-80
       - Common: Power 10-40, Resistance 10-40
    5. Each character has a 5% chance to be "isShiny": true. If shiny, multiply power by 1.5.
    6. Ensure the character generated genuinely matches the rarity scale in lore. A Mythic should be a very strong character/form.
    
    Return a JSON array of objects with:
    - name: String
    - power: Number
    - resistance: Number
    - rarity: String
    - isShiny: Boolean
    - searchQuery: String`;

    let characters = [];
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      characters = JSON.parse(response.text || '[]');
    } catch (apiError) {
      console.warn("Primary model failed, attempting fallback...", apiError);
      try {
        const response2 = await ai.models.generateContent({
          model: 'gemini-1.5-flash-8b',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        characters = JSON.parse(response2.text || '[]');
      } catch (fallbackError) {
        console.error("Fallback also failed, using default characters.", fallbackError);
        // Provide default dummy characters based on the requested anime to avoid complete failure
        characters = rolls.map((r, i) => ({
          name: `Unknown ${anime} Character ${i+1}`,
          searchQuery: anime,
          rarity: r,
          power: r === 'mythic' ? 150 : r === 'legendary' ? 100 : r === 'epic' ? 60 : 25,
          resistance: r === 'mythic' ? 150 : r === 'legendary' ? 100 : r === 'epic' ? 60 : 25,
          isShiny: Math.random() < 0.05
        }));
      }
    }
    
    // 3. Fetch images using multiple sources
    for (let char of characters) {
       let photoFound = false;
       try {
         // Try Anilist first
         const anilistQuery = "query ($search: String) { Character(search: $search) { image { large } } }";
         await new Promise(r => setTimeout(r, 400));
         const resAnilist = await fetch("https://graphql.anilist.co", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ query: anilistQuery, variables: { search: char.searchQuery } })
         });
         const jsonAnilist = await resAnilist.json();
         if (jsonAnilist.data && jsonAnilist.data.Character && jsonAnilist.data.Character.image && jsonAnilist.data.Character.image.large && !jsonAnilist.data.Character.image.large.includes('default')) {
            char.imageURL = jsonAnilist.data.Character.image.large;
            photoFound = true;
         }
         
         // Fallback to Jikan if MAL is up
         if (!photoFound) {
            await new Promise(r => setTimeout(r, 400));
            const charRes = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(char.searchQuery)}&limit=1`);
            if (charRes.ok) {
              const charJson = await charRes.json();
              if (charJson.data && charJson.data.length > 0 && charJson.data[0].images?.jpg?.image_url) {
                 char.imageURL = charJson.data[0].images.jpg.image_url;
                 photoFound = true;
              }
            }
         }

         // Fallback to Kitsu API
         if (!photoFound) {
            await new Promise(r => setTimeout(r, 400));
            const kitsuRes = await fetch(`https://kitsu.io/api/edge/characters?filter[name]=${encodeURIComponent(char.searchQuery)}`);
            if (kitsuRes.ok) {
               const kitsuJson = await kitsuRes.json();
               if (kitsuJson.data && kitsuJson.data.length > 0 && kitsuJson.data[0].attributes?.image?.original) {
                  char.imageURL = kitsuJson.data[0].attributes.image.original;
                  photoFound = true;
               }
            }
         }

         if (!photoFound) {
            // Dicebear is the last resort
            char.imageURL = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${char.searchQuery.replace(/\s+/g, '')}`;
         }
         char.anime = anime;
       } catch (e) {
         console.warn("Failed to fetch image for", char.searchQuery, e);
         char.imageURL = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${char.searchQuery.replace(/\s+/g, '')}`;
         char.anime = anime;
       }
    }
    
    res.json({ cards: characters });
  } catch (error) {
    console.error("Pack open error:", error);
    res.status(500).json({ error: "Failed to open pack." });
  }
});


app.post('/api/shop/fix-image', async (req, res) => {
  try {
    const { searchQuery, anime } = req.body;
    if (!searchQuery) return res.status(400).json({ error: "Missing searchQuery" });

    let photoFound = false;
    let imageURL = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${searchQuery.replace(/\s+/g, '')}`;

    // Try Anilist
    try {
      const anilistQuery = `query ($search: String) { Character(search: $search) { image { large } } }`;
      const resAnilist = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: anilistQuery, variables: { search: searchQuery } })
      });
      const jsonAnilist = await resAnilist.json();
      if (jsonAnilist.data?.Character?.image?.large && !jsonAnilist.data.Character.image.large.includes('default')) {
         imageURL = jsonAnilist.data.Character.image.large;
         photoFound = true;
      }
    } catch (e) { }

    // Try Jikan
    if (!photoFound) {
      try {
        const charRes = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(searchQuery)}&limit=1`);
        if (charRes.ok) {
          const charJson = await charRes.json();
          if (charJson.data?.[0]?.images?.jpg?.image_url) {
             imageURL = charJson.data[0].images.jpg.image_url;
             photoFound = true;
          }
        }
      } catch (e) { }
    }

    // Try Kitsu
    if (!photoFound) {
      try {
        const kitsuRes = await fetch(`https://kitsu.io/api/edge/characters?filter[name]=${encodeURIComponent(searchQuery)}`);
        if (kitsuRes.ok) {
           const kitsuJson = await kitsuRes.json();
           if (kitsuJson.data?.[0]?.attributes?.image?.original) {
              imageURL = kitsuJson.data[0].attributes.image.original;
              photoFound = true;
           }
        }
      } catch (e) { }
    }

    res.json({ imageURL });
  } catch (error) {
    res.status(500).json({ error: "Failed to fix image" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
