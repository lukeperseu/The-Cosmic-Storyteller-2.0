import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
old_regex = r"<div class=\"pt-2 text-center\">\s*<a href=\"\.\" target=\"_blank\" class=\"text-\[11px\] text-cyan-300/80 hover:text-cyan-200 underline font-rajdhani flex items-center justify-center space-x-1\">\s*<span>↗️ Abrir app em nova aba</span>\s*</a>\s*</div>"

content = re.sub(old_regex, "", content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed link")
