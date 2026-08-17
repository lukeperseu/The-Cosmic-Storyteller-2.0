import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Revert my bad sed
content = content.replace('import { db,  doc, getDoc, setDoc } from "firebase/firestore";', 'import { doc, getDoc, setDoc } from "firebase/firestore";')
content = content.replace('import { db,    auth,', 'import { db, auth,')

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
