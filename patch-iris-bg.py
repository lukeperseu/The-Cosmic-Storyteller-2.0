import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "badgeClasses = 'bg-[#1a112c] text-red-500 border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]';",
    "badgeClasses = 'bg-purple-900 text-red-500 border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]';"
)

content = content.replace(
    '<span class="bg-[#1a112c] text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">IA NARRADORA</span>',
    '<span class="bg-purple-900 text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">IA NARRADORA</span>'
)
content = content.replace(
    '<span class="bg-[#1a112c] text-red-500 border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-orbitron px-2 py-0.5 rounded font-bold uppercase">IA NARRADORA</span>',
    '<span class="bg-purple-900 text-red-500 border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-orbitron px-2 py-0.5 rounded font-bold uppercase">IA NARRADORA</span>'
)

# And in index.html as well
with open('index.html', 'r', encoding='utf-8') as f2:
    idx_content = f2.read()

idx_content = idx_content.replace(
    '<span class="bg-[#1a112c] text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">',
    '<span class="bg-purple-900 text-red-500 border border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] text-[9px] font-bold font-orbitron px-1.5 py-0.2 rounded">'
)

with open('index.html', 'w', encoding='utf-8') as f2:
    f2.write(idx_content)

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched Iris bg")
