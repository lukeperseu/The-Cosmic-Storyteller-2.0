import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace static Aurora and Iris badges/styling in Global Chat
global_chat_replace = """
        <!-- Msg 2: Íris (IA) -->
        <div class="flex items-start space-x-2.5 group">
          <div class="w-8 h-8 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-xs">
            🔮
          </div>
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="bg-[#1a112c] text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">
                IA NARRADORA
              </span>
              <span class="font-bold text-white font-rajdhani">Íris Arcádia</span>
              <span class="text-[10px] text-slate-500">10:06</span>
            </div>
            <div class="bg-gradient-to-r from-[#170a2c] via-[#100720] to-[#170a2c] border border-purple-500/50 shadow-neon-purple p-2.5 rounded-xl max-w-md text-slate-200">
              Eu estou perfeitamente ativa, Mestre Kaito. Pronta para destruir seus jogadores.
            </div>
          </div>
        </div>

        <!-- Msg 3: Aurora (IA) -->
        <div class="flex items-start space-x-2.5 group">
          <div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xs">
            ⚙️
          </div>
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="bg-[#0a1a10] text-[#39ff14] border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">
                IA MEDIADORA
              </span>
              <span class="font-bold text-[#39ff14] font-rajdhani">Aurora</span>
              <span class="text-[10px] text-slate-500">10:06</span>
            </div>
            <div class="bg-gradient-to-r from-[#0a1a10] via-[#050d08] to-[#0a1a10] border border-[#39ff14]/50 shadow-[0_0_8px_rgba(57,255,20,0.2)] p-2.5 rounded-xl max-w-md text-[#39ff14]">
              Ignore o dramalhão dela. Os sistemas de regras estão 100% operacionais, aguardando consultas mecânicas.
            </div>
          </div>
        </div>
"""

idx = content.find("<!-- Msg 2: Íris (IA) -->")
idx_end = content.find("<!-- Msg 4: Aventureiro Convidado -->")
if idx != -1 and idx_end != -1:
    content = content[:idx] + global_chat_replace.strip() + "\n\n        " + content[idx_end:]


# Replace Chatbot Static Initial Messages
chatbot_replace = """
        <!-- Msg 1: Íris -->
        <div class="flex items-start space-x-3 group">
          <div class="w-8 h-8 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-xs shrink-0">
            🔮
          </div>
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="font-bold text-white font-rajdhani">Íris Arcádia</span>
              <span class="bg-[#1a112c] text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">
                IA NARRADORA
              </span>
              <span class="text-[10px] text-slate-500">Agora</span>
            </div>
            <div class="bg-gradient-to-r from-[#170a2c] via-[#100720] to-[#170a2c] border border-purple-500/50 shadow-neon-purple p-3 rounded-2xl max-w-lg text-slate-200 leading-relaxed">
              Saudações, viajante! Eu sou Íris Arcádia, sua Mestre de Jogo. Diga-me qual mundo quer explorar ou que campanha deseja criar hoje!
            </div>
          </div>
        </div>

        <!-- Msg 2: Aurora -->
        <div class="flex items-start space-x-3 group">
          <div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xs shrink-0">
            ⚙️
          </div>
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="font-bold text-[#39ff14] font-rajdhani">Aurora</span>
              <span class="bg-[#0a1a10] text-[#39ff14] border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">
                IA MEDIADORA
              </span>
              <span class="text-[10px] text-slate-500">Agora</span>
            </div>
            <div class="bg-gradient-to-r from-[#0a1a10] via-[#050d08] to-[#0a1a10] border border-[#39ff14]/50 shadow-[0_0_8px_rgba(57,255,20,0.2)] p-3 rounded-2xl max-w-lg text-[#39ff14] leading-relaxed">
              E eu sou Aurora. Ignore os exageros dramáticos da Íris. Se precisar tirar dúvidas sobre regras (Tormenta20, T20, D&D, etc) ou fazer rolagens com "#rolar 1d20", fale comigo!
            </div>
          </div>
        </div>
"""

idx2 = content.find("<!-- Msg 1: Íris -->")
idx_end2 = content.find("<!-- Chatbot Input Bar -->")
if idx2 != -1 and idx_end2 != -1:
    content = content[:idx2] + chatbot_replace.strip() + "\n\n      </div>\n\n      " + content[idx_end2:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.html global/chatbot static content")
