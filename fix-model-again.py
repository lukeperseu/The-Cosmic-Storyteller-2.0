import sys
import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("gemini-2.5-flash", "gemini-3.6-flash")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted model name to gemini-3.6-flash")
