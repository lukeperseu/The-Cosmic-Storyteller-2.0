import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace static Iris and Aurora emojis with img tags in index.html
content = content.replace(
    '<div class="w-8 h-8 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-xs">\n            🔮\n          </div>',
    '<img src="https://i.pinimg.com/736x/88/f2/e8/88f2e825cd40939eb5110d195a6ecae4.jpg" class="w-8 h-8 rounded-full object-cover border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] iris-avatar-img">'
)

content = content.replace(
    '<div class="w-8 h-8 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-xs shrink-0">\n            🔮\n          </div>',
    '<img src="https://i.pinimg.com/736x/88/f2/e8/88f2e825cd40939eb5110d195a6ecae4.jpg" class="w-8 h-8 rounded-full object-cover border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] shrink-0 iris-avatar-img">'
)

content = content.replace(
    '<div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xs">\n            ⚙️\n          </div>',
    '<img src="https://i.pinimg.com/736x/8c/fb/f0/8cfbf0f1c34a2e5d59046c3b6920f781.jpg" class="w-8 h-8 rounded-full object-cover border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] aurora-avatar-img">'
)

content = content.replace(
    '<div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xs shrink-0">\n            ⚙️\n          </div>',
    '<img src="https://i.pinimg.com/736x/8c/fb/f0/8cfbf0f1c34a2e5d59046c3b6920f781.jpg" class="w-8 h-8 rounded-full object-cover border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] shrink-0 aurora-avatar-img">'
)

# the ones in JS block inside index.html for dynamic responses:
content = content.replace(
    '<div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xs shrink-0">⚙️</div>',
    '<img src="${window.globalAiConfig ? window.globalAiConfig.auroraAvatar : \'https://i.pinimg.com/736x/8c/fb/f0/8cfbf0f1c34a2e5d59046c3b6920f781.jpg\'}" class="w-8 h-8 rounded-full object-cover border border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)] shrink-0 aurora-avatar-img">'
)

content = content.replace(
    '<div class="w-8 h-8 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-xs shrink-0">🔮</div>',
    '<img src="${window.globalAiConfig ? window.globalAiConfig.irisAvatar : \'https://i.pinimg.com/736x/88/f2/e8/88f2e825cd40939eb5110d195a6ecae4.jpg\'}" class="w-8 h-8 rounded-full object-cover border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] shrink-0 iris-avatar-img">'
)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.html with AI images")
