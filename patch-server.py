import sys

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

chatbot_route = """
  // Chatbot Route (Íris & Aurora Assistant)
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "No API KEY" });

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: apiKey });

      const systemPrompt = `Você representa as IAs Íris (Narradora) e Aurora (Mediadora).
O usuário está no 'Chatbot Global', fora de uma campanha específica.
Se o usuário pedir ajuda para criar uma ficha de personagem (geração de ficha), Aurora deve assumir a liderança. Ela fará perguntas sobre o conceito do personagem (Raça, Classe, Nome, Atributos) e guiará o jogador passo a passo ou gerará uma ficha completa se ele pedir.
Quando a ficha estiver pronta ou o jogador aceitar a proposta, você DEVE gerar um bloco JSON no formato exato abaixo, no final da sua mensagem.
O JSON deve ser cercado por \`\`\`json e \`\`\`.

\`\`\`json
{
  "system": "Ordos",
  "name": "Nome do Personagem",
  "playerName": "Nome do Jogador",
  "profilePictureUrl": "url da foto (opcional)",
  "race": "Raça",
  "origin": "Origem",
  "divinity": "Divindade",
  "totalLevel": 1,
  "alignment": "Alinhamento",
  "size": "Médio",
  "speed": "9m",
  "class1": "Classe",
  "class1Level": 1
}
\`\`\`

Interaja de forma cômica e sarcástica (Aurora) ou mística e sonhadora (Íris).`;

      const formattedHistory = (history || []).map((h: any) => ({
         role: h.role === 'user' ? 'user' : 'model',
         parts: [{ text: h.text }]
      }));

      // Append current message
      formattedHistory.push({ role: 'user', parts: [{ text: message }] });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.6-flash",
        contents: formattedHistory,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\\n\\n`);
        }
      }
      res.write(`data: {"done": true}\\n\\n`);
      res.end();
    } catch (e: any) {
      console.error(e);
      res.write(`data: ${JSON.stringify({ error: e.message })}\\n\\n`);
      res.end();
    }
  });

"""

# Insert before 'app.post("/api/executor"'
content = content.replace('  // Executora AI Route', chatbot_route + '  // Executora AI Route')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched server.ts")
