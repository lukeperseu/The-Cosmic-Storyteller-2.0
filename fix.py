import sys

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('ficha-modal.html', 'r', encoding='utf-8') as f:
    ficha_modal = f.read()

new_lines = lines[:1263]
new_lines.append(ficha_modal)
if not new_lines[-1].endswith('\n'):
    new_lines[-1] += '\n'
new_lines.append('  <!-- 2. MODAL: SUA CONTA ORDOS (SCREENSHOT 2) -->\n')
new_lines.append('  <div id="account-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">\n')

new_lines.extend(lines[1280:])

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

