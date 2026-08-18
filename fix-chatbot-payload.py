import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "body: JSON.stringify({ message: text, history: historyCopy })",
    "body: JSON.stringify({ message: text, history: historyCopy, isAurora: isAurora })"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated frontend payload")
