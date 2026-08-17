import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("fullText += \"\n\n**Erro:** \" + data.error;", "fullText += \"\\n\\n**Erro:** \" + data.error;")
content = content.replace("const lines = chunkStr.split(String.fromCharCode(10));\n');", "const lines = chunkStr.split(String.fromCharCode(10));")
content = content.replace(".replace(/\\n/g, '<br>');", ".replace(/\\\\n/g, '<br>');")

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)

