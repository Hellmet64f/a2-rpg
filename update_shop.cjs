const fs = require('fs');
let code = fs.readFileSync('src/pages/Shop.tsx', 'utf-8');

// Replace newCard with newCards
code = code.replace(
  'const [newCard, setNewCard] = useState<Card | null>(null);',
  'const [newCards, setNewCards] = useState<Card[] | null>(null);'
);

// We need to change the logic in handleBuyPack to support quantity.
const oldHandleBuy = `  const handleBuyPack = async (anime: string) => {
    if (!user || !profile) return;
    if ((profile.points || 0) < 100) {
      alert("You need 100 points to buy a pack. Fight in the Arena or vs AI to earn more!");
      return;
    }
    setOpening(anime);
    await new Promise(r => setTimeout(r, 2000)); // wait for opening animation
    try {
      const cardData = await robo3.openPack(anime);
      
      const q = query(collection(db, 'users', user.uid, 'cards'));
      const snap = await getDocs(q);
      
      let foundDuplicate = false;
      let existingUserCardId = '';
      let existingCardId = '';
      let currentLevel = 1;

      for (const d of snap.docs) {
        const c = d.data();
        if (c.cardName === cardData.name) {
          foundDuplicate = true;
          existingUserCardId = d.id;
          existingCardId = c.cardId;
          currentLevel = c.level || 1;
          break;
        } else if (!c.cardName) {
           const globalCardSnap = await getDoc(doc(db, 'cards', c.cardId));
           if (globalCardSnap.exists() && globalCardSnap.data().name === cardData.name) {
             foundDuplicate = true;
             existingUserCardId = d.id;
             existingCardId = c.cardId;
             currentLevel = c.level || 1;
             break;
           }
        }
      }

      await updateDoc(doc(db, 'users', user.uid), {
        points: (profile.points || 0) - 100
      });

      if (foundDuplicate) {
        await updateDoc(doc(db, 'users', user.uid, 'cards', existingUserCardId), {
          level: currentLevel + 1,
          cardName: cardData.name
        });
        setNewCard({ id: existingCardId, ...cardData, level: currentLevel + 1 } as Card);
      } else {
        const newCardId = \`card_\${Date.now()}_\${Math.random().toString(36).substring(2)}\`;
        await setDoc(doc(db, 'cards', newCardId), { ...cardData, createdAt: Date.now() });
        const userCardId = \`uc_\${Date.now()}\`;
        await setDoc(doc(db, 'users', user.uid, 'cards', userCardId), {
          cardId: newCardId,
          cardName: cardData.name,
          acquiredAt: Date.now(),
          level: 1
        });
        setNewCard({ id: newCardId, ...cardData, level: 1 } as Card);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to open pack.");
    }
    setOpening(null);
  };`;

const newHandleBuy = `  const handleBuyPack = async (anime: string, quantity: number = 1) => {
    if (!user || !profile) return;
    const cost = 100 * quantity;
    if ((profile.points || 0) < cost) {
      alert(\`You need \${cost} points to buy \${quantity} pack(s).\`);
      return;
    }
    
    // Anti-bot basic client check
    const lastOpen = parseInt(localStorage.getItem('lastPackOpen') || '0');
    if (Date.now() - lastOpen < 1000) {
      alert("Opening packs too fast! Please wait a moment.");
      return;
    }
    localStorage.setItem('lastPackOpen', Date.now().toString());

    setOpening(anime);
    await new Promise(r => setTimeout(r, 2000)); // wait for opening animation
    try {
      const q = query(collection(db, 'users', user.uid, 'cards'));
      const snap = await getDocs(q);
      
      const userCardsMap = new Map();
      
      for (const d of snap.docs) {
        const c = d.data();
        if (c.cardName) {
           userCardsMap.set(c.cardName, { id: d.id, cardId: c.cardId, level: c.level || 1 });
        } else {
           const globalCardSnap = await getDoc(doc(db, 'cards', c.cardId));
           if (globalCardSnap.exists()) {
             userCardsMap.set(globalCardSnap.data().name, { id: d.id, cardId: c.cardId, level: c.level || 1 });
           }
        }
      }

      await updateDoc(doc(db, 'users', user.uid), {
        points: (profile.points || 0) - cost
      });

      const pulledCards = [];
      for(let i=0; i<quantity; i++) {
         const cardData = await robo3.openPack(anime);
         
         if (userCardsMap.has(cardData.name)) {
            const existing = userCardsMap.get(cardData.name);
            const newLevel = existing.level + 1;
            await updateDoc(doc(db, 'users', user.uid, 'cards', existing.id), {
              level: newLevel,
              cardName: cardData.name
            });
            existing.level = newLevel; // Update local map for next iteration if same card pulled twice
            pulledCards.push({ id: existing.cardId, ...cardData, level: newLevel } as Card);
         } else {
            const newCardId = \`card_\${Date.now()}_\${i}_\${Math.random().toString(36).substring(2)}\`;
            await setDoc(doc(db, 'cards', newCardId), { ...cardData, createdAt: Date.now() });
            const userCardId = \`uc_\${Date.now()}_\${i}\`;
            await setDoc(doc(db, 'users', user.uid, 'cards', userCardId), {
              cardId: newCardId,
              cardName: cardData.name,
              acquiredAt: Date.now(),
              level: 1
            });
            userCardsMap.set(cardData.name, { id: userCardId, cardId: newCardId, level: 1 });
            pulledCards.push({ id: newCardId, ...cardData, level: 1 } as Card);
         }
      }
      setNewCards(pulledCards);
    } catch (err) {
      console.error(err);
      alert("Failed to open pack.");
    }
    setOpening(null);
  };`;

code = code.replace(oldHandleBuy, newHandleBuy);

fs.writeFileSync('src/pages/Shop.tsx', code);
