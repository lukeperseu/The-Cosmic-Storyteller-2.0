import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

btn = """
              <button onclick="window.toggleZenMode()" class="p-1 rounded text-slate-400 hover:text-white hover:bg-purple-900/40 transition-colors" title="Modo Foco (Ocultar Menus)">
                <i data-lucide="maximize" class="w-3.5 h-3.5"></i>
              </button>
"""

if "window.toggleZenMode" not in content:
    content = content.replace(
        '<button onclick="window.clearSessionChatFeed()"',
        btn + '\n              <button onclick="window.clearSessionChatFeed()"'
    )
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched index.html")
else:
    print("Already patched")
