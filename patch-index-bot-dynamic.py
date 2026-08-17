import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
        const replyDiv = document.createElement('div');
        replyDiv.className = 'flex items-start space-x-3 group';

        const canDelAI = activeRole === 'OWNER' || activeRole === 'ADM';
        const delBtnAI = canDelAI ? `<button onclick="this.closest('.flex').remove()" class="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-950/30 transition-colors ml-2" title="Excluir"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>` : '';

        if (isAurora) {
          replyDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xs shrink-0">⚙️</div>
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="bg-[#0a1a10] text-[#39ff14] border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">IA MEDIADORA</span>
                <span class="font-bold text-[#39ff14] font-rajdhani">Aurora</span>
                <div class="flex items-center">
                  <span class="text-[10px] text-slate-500">Agora</span>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">${delBtnAI}</div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-[#0a1a10] via-[#050d08] to-[#0a1a10] border border-[#39ff14]/50 shadow-[0_0_8px_rgba(57,255,20,0.2)] p-3 rounded-2xl max-w-lg text-[#39ff14] leading-relaxed">
                Entendido. Analisando as regras para '${escapeHtml(text)}': Recomendo aplicar o modificador de atributo base e verificar o limite de carga antes do próximo turno.
              </div>
            </div>
          `;
        } else {
          replyDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-xs shrink-0">🔮</div>
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="bg-[#1a112c] text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">IA NARRADORA</span>
                <span class="font-bold text-white font-rajdhani">Íris Arcádia</span>
                <div class="flex items-center">
                  <span class="text-[10px] text-slate-500">Agora</span>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">${delBtnAI}</div>
                </div>
              </div>
              <div class="bg-gradient-to-r from-[#170a2c] via-[#100720] to-[#170a2c] border border-purple-500/50 shadow-neon-purple p-3 rounded-2xl max-w-lg text-slate-200 leading-relaxed">
                Eu ouvi "${escapeHtml(text)}"! A magia pulsa nas veias da sua narrativa. Você se depara com um mistério sombrio no horizonte... O que deseja fazer?
              </div>
            </div>
          `;
        }
"""

old_str = """
        const replyDiv = document.createElement('div');
        replyDiv.className = 'flex items-start space-x-3';

        if (isAurora) {
          replyDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xs">⚙️</div>
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="font-bold text-emerald-400 font-rajdhani">⚙️ Aurora (IA Mediadora)</span>
                <span class="text-[10px] text-slate-500">Agora</span>
              </div>
              <div class="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-2xl max-w-lg text-emerald-100 leading-relaxed">
                Entendido. Analisando as regras para '${escapeHtml(text)}': Recomendo aplicar o modificador de atributo base e verificar o limite de carga antes do próximo turno.
              </div>
            </div>
          `;
        } else {
          replyDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-xs">🔮</div>
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="font-bold text-purple-300 font-rajdhani">🔮 Íris (IA Narratora)</span>
                <span class="text-[10px] text-slate-500">Agora</span>
              </div>
              <div class="bg-purple-950/40 border border-purple-500/30 p-3 rounded-2xl max-w-lg text-purple-100 leading-relaxed">
                Eu ouvi "${escapeHtml(text)}"! A magia pulsa nas veias da sua narrativa. Você se depara com um mistério sombrio no horizonte... O que deseja fazer?
              </div>
            </div>
          `;
        }
"""

content = content.replace(old_str.strip(), replacement.strip())
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.html chatbot JS block")
