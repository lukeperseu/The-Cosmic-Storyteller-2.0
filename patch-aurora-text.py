import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
    if (isThought) {
      formattedContent = `<div class="italic text-purple-300/90 pl-2 border-l-2 border-purple-500/50 font-serif text-xs">${iconPrefix}"${formattedContent}"</div>`;
    } else if (isAction) {
      formattedContent = `<div class="text-slate-200 font-rajdhani font-semibold text-xs leading-relaxed">${iconPrefix}${formattedContent}</div>`;
    } else if (isAurora) {
      formattedContent = `<div class="text-[#39ff14] font-rajdhani text-xs leading-relaxed opacity-90">${formattedContent}</div>`;
    } else if (msg.type === 'chat') {
"""

content = content.replace("""
    if (isThought) {
      formattedContent = `<div class="italic text-purple-300/90 pl-2 border-l-2 border-purple-500/50 font-serif text-xs">${iconPrefix}"${formattedContent}"</div>`;
    } else if (isAction) {
      formattedContent = `<div class="text-slate-200 font-rajdhani font-semibold text-xs leading-relaxed">${iconPrefix}${formattedContent}</div>`;
    } else if (msg.type === 'chat') {
""", replacement.strip() + "\n")

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched Aurora text color")
