import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
    if (isNarrator) {
      cardBg = 'bg-gradient-to-r from-[#170a2c] via-[#100720] to-[#170a2c] border-purple-500/50 shadow-neon-purple';
      roleBadge = window.getRoleBadgeHtml ? window.getRoleBadgeHtml('IA NARRADORA', false, 'px-2', 'py-0.5') : `<span class="bg-[#1a112c] text-red-500 border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-orbitron px-2 py-0.5 rounded font-bold uppercase">IA NARRADORA</span>`;
    } else if (isAurora) {
      cardBg = 'bg-gradient-to-r from-[#0a1a10] via-[#050d08] to-[#0a1a10] border-[#39ff14]/50 shadow-[0_0_8px_rgba(57,255,20,0.2)]';
      roleBadge = window.getRoleBadgeHtml ? window.getRoleBadgeHtml('IA MEDIADORA', false, 'px-2', 'py-0.5') : `<span class="bg-[#0a1a10] text-[#39ff14] border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] text-[9px] font-orbitron px-2 py-0.5 rounded font-bold uppercase">IA MEDIADORA</span>`;
    } else if (isSystem) {
"""

if "cardBg = 'bg-gradient-to-r from-[#2c0a17]" in content:
    content = content.replace("""
    if (isNarrator) {
      cardBg = 'bg-gradient-to-r from-[#170a2c] via-[#100720] to-[#170a2c] border-purple-500/50 shadow-neon-purple';
      roleBadge = window.getRoleBadgeHtml ? window.getRoleBadgeHtml('IA NARRADORA', false, 'px-2', 'py-0.5') : `<span class="bg-purple-950 text-purple-300 border border-purple-400/60 text-[9px] font-orbitron px-2 py-0.5 rounded font-bold">IA NARRADORA</span>`;
        } else if (isAurora) {
      cardBg = 'bg-gradient-to-r from-[#2c0a17] via-[#200710] to-[#2c0a17] border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
      roleBadge = `<span class="bg-red-950 text-red-300 border border-red-500/60 text-[9px] font-orbitron px-2 py-0.5 rounded font-bold uppercase">IA MEDIADORA</span>`;
} else if (isSystem) {
""", replacement.strip() + "\n")
    
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched renderSessionMessages roles")
else:
    print("Could not find block in renderSessionMessages")
