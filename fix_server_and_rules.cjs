const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf-8');
rules = rules.replace('incoming().keys().size() <= 8', 'incoming().keys().size() <= 10');
fs.writeFileSync('firestore.rules', rules);

let server = fs.readFileSync('server.ts', 'utf-8');
const oldRolls = `      if (r > 0.98) rarity = 'mythic';
      else if (r > 0.85) rarity = 'legendary';
      else if (r > 0.60) rarity = 'epic';`;
const newRolls = `      if (r > 0.98) rarity = 'mythic';
      else if (r > 0.85) rarity = 'legendary';
      else if (r > 0.60) rarity = 'epic';
      else if (r > 0.30) rarity = 'rare';`;
server = server.replace(oldRolls, newRolls);
fs.writeFileSync('server.ts', server);

