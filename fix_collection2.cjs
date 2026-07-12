const fs = require('fs');
let code = fs.readFileSync('src/pages/Collection.tsx', 'utf-8');

code = code.replace(/!card\.cardData\.imageURL \|\| card\.cardData\.imageURL\.includes\('dicebear'\)/g, 
  "!card.cardData.imageURL || card.cardData.imageURL.includes('dicebear') || card.cardData.imageURL.includes('default')");

code = code.replace(/data\.imageURL && !data\.imageURL\.includes\('dicebear'\)/g, 
  "data.imageURL && !data.imageURL.includes('dicebear') && !data.imageURL.includes('default')");

fs.writeFileSync('src/pages/Collection.tsx', code);
console.log("Updated Collection.tsx to fix default images too");
