const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

// Add allow update to cards2
code = code.replace(
  `match /cards2/{cardId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isValidId(cardId) && isValidCard(incoming()) && incoming().keys().size() <= 10;
    }`,
  `match /cards2/{cardId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isValidId(cardId) && isValidCard(incoming()) && incoming().keys().size() <= 10;
      allow update: if isSignedIn();
    }`
);

fs.writeFileSync('firestore.rules', code);
