import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

types_to_add = "    toggleZenMode: () => void;\n"

if "toggleZenMode:" not in content:
    content = content.replace(
        "toggleGameLeftSidebar: () => void;",
        types_to_add + "    toggleGameLeftSidebar: () => void;"
    )

func_to_add = """
window.toggleZenMode = function() {
  const header = document.getElementById('game-session-header');
  const leftSidebar = document.getElementById('game-left-sidebar');
  const rightSidebar = document.getElementById('game-right-sidebar');
  
  if (header) header.classList.toggle('hidden');
  if (leftSidebar) leftSidebar.classList.toggle('hidden');
  if (rightSidebar) rightSidebar.classList.toggle('hidden');
  
  if (window.showToast) {
    const isHidden = header?.classList.contains('hidden');
    window.showToast(isHidden ? "Modo Foco ativado" : "Modo Foco desativado", "info");
  }
};
"""

if "window.toggleZenMode = function" not in content:
    content = content.replace(
        "window.toggleGameLeftSidebar = function() {",
        func_to_add + "\nwindow.toggleGameLeftSidebar = function() {"
    )
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched auth-app.ts")
else:
    print("Already patched")
