import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const activeRole = window.currentUserProfile?.role || 'PLAYER';", 
    "const activeRole = window.currentUserProfile?.role || (window.currentGoogleUser ? 'PLAYER' : 'CONVIDADO');"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed role fallback")
