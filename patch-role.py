import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 'JOGADOR' with 'PLAYER' in multiple places
content = content.replace("'JOGADOR'", "'PLAYER'")

# Remove CONVIDADO status for logged in users (it defaults to PLAYER now)
content = content.replace("const role = profile?.role || (gUser ? 'JOGADOR' : 'CONVIDADO');", "const role = profile?.role || (gUser ? 'PLAYER' : 'CONVIDADO');")


with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched roles in auth-app")


with open('src/firebase.ts', 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = content2.replace("'JOGADOR'", "'PLAYER'")

with open('src/firebase.ts', 'w', encoding='utf-8') as f:
    f.write(content2)
print("Patched roles in firebase")
