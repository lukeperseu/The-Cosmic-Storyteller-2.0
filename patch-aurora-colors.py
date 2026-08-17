import sys

def replace_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace the necrotic green hex code
    content = content.replace('#39ff14', '#3DC788')
    
    # 2. Replace the necrotic green rgba shadow
    content = content.replace('rgba(57,255,20,', 'rgba(61,199,136,')
    
    # 3. Replace the text color in the message containers
    # index.html instances
    content = content.replace('max-w-md text-[#3DC788]', 'max-w-md text-slate-200')
    content = content.replace('max-w-lg text-[#3DC788]', 'max-w-lg text-slate-200')
    
    # auth-app.ts instance
    content = content.replace('<div class="text-[#3DC788] font-rajdhani text-xs leading-relaxed opacity-90">', 
                              '<div class="text-slate-200 font-rajdhani text-xs leading-relaxed opacity-90">')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replace_file('index.html')
replace_file('src/auth-app.ts')
print("Patched Aurora colors")
