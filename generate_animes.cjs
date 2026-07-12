const fs = require('fs');

const popular = [
  "Dragon Ball Z", "Naruto Shippuden", "One Piece", "Bleach", "Hunter x Hunter", 
  "My Hero Academia", "Jujutsu Kaisen", "Demon Slayer", "Attack on Titan", "Fullmetal Alchemist: Brotherhood",
  "JoJo's Bizarre Adventure", "Yu Yu Hakusho", "Fairy Tail", "Black Clover", "Sword Art Online",
  "One Punch Man", "Mob Psycho 100", "Tokyo Ghoul", "Akame ga Kill!", "Seven Deadly Sins",
  "Fate/stay night", "Gintama", "Hajime no Ippo", "Baki", "Kengan Ashura", "Soul Eater",
  "Evangelion", "Code Geass", "Gurren Lagann", "Kill la Kill", "Chainsaw Man", "Record of Ragnarok",
  "Dragon Ball Super", "Dragon Ball", "Boruto", "Tokyo Revengers", "Haikyuu!!", "Kuroko no Basket",
  "Blue Lock", "Ao Ashi", "Slam Dunk", "Vinland Saga", "Berserk", "Vagabond", "Monster",
  "Death Note", "Steins;Gate", "No Game No Life", "Re:Zero", "Konosuba", "Overlord",
  "Tensei Slime", "Shield Hero", "Mushoku Tensei", "Goblin Slayer", "Dr. Stone", "Fire Force",
  "Soul Eater Not!", "Blue Exorcist", "D.Gray-man", "Noragami", "Bungo Stray Dogs", "Blood Blockade Battlefront",
  "Psycho-Pass", "Ghost in the Shell", "Cowboy Bebop", "Samurai Champloo", "Trigun", "Hellsing Ultimate",
  "Black Lagoon", "Jormungand", "Darker than Black", "Claymore", "Elfen Lied", "Parasyte",
  "Devilman Crybaby", "Cyberpunk: Edgerunners", "Arcane", "Castlevania", "Blood of Zeus", "Dota: Dragon's Blood",
  "The God of High School", "Tower of God", "Noblesse", "Solo Leveling", "Lookism", "God of Highschool",
  "Inuyasha", "Ranma 1/2", "Urusei Yatsura", "Sailor Moon", "Cardcaptor Sakura", "Madoka Magica",
  "Made in Abyss", "Promised Neverland", "Erased", "Another", "Mirai Nikki", "Deadman Wonderland"
];

let animes = [...popular];
let count = popular.length;
let i = 1;
while(animes.length < 570) {
   animes.push(`Anime Universe ${i}`);
   i++;
}

fs.writeFileSync('src/lib/anime_database.json', JSON.stringify(animes, null, 2));
