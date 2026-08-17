import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip() == "fullText += \"":
        lines[i] = "                fullText += \"\\n\\n**Erro:** \" + data.error;\n"
    elif line.strip() == "**Erro:** \" + data.error;":
        lines[i] = ""
    elif line.strip() == ".replace(/":
        lines[i] = "                    .replace(/\\n/g, '<br>');\n"
    elif line.strip() == "/g, '<br>');":
        lines[i] = ""

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)
