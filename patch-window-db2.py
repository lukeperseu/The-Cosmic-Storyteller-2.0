import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
// Prevent deepCloneSafe ReferenceError
"""

add_vars = """
(window as any).db = db;
(window as any).doc = doc;
(window as any).setDoc = setDoc;
"""

if "(window as any).db" not in content:
    content = content.replace("// Prevent deepCloneSafe ReferenceError", add_vars + "\n// Prevent deepCloneSafe ReferenceError")

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched window.db correctly")
