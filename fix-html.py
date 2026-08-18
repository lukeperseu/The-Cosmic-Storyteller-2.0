import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('class="p-3 bg-cosmic-950 border-t border-purple-500/20 flex items-center space-x-2"> class="p-3 bg-cosmic-950 border-t border-purple-500/20 flex items-center space-x-2">', 'class="p-3 bg-cosmic-950 border-t border-purple-500/20 flex items-center space-x-2">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed HTML syntax")
