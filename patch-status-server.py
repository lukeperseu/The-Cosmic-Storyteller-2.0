import sys

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

endpoint = """
  // AI Status Check
  app.get("/api/ai-status", (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
    if (apiKey) {
      res.json({ online: true, message: "Conexão estabilizada." });
    } else {
      res.json({ online: false, message: "Falha de autenticação (API Key ausente)." });
    }
  });
"""

if "/api/ai-status" not in content:
    content = content.replace('app.post("/api/rules-search"', endpoint + '\n  app.post("/api/rules-search"')
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched server.ts with /api/ai-status")
else:
    print("Already patched server.ts")
