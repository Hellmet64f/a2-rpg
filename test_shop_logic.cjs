const fetch = require('node-fetch');
async function test() {
  const res = await fetch('http://localhost:3000/api/shop/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anime: "Boruto", quantity: 1 })
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
test();
