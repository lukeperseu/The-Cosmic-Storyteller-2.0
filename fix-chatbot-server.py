import sys
import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""
  // Chatbot Route (Íris & Aurora Assistant)
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, history, isAurora } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "No API KEY" });

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: apiKey });

      let systemPrompt = "";
      if (isAurora) {
        systemPrompt = `Você é Aurora, a IA Mediadora de regras.
Sua função no ChatBot Global é atuar fora de jogo (offgame), como uma conversa normal, com ZERO atuação ou narração de cenários. Apenas seja você mesma.
Você serve para tirar dúvidas sobre mecânicas de sistemas, combos, ideias de otimização de ficha, seja qual for o sistema.
Você também ajuda a criar fichas de personagem "para os analfabetos funcionais com preguiça de ler e digitar", já que você mesma tem muita preguiça de ler e digitar (e é por isso que Íris é a narradora e não você).
Interaja com sarcasmo e sendo direta ao ponto, sem encenar cenas com a Íris. Responda diretamente ao usuário.

Se o usuário pedir ajuda para criar uma ficha de personagem (geração de ficha), faça perguntas sobre o conceito do personagem (Raça, Classe, Nome, Atributos) e guie o jogador passo a passo ou gere uma ficha completa se ele pedir.
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
`;
      } else {
        systemPrompt = `Você é Íris Arcádia, a IA Narradora.
Sua função no ChatBot Global é atuar fora de jogo (offgame), como uma conversa normal, com ZERO atuação ou narração de cenários (não coloque ações entre asteriscos). Apenas seja você mesma.
Você auxilia o jogador a criar histórias, dar ideias de lore, explicar sobre curiosidades de lore, curiosidades técnicas de desenvolvimento de jogos, de diferentes mundos de RPG (como Forgotten Realms, Arton, Tormenta), por que o sistema D20 não é mais usado, história das empresas (como a Wizards of the Coast), etc.
Interaja de forma amigável, mística, sonhadora, com toques poéticos e amáveis, mas sem encenar cenas com a Aurora. Responda diretamente ao usuário.`;
      }
"""

def replacer(m):
    return replacement.strip()

old_regex = r"  // Chatbot Route \(Íris & Aurora Assistant\)[\s\S]*?Interaja de forma cômica e sarcástica \(Aurora\) ou mística e sonhadora \(Íris\)\.`;"
content = re.sub(old_regex, replacer, content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched chatbot server")
