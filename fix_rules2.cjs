const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

rules = rules.replace(/match \/users2\/\{userId\}\/cards\/\{userCardId\}/g, "match /users2/{userId}/cards2/{userCardId}");

fs.writeFileSync('firestore.rules', rules);
console.log("Updated firestore.rules");
