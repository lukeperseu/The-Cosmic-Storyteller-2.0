import sys

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

endpoint = """
  // Rules Search Route (Using Gemini with Google Search)
  app.post("/api/rules-search", async (req, res) => {
    try {
      const { query } = req.body;
      const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "API key missing" });
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: query,
        config: {
          systemInstruction: "Você é um assistente mestre de RPG (D&D 5e, Tormenta20, Pathfinder 2e, Call of Cthulhu, etc.). Sua função é responder dúvidas sobre regras, feitiços e mecânicas consultando a web. Responda de forma clara, direta e em português. Não divague.",
          tools: [{ googleSearch: {} }],
        }
      });
      
      res.json({ answer: response.text });
    } catch (error: any) {
      console.error("Error in rules search:", error);
      res.status(500).json({ error: error.message });
    }
  });
"""

if "/api/rules-search" not in content:
    content = content.replace('app.post("/api/narrator-pipeline"', endpoint + '\n  app.post("/api/narrator-pipeline"')
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched server.ts with /api/rules-search")
else:
    print("Already patched server.ts")
