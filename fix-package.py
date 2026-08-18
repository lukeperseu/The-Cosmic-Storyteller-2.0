import json

with open('package.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if 'vite' in data.get('dependencies', {}):
    del data['dependencies']['vite']

with open('package.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print("Removed duplicate vite")
