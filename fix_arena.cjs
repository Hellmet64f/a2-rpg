const fs = require('fs');
let code = fs.readFileSync('src/pages/Arena.tsx', 'utf-8');

const oldSetCards = `        for (const d of snap.docs) {
          const uCard = { id: d.id, ...d.data() } as UserCard;
          const cSnap = await getDoc(doc(db, 'cards', uCard.cardId));
          if (cSnap.exists()) {
            loaded.push({ ...uCard, cardData: { id: cSnap.id, ...cSnap.data() } as Card });
          }
        }
        setMyCards(loaded);`;

const newSetCards = `        for (const d of snap.docs) {
          const uCard = { id: d.id, ...d.data() } as UserCard;
          const cSnap = await getDoc(doc(db, 'cards', uCard.cardId));
          if (cSnap.exists()) {
            loaded.push({ ...uCard, cardData: { id: cSnap.id, ...cSnap.data() } as Card });
          }
        }
        loaded.sort((a, b) => b.cardData.power - a.cardData.power);
        setMyCards(loaded);`;

code = code.replace(oldSetCards, newSetCards);
fs.writeFileSync('src/pages/Arena.tsx', code);
