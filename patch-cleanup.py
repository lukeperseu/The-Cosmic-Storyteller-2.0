import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("  // Management Buttons Toggle\n\n  // Management Buttons Toggle\n", "  // Management Buttons Toggle\n")

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
