const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

rules = rules.replace(
  /!\("createdAt" in data\) \|\| data\.createdAt is number\);/,
  `!("createdAt" in data) || data.createdAt is number) &&
             (!("searchQuery" in data) || (data.searchQuery is string && data.searchQuery.size() <= 100));`
);

fs.writeFileSync('firestore.rules', rules);
console.log("Updated firestore.rules");
