import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if "'perception': { name: 'Percepção', stat: 'wis' }" not in content:
    content = content.replace(
        "'occultism': { name: 'Ocultismo', stat: 'int' },",
        "'occultism': { name: 'Ocultismo', stat: 'int' },\n          'perception': { name: 'Percepção', stat: 'wis' },"
    )
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched perception")
else:
    print("Already patched")
