import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
        <div class="p-4 border-b border-amber-500/20 bg-[#070a16] flex-shrink-0">
          <form onsubmit="window.executeRulesSearch(event)" class="relative">
            <input type="text" id="rules-search-input" placeholder="Pergunte ao oráculo (Ex: Como funciona agarrar em Tormenta20?)..." class="w-full bg-[#0b0f19] border border-amber-500/40 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-rajdhani font-semibold">
            <button type="submit" class="absolute left-3 top-2.5 text-amber-400 hover:text-amber-300 transition-colors p-1" title="Pesquisar (Enter)">
              <i data-lucide="search" class="w-4 h-4"></i>
            </button>
          </form>
        </div>
"""

content = content.replace("""
        <div class="p-4 border-b border-amber-500/20 bg-[#070a16] flex-shrink-0">
          <div class="relative">
            <input type="text" id="rules-search-input" oninput="window.filterRulesSearch(this.value)" placeholder="Buscar por condição, magia, perícia, ação de combate ou manobra..." class="w-full bg-[#0b0f19] border border-amber-500/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-rajdhani font-semibold">
            <span class="absolute left-3 top-2.5 text-amber-400 text-xs">🔍</span>
          </div>
        </div>
""", replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.html rules form")
