import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    auth_content = f.read()

global_types = """
  var getRoleBadgeHtml: (role: string, a: boolean, b: string, c: string) => string;
"""

auth_content = auth_content.replace(
    "var openFichaPersonagemModal: () => void;",
    "var openFichaPersonagemModal: () => void;\n" + global_types
)

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(auth_content)
