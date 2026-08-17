import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add isAurora boolean
if "const isSystem = msg.senderRole === 'system';" in content and "const isAurora = msg.senderRole === 'aurora';" not in content:
    content = content.replace(
        "const isSystem = msg.senderRole === 'system';",
        "const isSystem = msg.senderRole === 'system';\n    const isAurora = msg.senderRole === 'aurora';"
    )

# Exclude Aurora from normal cards
if "if (!isNarrator && !isSystem && !isRoll) {" in content:
    content = content.replace(
        "if (!isNarrator && !isSystem && !isRoll) {",
        "if (!isNarrator && !isSystem && !isRoll && !isAurora) {"
    )

# Add Aurora styles
aurora_style = """    } else if (isAurora) {
      cardBg = 'bg-gradient-to-r from-[#2c0a17] via-[#200710] to-[#2c0a17] border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
      roleBadge = `<span class="bg-red-950 text-red-300 border border-red-500/60 text-[9px] font-orbitron px-2 py-0.5 rounded font-bold uppercase">IA MEDIADORA (AURORA)</span>`;"""

if "} else if (isSystem) {" in content and "isAurora) {" not in content:
    content = content.replace(
        "} else if (isSystem) {",
        aurora_style + "\n    } else if (isSystem) {"
    )

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched Aurora styles")
