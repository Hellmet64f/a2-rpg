const fs = require('fs');
let code = fs.readFileSync('src/pages/Shop.tsx', 'utf-8');

const regex = /await updateDoc\(doc\(db, 'users', user\.uid\), {\s+points: \(profile\.points \|\| 0\) - cost\s+}\);\s+const data = await res\.json\(\);/;

const replacement = `await updateDoc(doc(db, 'users', user.uid), {
        points: (profile.points || 0) - cost
      });

      const fetchPromise = fetch('/api/shop/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anime, quantity })
      });
      const timerPromise = new Promise(r => setTimeout(r, 2000));
      const [res] = await Promise.all([fetchPromise, timerPromise]);

      const data = await res.json();`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Shop.tsx', code);
