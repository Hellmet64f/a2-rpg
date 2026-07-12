const fs = require('fs');
let code = fs.readFileSync('src/pages/Collection.tsx', 'utf-8');
code = code.replace(
  "import { Loader2, Plus, Trash2 } from 'lucide-react';",
  "import { Loader2, Plus, Trash2, Edit3 } from 'lucide-react';"
);

const handleEditPhotoStr = `
  const handleEditPhoto = async (cardId: string) => {
    const newUrl = prompt("Enter a new image URL from Google (or anywhere else):");
    if (!newUrl || !newUrl.trim()) return;
    try {
      await updateDoc(doc(db, 'cards', cardId), { imageURL: newUrl.trim() });
      setCards(cards.map(c => c.cardData.id === cardId ? { ...c, cardData: { ...c.cardData, imageURL: newUrl.trim() } } : c));
    } catch (e) {
      console.error(e);
      alert("Failed to update image.");
    }
  };
`;
code = code.replace(
  "const handleDelete = async (userCardId: string) => {",
  handleEditPhotoStr + "\n  const handleDelete = async (userCardId: string) => {"
);

code = code.replace(
  /<button\s+onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleDelete\(c\.id\); \}\}\s+className="absolute top-0 right-0 z-50 bg-red-500 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg cursor-pointer"\s*>\s*<Trash2 size=\{20\} \/>\s*<\/button>/,
  `
              <div className="absolute top-0 right-0 z-50 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} 
                  className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 hover:scale-110 shadow-lg cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditPhoto(c.cardData.id); }} 
                  className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 hover:scale-110 shadow-lg cursor-pointer"
                  title="Change Photo"
                >
                  <Edit3 size={20} />
                </button>
              </div>
  `
);
fs.writeFileSync('src/pages/Collection.tsx', code);
