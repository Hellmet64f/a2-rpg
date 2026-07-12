const fetch = require('node-fetch');
async function test() {
  const query = `
  query ($search: String) {
    Character(search: $search) {
      image {
        large
      }
    }
  }`;
  for (const name of ["Sasuke Uchiha", "Sarada Uchiha", "Mitsuki", "Shikadai Nara", "Boruto"]) {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { search: name } })
    });
    const json = await res.json();
    console.log(name, json.data?.Character?.image?.large);
  }
}
test();
