const fs = require('fs');
let code = fs.readFileSync('src/pages/Collection.tsx', 'utf-8');

const oldFunc = `      await Promise.all(cardsToFix.map(async (card) => {
           try {
              const res = await fetch('/api/shop/fix-image', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ searchQuery: card.cardData.searchQuery || card.cardData.name, anime: card.cardData.anime })
              });
              const data = await res.json();
              if (data.imageURL && !data.imageURL.includes('dicebear') && !data.imageURL.includes('default')) {
                 await updateDoc(doc(db, 'cards2', card.cardData.id), { imageURL: data.imageURL });
                 updatedCount++;
              }
           } catch (e) {
             console.error("Failed to fix", card.cardData.name);
           }
      }));`;

const newFunc = `      // Run sequentially to avoid rate limits on third-party APIs
      for (const card of cardsToFix) {
           try {
              const res = await fetch('/api/shop/fix-image', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ searchQuery: card.cardData.searchQuery || card.cardData.name, anime: card.cardData.anime })
              });
              const data = await res.json();
              if (data.imageURL && !data.imageURL.includes('dicebear') && !data.imageURL.includes('default')) {
                 await updateDoc(doc(db, 'cards2', card.cardData.id), { imageURL: data.imageURL });
                 updatedCount++;
              }
           } catch (e) {
             console.error("Failed to fix", card.cardData.name);
           }
           // Small delay between requests to be safe
           await new Promise(r => setTimeout(r, 400));
      }`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/pages/Collection.tsx', code);
console.log("Updated handleFixImages to sequential");
