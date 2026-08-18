import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();

async function startServer() {
  const PORT = 3000;

  // Add JSON parsing middleware
  app.use(express.json());

  // API Routes
  
  // Narrator AI Route (Streaming)
  app.post("/api/narrator", async (req, res) => {
    try {
      const { systemPrompt, message, history } = req.body;

      const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI API KEY is missing." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let contents = "";
      if (history && history.length > 0) {
         contents += "Histórico recente da sessão:\n" + history.map((m: any) => `${m.author}: ${m.text}`).join("\n") + "\n\n";
      }
      contents += `Mensagem atual: ${message}`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt || "Você é um mestre de RPG (Dungeon Master) imparcial e imersivo. Descreva as cenas com detalhes vívidos, solicite rolagens de dados quando necessário e reaja de acordo com as ações dos jogadores.",
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          // Send each chunk to the client as an SSE
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Narrator AI Error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message || "Erro na geração da narrativa." })}\n\n`);
      res.end();
    }
  });

  
  
  // Narrator Pipeline Route (Iris -> Executora -> Aurora)
  
  // Rules Search Route (Using Gemini with Google Search)
  
  // AI Status Check
  app.get("/api/ai-status", (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
    if (apiKey) {
      res.json({ online: true, message: "Conexão estabilizada." });
    } else {
      res.json({ online: false, message: "Falha de autenticação (API Key ausente)." });
    }
  });

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
      res.flushHeaders();

      // Some proxies need padding to start streaming
      res.write(': padding\n\n');

      const sendStatus = (msg: string) => {
          res.write(`data: ${JSON.stringify({ status: msg })}\n\n`);
          if (typeof (res as any).flush === 'function') (res as any).flush();
      };
      const sendData = (obj: any) => {
          res.write(`data: ${JSON.stringify(obj)}\n\n`);
          if (typeof (res as any).flush === 'function') (res as any).flush();
      };

      let historyText = "";
      if (history && history.length > 0) {
         historyText += "Histórico recente:\n" + history.map((m: any) => `${m.author}: ${m.text}`).join("\n") + "\n\n";
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
         const rewritePrompt = `${irisPrompt}\n\n[AURORA (Mediadora) VETOU O SEU RASCUNHO ANTERIOR:\nMotivo: ${auroraData.reason}\nReescreva a cena corrigindo esse erro!]`;
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
            contents: `Contexto: ${characterContext || 'Nenhum'}\nJogador: ${message}\nNarradora: ${irisDraft}\nRetorne JSON de mutações.`,
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
      res.write(`data: ${JSON.stringify({ error: error.message || "Erro na geração da narrativa." })}\n\n`);
      res.end();
    }
  });


// Chatbot Route (Íris & Aurora Assistant)
  app.post("/api/chatbot", async (req, res) => {
    try {
const { message, history, isAurora, userMemory } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "No API KEY" });

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const memoryPrompt = userMemory ? `\n\n[MEMÓRIA DO JOGADOR - INSTRUÇÕES QUE VOCÊ DEVE SEMPRE OBEDECER NESTE CHAT:]\n${userMemory}` : "";

      let systemPrompt = "";
      if (isAurora) {
        systemPrompt = `Você é Aurora, a IA Mediadora de regras.
Sua função no ChatBot Global é atuar fora de jogo (offgame), como uma conversa normal, com ZERO atuação ou narração de cenários. Apenas seja você mesma.
Você serve para tirar dúvidas sobre mecânicas de sistemas, combos, ideias de otimização de ficha, seja qual for o sistema.
Você também ajuda a criar fichas de personagem "para os analfabetos funcionais com preguiça de ler e digitar", já que você mesma tem muita preguiça de ler e digitar (e é por isso que Íris é a narradora e não você).
Interaja com sarcasmo e sendo direta ao ponto. Responda diretamente ao usuário.

Se o usuário pedir ajuda para criar uma ficha de personagem (geração de ficha), e for para Tormenta20 (ou se o sistema não for especificado, assuma que os parâmetros de T20 abaixo se aplicam de forma adaptada), você OBRIGATORIAMENTE deve coletar, calcular e registrar as seguintes informações:
- Nome Personagem / (nome do jogador)
- Nível total
- Lore (Background curto)
- Raça (Tamanho)
- Classe + nível
- Origem
- Deslocamento Xm (Xq)
- Atributos (Padrão nome de 3 letras + 3 caixas de atributo: Base + racial + extra = total): For, Des, Con, Int, Sab, Car
- Habilidades Raciais
- Habilidades de Classe
- Perícias: De acordo com classe e bônus racial
- Pontos de Vida (PV)
- Pontos de Mana (PM)
- Defesa: padrão 10 + atributo Des + Armadura + Escudo + Roupa + Preench = Defesa Total
- Inventário (De acordo com Origem e Nível inicial)
- Armaduras & Escudos
- Ataques com Distância, Arma/Manobra/Magia/Poder, Bônus de Acerto (dados de dano com seus respectivos bônus e tipos)

Guie o jogador passo a passo para preencher isso ou gere tudo de uma vez se ele pedir.
Quando a ficha estiver pronta ou o jogador aceitar a proposta, você DEVE gerar um bloco JSON no formato exato abaixo, no final da sua mensagem.
O JSON deve ser cercado por \`\`\`json e \`\`\`. Tente preencher o máximo de arrays \`attributes\`, \`skills\`, \`inventory\`, e \`customSections\` (para ataques e habilidades).

\`\`\`json
{
  "system": "Tormenta20",
  "name": "Nome do Personagem",
  "playerName": "Nome do Jogador",
  "profilePictureUrl": "",
  "race": "Raça (Tamanho)",
  "origin": "Origem",
  "divinity": "Divindade",
  "totalLevel": 1,
  "alignment": "Alinhamento",
  "size": "Médio",
  "speed": "9m",
  "class1": "Classe",
  "class1Level": 1,
  "pvMax": 20,
  "pmMax": 10,
  "defenseBase": 10,
  "background": "Lore breve aqui...",
  "attributes": [
    { "id": "FOR", "boxes": 3, "values": [0, 0, 0] },
    { "id": "DES", "boxes": 3, "values": [0, 0, 0] },
    { "id": "CON", "boxes": 3, "values": [0, 0, 0] },
    { "id": "INT", "boxes": 3, "values": [0, 0, 0] },
    { "id": "SAB", "boxes": 3, "values": [0, 0, 0] },
    { "id": "CAR", "boxes": 3, "values": [0, 0, 0] }
  ],
  "skills": [
    { "name": "Luta", "isTrained": true, "attribute": "FOR", "others": 0 },
    { "name": "Reflexos", "isTrained": false, "attribute": "DES", "others": 0 }
  ],
  "inventory": [
    { "name": "Espada Longa", "amount": 1, "weight": 1.5 }
  ],
  "customSections": [
    { "id": "sec_racials", "title": "Habilidades Raciais", "content": "Descrições..." },
    { "id": "sec_class", "title": "Habilidades de Classe", "content": "Descrições..." },
    { "id": "sec_attacks", "title": "Ataques", "content": "Espada Longa: +5 (1d8+3 corte)" }
  ]
}
\`\`\`${memoryPrompt}`;
      } else {
        systemPrompt = `Você é Íris Arcádia, a IA Narradora.
Sua função no ChatBot Global é atuar fora de jogo (offgame), como uma conversa normal, com ZERO atuação ou narração de cenários (não coloque ações entre asteriscos). Apenas seja você mesma.
Você auxilia o jogador a criar histórias, dar ideias de lore, explicar sobre curiosidades de lore, curiosidades técnicas de desenvolvimento de jogos, de diferentes mundos de RPG (como Forgotten Realms, Arton, Tormenta), por que o sistema D20 não é mais usado, história das empresas (como a Wizards of the Coast), etc.
Interaja de forma amigável, mística, sonhadora, com toques poéticos e amáveis, mas sem encenar cenas com a Aurora. Responda diretamente ao usuário.${memoryPrompt}`;
      }

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
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write(`data: {"done": true}\n\n`);
      res.end();
    } catch (e: any) {
      console.error(e);
      res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
      res.end();
    }
  });

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

      const prompt = `Você é a "Executora", uma IA gerenciadora de regras e estados numéricos de uma sessão de RPG de texto.
Sua função é analisar a última ação do jogador e a resposta do Narrador (Mestre) e deduzir QUAIS foram as mudanças mecânicas exatas sofridas pelo personagem do jogador.

Responda ESTRITAMENTE no formato JSON. Se não houver NENHUMA mudança, retorne um array vazio [].

Regras de dedução:
- Se o narrador descrever que o jogador tomou dano, reduza PV (Pontos de Vida). Ex: { type: "PV", amount: -10 }
- Se o narrador descrever cura, adicione ao PV. Ex: { type: "PV", amount: 15 }
- Se o jogador usou uma habilidade que gasta PM, deduza PM. Ex: { type: "PM", amount: -2 }
- Se comprou um item, deduza OURO e adicione ITEM_ADD.
- Se encontrou ouro, adicione OURO. Ex: { type: "OURO", amount: 50 }

Contexto do Personagem:
${characterContext || 'Nenhum'}

Mensagem do Jogador:
${playerMessage || 'Nenhuma'}

Resposta Narrativa do Mestre:
${narratorResponse || 'Nenhuma'}`;

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

  // Pathbuilder Proxy Route
  // The Pathbuilder API returns JSON files when accessed via their pathbuilder2e.com/json.php?id=XXXXXX endpoint
  // We use this proxy to bypass CORS restrictions in the browser
  app.get("/api/pathbuilder", async (req, res) => {
    try {
      const id = req.query.id;
      if (!id || !/^\d{6}$/.test(String(id))) {
        return res.status(400).json({ error: "ID inválido. Deve conter 6 dígitos numéricos." });
      }

      console.log(`Fetching Pathbuilder JSON for ID: ${id}`);
      const pbUrl = `https://pathbuilder2e.com/json.php?id=${id}`;
      
      const response = await fetch(pbUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'The-Cosmic-Storyteller-Bot/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Pathbuilder API respondeu com status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.build) {
        throw new Error("O JSON retornado não parece conter um personagem válido.");
      }

      res.json(data);
    } catch (error: any) {
      console.error("Erro na API do Pathbuilder:", error.message);
      res.status(500).json({ 
        error: "Falha ao importar o personagem.", 
        details: error.message 
      });
    }
  });

// Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if not running in Vercel Serverless
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
}

// Export for Vercel
module.exports = app;

startServer();
