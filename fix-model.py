import sys
import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("gemini-3.6-flash", "gemini-2.5-flash")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed model name")
