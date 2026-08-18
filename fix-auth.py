import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the getRoleBadge fallback so we don't break if gUser exists but no username yet
content = content.replace("const username = profile?.username || 'Aguardando para encarnar...';", "const username = profile?.username || (gUser ? (gUser.displayName || 'Jogador') : 'Aguardando para encarnar...');")

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed auth fallback")
