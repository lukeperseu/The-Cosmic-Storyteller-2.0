import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
      <div class="flex items-center space-x-2">
        <button onclick="openModal('system-config-modal')" class="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/50 text-indigo-300 font-rajdhani text-sm font-bold flex items-center space-x-2 hover:bg-indigo-900/80 transition-colors">
          <i data-lucide="settings" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Configurações de IA</span>
        </button>
        <button onclick="refreshAdminUserList()" class="px-3 py-1.5 rounded-lg bg-cosmic-950 border border-slate-700 text-slate-300 font-rajdhani text-sm font-bold flex items-center space-x-2 hover:bg-slate-800 transition-colors">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Atualizar</span>
        </button>
      </div>
"""

idx = content.find('<button onclick="refreshAdminUserList()" class="px-3 py-1.5')
idx2 = content.find('</button>', idx) + 9
if idx != -1:
    content = content[:idx] + replacement.strip() + content[idx2:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched management screen header")
else:
    print("Could not find management header")
