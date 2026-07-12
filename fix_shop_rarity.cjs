const fs = require('fs');
let code = fs.readFileSync('src/pages/Shop.tsx', 'utf-8');

const oldCardsMap = `         if (userCardsMap.has(cardData.name)) {`;
const newCardsMap = `         // Enforce types and casing to pass Firestore strict rules
         const cleanCardData = {
           name: String(cardData.name || 'Unknown'),
           anime: String(cardData.anime || anime),
           power: Number(cardData.power || 10),
           resistance: Number(cardData.resistance || 10),
           rarity: String(cardData.rarity || 'common').toLowerCase(),
           imageURL: String(cardData.imageURL || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=fallback')
         };
         if (cardData.isShiny !== undefined) cleanCardData.isShiny = Boolean(cardData.isShiny);
         if (cardData.searchQuery !== undefined) cleanCardData.searchQuery = String(cardData.searchQuery);

         if (userCardsMap.has(cleanCardData.name)) {
            const existing = userCardsMap.get(cleanCardData.name);
            const newLevel = existing.level + 1;
            batch.update(doc(db, 'users2', user.uid, 'cards2', existing.id), {
              level: newLevel,
              cardName: cleanCardData.name
            });
            existing.level = newLevel; 
            pulledCards.push({ id: existing.cardId, ...cleanCardData, level: newLevel } as Card);
         } else {
            const newCardId = \`card_\${Date.now()}_\${i}_\${Math.random().toString(36).substring(2)}\`;
            batch.set(doc(db, 'cards2', newCardId), { ...cleanCardData, createdAt: Date.now() });
            
            const userCardId = \`uc_\${Date.now()}_\${i}\`;
            batch.set(doc(db, 'users2', user.uid, 'cards2', userCardId), {
              cardId: newCardId,
              cardName: cleanCardData.name,
              acquiredAt: Date.now(),
              level: 1
            });
            userCardsMap.set(cleanCardData.name, { id: userCardId, cardId: newCardId, level: 1 });
            pulledCards.push({ id: newCardId, ...cleanCardData, level: 1 } as Card);
         }`;

// We need to replace the loop body
let loopStart = `      const pulledCards = [];\n      for(let i=0; i<quantity; i++) {\n         const cardData = data.cards[i];`;
let loopEndStr = `         }\n      }`;
let beforeLoop = code.split(loopStart)[0] + loopStart;
let afterLoop = loopEndStr + code.split(loopEndStr).slice(1).join(loopEndStr);

let newLoopBody = `
         
         // Enforce types and casing to pass Firestore strict rules
         const cleanCardData = {
           name: String(cardData.name || 'Unknown'),
           anime: String(cardData.anime || anime),
           power: Number(cardData.power || 10),
           resistance: Number(cardData.resistance || 10),
           rarity: String(cardData.rarity || 'common').toLowerCase(),
           imageURL: String(cardData.imageURL || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=fallback')
         };
         if (cardData.isShiny !== undefined) cleanCardData.isShiny = Boolean(cardData.isShiny);
         if (cardData.searchQuery !== undefined) cleanCardData.searchQuery = String(cardData.searchQuery);

         if (userCardsMap.has(cleanCardData.name)) {
            const existing = userCardsMap.get(cleanCardData.name);
            const newLevel = existing.level + 1;
            batch.update(doc(db, 'users2', user.uid, 'cards2', existing.id), {
              level: newLevel,
              cardName: cleanCardData.name
            });
            existing.level = newLevel; 
            pulledCards.push({ id: existing.cardId, ...cleanCardData, level: newLevel } as any);
         } else {
            const newCardId = \`card_\${Date.now()}_\${i}_\${Math.random().toString(36).substring(2)}\`;
            batch.set(doc(db, 'cards2', newCardId), { ...cleanCardData, createdAt: Date.now() });
            
            const userCardId = \`uc_\${Date.now()}_\${i}\`;
            batch.set(doc(db, 'users2', user.uid, 'cards2', userCardId), {
              cardId: newCardId,
              cardName: cleanCardData.name,
              acquiredAt: Date.now(),
              level: 1
            });
            userCardsMap.set(cleanCardData.name, { id: userCardId, cardId: newCardId, level: 1 });
            pulledCards.push({ id: newCardId, ...cleanCardData, level: 1 } as any);
         }
`;

fs.writeFileSync('src/pages/Shop.tsx', beforeLoop + newLoopBody + afterLoop);
console.log("Updated Shop.tsx to enforce rarity and types");
