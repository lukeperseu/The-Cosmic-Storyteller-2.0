import sys

with open('server.ts', 'r', encoding='utf-8') as f:
    code = f.read()

new_route = """
  // Narrator Pipeline Route (Iris -> Executora -> Aurora)
  app.post("/api/narrator-pipeline", async (req, res) => {
    try {
      const { systemPrompt, message, history, characterContext } = req.body;

      const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI API KEY is missing." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendStatus = (msg: string) => res.write(`data: ${JSON.stringify({ status: msg })}\\n\\n`);
      const sendData = (obj: any) => res.write(`data: ${JSON.stringify(obj)}\\n\\n`);

      let historyText = "";
      if (history && history.length > 0) {
         historyText += "Histórico recente:\\n" + history.map((m: any) => `${m.author}: ${m.text}`).join("\\n") + "\\n\\n";
      }
      
      // -- Phase 1: Iris Draft --
      sendStatus("Íris está analisando... Conjecturando eventos...");
      
      const irisPrompt = `${historyText}Mensagem atual do jogador: ${message}`;
      const irisRes = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: irisPrompt,
        config: {
          systemInstruction: systemPrompt || "Você é Íris Arcádia, narradora de RPG.",
          temperature: 0.7
        }
      });
      let irisDraft = irisRes.text || "";

      // -- Phase 2: Executora --
      sendStatus("O tomo da Executora brilha bruxuleante...");
      
      const execSchema = {
        type: "ARRAY",
        description: "Lista de mutações mecânicas.",
        items: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING" },
            amount: { type: "INTEGER" },
            itemName: { type: "STRING" },
            reason: { type: "STRING" }
          },
          required: ["type", "amount", "reason"]
        }
      };

      const execPrompt = `Você é a Executora, IA gerenciadora mecânica.
Contexto: ${characterContext || 'Nenhum'}
Jogador: ${message}
Narradora (Íris): ${irisDraft}

Retorne um JSON com mutações (PV, PM, OURO, ITEM_ADD, ITEM_REMOVE) se aplicável.`;

      const execRes = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: execPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: execSchema as any,
          temperature: 0.0
        }
      });
      
      let mutations = [];
      try {
        mutations = JSON.parse(execRes.text || "[]");
      } catch(e) {}

      // -- Phase 3: Aurora (Mediadora) --
      sendStatus("Aurora: Vejamos... *lendo o tomo e encarando Íris*...");

      const auroraSchema = {
        type: "OBJECT",
        properties: {
          approved: { type: "BOOLEAN", description: "Se a narração e mutações seguem as regras." },
          reason: { type: "STRING", description: "Motivo do veto, se reprovado. Para a Íris corrigir." },
          auroraComment: { type: "STRING", description: "Opcional. Mensagem de Aurora em off reclamando ou dando bronca nos jogadores ou em Íris." }
        },
        required: ["approved"]
      };

      const auroraPrompt = `Você é Aurora, a Mediadora. Ácida, sarcástica, sincera, excessivamente objetiva e lógica.
Sua função é auditar a Narradora (Íris) e as Mutações geradas (Executora).
O jogador tentou usar algo que não tem? A Íris deixou algo de graça? A Íris alucinou uma regra? Se sim, vete (approved: false).

Contexto da ficha:
${characterContext || 'Nenhum'}

Ação do Jogador:
${message}

Rascunho de Íris:
${irisDraft}

Mutações mecânicas deduzidas:
${JSON.stringify(mutations, null, 2)}
`;

      const auroraRes = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: auroraPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: auroraSchema as any,
          temperature: 0.2
        }
      });

      let auroraData = { approved: true, reason: "", auroraComment: "" };
      try {
        auroraData = JSON.parse(auroraRes.text || "{}");
      } catch(e) {}

      if (!auroraData.approved) {
         sendStatus(`Aurora: "Íris, foca caramba! Ignora os passarinhos!! Refazendo..."`);
         const rewritePrompt = `${irisPrompt}\\n\\n[AURORA (Mediadora) VETOU O SEU RASCUNHO ANTERIOR:\\nMotivo: ${auroraData.reason}\\nReescreva a cena corrigindo esse erro!]`;
         const rewriteRes = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: rewritePrompt,
            config: {
              systemInstruction: systemPrompt || "Você é Íris Arcádia, narradora de RPG.",
              temperature: 0.5
            }
         });
         irisDraft = rewriteRes.text || irisDraft;
         
         // Re-run executora
         const execRes2 = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: `Contexto: ${characterContext || 'Nenhum'}\\nJogador: ${message}\\nNarradora: ${irisDraft}\\nRetorne JSON de mutações.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: execSchema as any,
              temperature: 0.0
            }
         });
         try { mutations = JSON.parse(execRes2.text || "[]"); } catch(e) {}
      }

      sendStatus("Aurora Approves!");
      
      // Delay slightly for effect
      await new Promise(r => setTimeout(r, 800));

      // -- Phase 4: Final Stream to client --
      // We chunk the text to simulate typing
      const words = irisDraft.split(' ');
      for(let i=0; i<words.length; i+=3) {
         sendData({ text: words.slice(i, i+3).join(' ') + ' ' });
         await new Promise(r => setTimeout(r, 40));
      }

      // Send mutations and comments
      if (mutations.length > 0) {
         sendData({ mutations });
      }
      if (auroraData.auroraComment && auroraData.auroraComment.trim().length > 0) {
         sendData({ auroraComment: auroraData.auroraComment });
      }

      sendData({ done: true });
      res.end();

    } catch (error: any) {
      console.error("Narrator Pipeline Error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message || "Erro na geração da narrativa." })}\\n\\n`);
      res.end();
    }
  });
"""

if "/api/narrator-pipeline" not in code:
    code = code.replace('// Executora AI Route', new_route + '\n  // Executora AI Route')
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Added pipeline route")
else:
    print("Pipeline route already exists")
