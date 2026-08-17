const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const executorRoute = `
  // Executora AI Route (Mechanical Updates)
  app.post("/api/executor", async (req, res) => {
    try {
      const { playerMessage, narratorResponse, characterContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI API KEY is missing." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const schema = {
        type: "ARRAY",
        description: "Lista de mutações mecânicas baseadas na narrativa.",
        items: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING", description: "O tipo de recurso afetado: PV, PM, OURO, ITEM_ADD, ITEM_REMOVE" },
            amount: { type: "INTEGER", description: "A quantidade (positiva ou negativa). Ex: -5 para dano." },
            itemName: { type: "STRING", description: "O nome do item (apenas se type for ITEM_ADD ou ITEM_REMOVE)" },
            reason: { type: "STRING", description: "Uma justificativa curta para a mudança." }
          },
          required: ["type", "amount", "reason"]
        }
      };

      const prompt = \`Você é a "Executora", uma IA gerenciadora de regras e estados numéricos de uma sessão de RPG de texto.
Sua função é analisar a última ação do jogador e a resposta do Narrador (Mestre) e deduzir QUAIS foram as mudanças mecânicas exatas sofridas pelo personagem do jogador.

Responda ESTRITAMENTE no formato JSON. Se não houver NENHUMA mudança, retorne um array vazio [].

Regras de dedução:
- Se o narrador descrever que o jogador tomou dano, reduza PV (Pontos de Vida). Ex: { type: "PV", amount: -10 }
- Se o narrador descrever cura, adicione ao PV. Ex: { type: "PV", amount: 15 }
- Se o jogador usou uma habilidade que gasta PM, deduza PM. Ex: { type: "PM", amount: -2 }
- Se comprou um item, deduza OURO e adicione ITEM_ADD.
- Se encontrou ouro, adicione OURO. Ex: { type: "OURO", amount: 50 }

Contexto do Personagem:
\${characterContext || 'Nenhum'}

Mensagem do Jogador:
\${playerMessage || 'Nenhuma'}

Resposta Narrativa do Mestre:
\${narratorResponse || 'Nenhuma'}\`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema as any,
          systemInstruction: "Você é a Executora, uma IA exata e lógica. Trabalhe com precisão matemática.",
          temperature: 0.0
        }
      });

      let jsonString = response.text || "[]";
      res.json(JSON.parse(jsonString));
    } catch (error: any) {
      console.error("Executor AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
`;

if (!code.includes('/api/executor')) {
  code = code.replace('// Pathbuilder Proxy Route', executorRoute + '\n  // Pathbuilder Proxy Route');
  fs.writeFileSync('server.ts', code, 'utf8');
  console.log("Patched server.ts successfully");
} else {
  console.log("Already patched");
}
