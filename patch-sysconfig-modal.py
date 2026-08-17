import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

modal = """
  <!-- SYSTEM CONFIG MODAL -->
  <div id="system-config-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 hidden">
    <div class="glass-card w-full max-w-md rounded-2xl p-6 relative border border-indigo-500/40">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-indigo-500/20">
        <h3 class="font-orbitron font-bold text-lg text-indigo-300 flex items-center space-x-2">
          <i data-lucide="settings" class="w-5 h-5 text-indigo-400"></i>
          <span>Configurações das IAs</span>
        </h3>
        <button onclick="closeModal('system-config-modal')" class="text-slate-400 hover:text-white p-1">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold font-rajdhani text-purple-300 uppercase mb-1">Avatar da Íris Arcádia (URL)</label>
          <input type="text" id="iris-avatar-input" placeholder="https://..." class="w-full bg-[#0b0f19] border border-purple-500/30 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400 transition-colors">
        </div>
        <div>
          <label class="block text-xs font-bold font-rajdhani text-emerald-300 uppercase mb-1">Avatar da Aurora (URL)</label>
          <input type="text" id="aurora-avatar-input" placeholder="https://..." class="w-full bg-[#0b0f19] border border-emerald-500/30 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors">
        </div>
        
        <button onclick="window.saveAiConfig()" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-rajdhani font-bold text-sm tracking-widest flex items-center justify-center space-x-2 transition-all mt-4">
          <span>💾 SALVAR CONFIGURAÇÕES</span>
        </button>
      </div>
    </div>
  </div>
"""

idx = content.find('<!-- GENERIC FALLBACK MODAL -->')
if idx != -1:
    content = content[:idx] + modal + "\n\n  " + content[idx:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched index.html with system-config-modal")
else:
    print("Could not find GENERIC FALLBACK MODAL")
