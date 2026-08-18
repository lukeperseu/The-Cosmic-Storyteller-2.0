import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const lines = buffer.split('\n\n');", "const lines = buffer.split('\\n\\n');")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed syntax error")
