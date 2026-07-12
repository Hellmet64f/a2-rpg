const fs = require('fs');
let code = fs.readFileSync('src/pages/Collection.tsx', 'utf-8');

const oldFunc = `  const handleFixImages = async () => {
    if (!user) return;
    setFixingImages(true);
    try {
      let updatedCount = 0;
      for (const card of cards) {
        if (!card.cardData.imageURL || card.cardData.imageURL.includes('dicebear') || card.cardData.imageURL.includes('default')) {
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
        }
      }
      if (updatedCount > 0) {
        alert(\`Fixed \${updatedCount} missing photos!\`);
        fetchCards();
      } else {
        alert("No missing photos could be fixed at this time.");
      }
    } catch (e) {
      console.error(e);
      alert("Error fixing photos");
    }
    setFixingImages(false);
  };`;

const newFunc = `  const handleFixImages = async () => {
    if (!user) return;
    setFixingImages(true);
    try {
      let updatedCount = 0;
      const cardsToFix = cards.filter(card => !card.cardData.imageURL || card.cardData.imageURL.includes('dicebear') || card.cardData.imageURL.includes('default'));
      
      if (cardsToFix.length === 0) {
         alert("All your cards already have photos!");
         setFixingImages(false);
         return;
      }

      await Promise.all(cardsToFix.map(async (card) => {
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
      }));

      if (updatedCount > 0) {
        alert(\`Fixed \${updatedCount} missing photos!\`);
        fetchCards();
      } else {
        alert("No missing photos could be fixed at this time. The characters might not have images available.");
      }
    } catch (e) {
      console.error(e);
      alert("Error fixing photos");
    }
    setFixingImages(false);
  };`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/pages/Collection.tsx', code);
console.log("Updated handleFixImages to parallel");
