import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<div class="w-5 h-5 rounded-full bg-[#1a112c] border border-red-500 flex items-center justify-center text-[10px]">🔮</div>',
    '<img src="${globalAiConfig.irisAvatar}" class="w-5 h-5 rounded-full object-cover border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]">'
)

content = content.replace(
    '<div class="w-5 h-5 rounded-full bg-[#0a1a10] border border-[#39ff14] flex items-center justify-center text-[10px]">⚙️</div>',
    '<img src="${globalAiConfig.auroraAvatar}" class="w-5 h-5 rounded-full object-cover border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)]">'
)

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched auth-app.ts with AI images")
