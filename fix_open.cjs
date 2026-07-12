const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldCode = `    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const characters = JSON.parse(response.text || '[]');`;

const newCode = `    let characters = [];
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      characters = JSON.parse(response.text || '[]');
    } catch (apiError) {
      console.warn("Primary model failed, attempting fallback...", apiError);
      try {
        const response2 = await ai.models.generateContent({
          model: 'gemini-1.5-flash-8b',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        characters = JSON.parse(response2.text || '[]');
      } catch (fallbackError) {
        console.error("Fallback also failed, using default characters.", fallbackError);
        // Provide default dummy characters based on the requested anime to avoid complete failure
        characters = rolls.map((r, i) => ({
          name: \`Unknown \${anime} Character \${i+1}\`,
          searchQuery: anime,
          rarity: r,
          power: r === 'mythic' ? 150 : r === 'legendary' ? 100 : r === 'epic' ? 60 : 25,
          resistance: r === 'mythic' ? 150 : r === 'legendary' ? 100 : r === 'epic' ? 60 : 25,
          isShiny: Math.random() < 0.05
        }));
      }
    }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
console.log("Updated server.ts");
