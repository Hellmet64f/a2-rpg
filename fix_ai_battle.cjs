const fs = require('fs');
let code = fs.readFileSync('src/pages/AiBattle.tsx', 'utf-8');

const oldSetCards = `            loaded.push({ ...uCard, cardData: { id: cSnap.id, ...cSnap.data() } as Card });
          }
        }
        setMyCards(loaded);`;

const newSetCards = `            loaded.push({ ...uCard, cardData: { id: cSnap.id, ...cSnap.data() } as Card });
          }
        }
        loaded.sort((a, b) => b.cardData.power - a.cardData.power);
        setMyCards(loaded);`;

code = code.replace(oldSetCards, newSetCards);

fs.writeFileSync('src/pages/AiBattle.tsx', code);
