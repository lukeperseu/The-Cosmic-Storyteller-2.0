import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
        if (isAurora) {
          replyDiv.innerHTML = `
            <img src="${window.globalAiConfig ? window.globalAiConfig.auroraAvatar : 'https://i.pinimg.com/736x/8c/fb/f0/8cfbf0f1c34a2e5d59046c3b6920f781.jpg'}" class="w-8 h-8 rounded-full object-cover border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] shrink-0 aurora-avatar-img">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="bg-[#0a1a10] text-[#39ff14] border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">IA MEDIADORA</span>
                <span class="font-bold text-[#39ff14] font-rajdhani">Aurora</span>
                <div class="flex items-center">
                  <span class="text-[10px] text-slate-500">Agora</span>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">${deleteBtn}</div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-[#0a1a10] via-[#050d08] to-[#0a1a10] border border-[#39ff14]/50 shadow-[0_0_8px_rgba(57,255,20,0.2)] p-3 rounded-2xl max-w-lg text-[#39ff14] leading-relaxed">
                Entendido. Analisando as regras para '${escapeHtml(text)}': Recomendo aplicar o modificador de atributo base e verificar o limite de carga antes do próximo turno.
              </div>
            </div>
          `;
        } else {
          replyDiv.innerHTML = `
            <img src="${window.globalAiConfig ? window.globalAiConfig.irisAvatar : 'https://i.pinimg.com/736x/88/f2/e8/88f2e825cd40939eb5110d195a6ecae4.jpg'}" class="w-8 h-8 rounded-full object-cover border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] shrink-0 iris-avatar-img">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="bg-purple-900 text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">IA NARRADORA</span>
                <span class="font-bold text-white font-rajdhani">Íris Arcádia</span>
                <div class="flex items-center">
                  <span class="text-[10px] text-slate-500">Agora</span>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">${deleteBtn}</div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-[#170a2c] via-[#100720] to-[#170a2c] border border-purple-500/50 shadow-neon-purple p-3 rounded-2xl max-w-lg text-slate-200 leading-relaxed">
                As estrelas murmuram sobre '${escapeHtml(text)}'... Que os ventos das nebulosas guiem seus passos através desta nova jornada!
              </div>
            </div>
          `;
        }
"""

# We'll use start/end to replace the exact block
start_str = "if (isAurora) {"
end_str = "feed.appendChild(replyDiv);"

idx1 = content.rfind(start_str)
idx2 = content.find(end_str, idx1)

if idx1 != -1 and idx2 != -1:
    content = content[:idx1] + replacement.strip() + "\n\n        " + content[idx2:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched dynamic chatbot block in index.html")
else:
    print("Could not find dynamic block boundaries")
