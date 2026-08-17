import sys

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


# 1. Avatar URL
old_avatar = "https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg"
new_avatar = "https://assets-v2.lottiefiles.com/a/2c79e772-1181-11ee-a2d8-83ae705f2af6/YOgxHDDL2U.gif"

# 2. Convidado name
old_name_1 = "|| 'Convidado';"
new_name_1 = "|| 'Aguardando para encarnar...';"

old_name_2 = "|| 'Aventureiro Convidado';"
new_name_2 = "|| 'Aguardando para encarnar...';"

old_name_3 = ">Aventureiro Convidado<"
new_name_3 = ">Aguardando para encarnar...<"

# 3. Email
old_email = "convidado@cosmos.local"
new_email = "No momento você é esse bostinha acima aguardando para começar a existir..."

# 4. Mode
old_mode = "Modo Convidado (Não Conectado)"
new_mode = "Crie sua conta Ordos."


replace_in_file('index.html', [
    (old_avatar, new_avatar),
    (old_name_3, new_name_3),
    (old_email, new_email),
    (old_mode, new_mode)
])

replace_in_file('src/auth-app.ts', [
    (old_avatar, new_avatar),
    (old_name_1, new_name_1),
    (old_name_2, new_name_2),
    (old_email, new_email),
    (old_mode, new_mode)
])

replace_in_file('src/firebase.ts', [
    (old_avatar, new_avatar)
])

print("Patched guest strings and avatar")
