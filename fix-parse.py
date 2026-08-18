import sys
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""
    function parseChatbotResponse(text) {
       let html = escapeHtml(text);
       const jsonMatch = text.match(/```json([\s\S]*?)```/);
       if (jsonMatch) {
          try {
             const charData = JSON.parse(jsonMatch[1].trim());
             html = html.replace(/```json[\s\S]*?```/, '');
             html = html.replace(/\n/g, '<br>');
             
             const charId = "char_" + Date.now();
             window[charId] = charData;
             html += `
             <div class="mt-4 p-3 bg-cosmic-950/50 border border-emerald-500/30 rounded-xl">
               <h4 class="text-emerald-400 font-orbitron font-bold text-sm mb-2">✨ Ficha de ${charData.name || 'Personagem'} Pronta!</h4>
               <p class="text-xs text-slate-300 mb-3">Classe: ${charData.class1 || 'N/A'} | Raça: ${charData.race || 'N/A'}</p>
               <button onclick="importChatbotCharacter('${charId}')" class="w-full btn-emerald-neon text-white font-bold py-2 rounded-lg text-xs hover:scale-105 transition-transform">
                 📥 IMPORTAR PARA MINHA CONTA
               </button>
             </div>
             `;
             return html;
          } catch(e) {}
       }
       return html.replace(/\n/g, '<br>');
    }
"""

def replacer(m):
    return replacement.strip() + "\n"

content = re.sub(r'    function parseChatbotResponse\(text\) \{[\s\S]*?return html;\n    \}', replacer, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed parse logic")
