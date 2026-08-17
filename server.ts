import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
