import sys
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""
      // Real AI Chatbot integration
      window.chatbotHistory = window.chatbotHistory || [];
      const historyCopy = [...window.chatbotHistory];
      window.chatbotHistory.push({ role: 'user', text });

      const replyDiv = document.createElement('div');
      replyDiv.className = 'flex items-start space-x-3 mt-4';
      
      const isAurora = text.toLowerCase().includes('aurora') || text.toLowerCase().includes('ficha') || text.toLowerCase().includes('regra');
      const avatarSrc = isAurora ? (window.globalAiConfig ? window.globalAiConfig.auroraAvatar : 'https://i.pinimg.com/736x/8c/fb/f0/8cfbf0f1c34a2e5d59046c3b6920f781.jpg') : (window.globalAiConfig ? window.globalAiConfig.irisAvatar : 'https://i.pinimg.com/736x/88/f2/e8/88f2e825cd40939eb5110d195a6ecae4.jpg');
      const aiName = isAurora ? 'Aurora' : 'Íris Arcádia';
      const aiBadge = isAurora ? '<span class="bg-[#0a1a10] text-[#3DC788] border border-[#3DC788] shadow-[0_0_5px_rgba(61,199,136,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">IA MEDIADORA</span>' : '<span class="bg-purple-900 text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">IA NARRADORA</span>';
      const borderColor = isAurora ? 'border-[#3DC788]' : 'border-red-500';
      const shadowColor = isAurora ? 'shadow-[0_0_5px_rgba(61,199,136,0.5)]' : 'shadow-[0_0_5px_rgba(239,68,68,0.5)]';
      const textClass = isAurora ? 'text-[#3DC788]' : 'text-white';
      const bgClass = isAurora ? 'bg-gradient-to-r from-[#0a1a10] via-[#050d08] to-[#0a1a10] border-[#3DC788]/50 shadow-[0_0_8px_rgba(61,199,136,0.2)]' : 'bg-gradient-to-r from-[#170a2c] via-[#100720] to-[#170a2c] border-purple-500/50 shadow-neon-purple';

      replyDiv.innerHTML = `
        <img src="${avatarSrc}" class="w-8 h-8 rounded-full object-cover border ${borderColor} ${shadowColor} shrink-0">
        <div class="w-full">
          <div class="flex items-center space-x-2 mb-1">
            ${aiBadge}
            <span class="font-bold ${textClass} font-rajdhani">${aiName}</span>
            <div class="flex items-center">
              <span class="text-[10px] text-slate-500">Agora</span>
            </div>
          </div>
          <div class="message-content ${bgClass} border p-3 rounded-2xl w-full max-w-lg text-slate-200 leading-relaxed text-xs">
            <span class="animate-pulse">Gerando resposta...</span>
          </div>
        </div>
      `;
      feed.appendChild(replyDiv);
      feed.scrollTop = feed.scrollHeight;

      fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyCopy })
      }).then(async (res) => {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        const contentDiv = replyDiv.querySelector('.message-content');
        contentDiv.innerHTML = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\\n\\n');
          for (let line of lines) {
            if (line.startsWith('data: ')) {
               try {
                  const data = JSON.parse(line.substring(6));
                  if (data.text) {
                     fullText += data.text;
                     contentDiv.innerHTML = parseChatbotResponse(fullText);
                     feed.scrollTop = feed.scrollHeight;
                  }
               } catch(e) {}
            }
          }
        }
        window.chatbotHistory.push({ role: 'model', text: fullText });
      }).catch(err => {
        const contentDiv = replyDiv.querySelector('.message-content');
        contentDiv.innerHTML = "Erro ao contactar a IA.";
      });
    }

    function parseChatbotResponse(text) {
       // Look for json code blocks for character sheet
       let html = escapeHtml(text).replace(/\\n/g, '<br>');
       const jsonMatch = text.match(/```json([\\s\\S]*?)```/);
       if (jsonMatch) {
          try {
             const charData = JSON.parse(jsonMatch[1].trim());
             // Remove the json block from visible text
             html = html.replace(/```json[\\s\\S]*?```/, '');
             
             // Add a "Save Character" button
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
          } catch(e) {}
       }
       return html;
    }
    
    window.importChatbotCharacter = async function(varName) {
       const charData = window[varName];
       if (!charData) return;
       if (!window.currentGoogleUser) {
          showToast("Faça login com Google para salvar a ficha!", "error");
          return;
       }
       showToast("Salvando ficha no Firebase...", "info");
       try {
          if (window.saveCharacter) {
             const newId = await window.saveCharacter(charData, window.currentGoogleUser.uid);
             showToast("Ficha salva com sucesso! ID: " + newId, "success");
             // Refresh characters list
             if (window.loadMyCharacters) window.loadMyCharacters();
          } else {
             showToast("Módulo de banco de dados não carregado.", "error");
          }
       } catch(e) {
          showToast("Erro ao salvar: " + e.message, "error");
       }
    }
"""

old_regex = r"      // Generate AI Response \(Íris or Aurora based on prompt keywords\)[\s\S]*?    function escapeHtml\(str\) \{"

# Because we are replacing with regex, we should use a function that returns the replacement string directly
# to avoid interpretation of backslashes.
def replacer(match):
    return replacement.strip() + "\n\n    function escapeHtml(str) {"

content = re.sub(old_regex, replacer, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched handleSendChatbot")
