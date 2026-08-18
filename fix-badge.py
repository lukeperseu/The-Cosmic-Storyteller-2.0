import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("rounded\">PLAYER</span>';", "rounded\">CONVIDADO</span>';")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
