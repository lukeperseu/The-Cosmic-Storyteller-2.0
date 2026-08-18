import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("chunk.split('\\n\\n')", "chunk.split('\\n\\n')") # Wait, in Python replacing '\\n' with '\n'
content = content.replace("chunk.split('\\\\n\\\\n')", "chunk.split('\\n\\n')") 
content = content.replace(".replace(/\\\\n/g, '<br>')", ".replace(/\\n/g, '<br>')")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed script escapes")
