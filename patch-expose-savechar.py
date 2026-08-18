import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
(window as any).saveCharacter = saveCharacter;
"""

content = content.replace("(window as any).db = db;", "(window as any).db = db;\n(window as any).saveCharacter = saveCharacter;")

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Exposed saveCharacter")
