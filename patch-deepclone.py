import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
// Prevent deepCloneSafe ReferenceError
(window as any).deepCloneSafe = function(obj: any) {
  if (obj === null || typeof obj !== 'object') return obj;
  const cache = new Set();
  const replacer = (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return; // Circular reference found, discard key
      }
      cache.add(value);
    }
    return value;
  };
  try { return JSON.parse(JSON.stringify(obj, replacer)); } catch (e) { return obj; }
};
"""

import re
content = re.sub(r'// Prevent deepCloneSafe ReferenceError\n\(window as any\)\.deepCloneSafe = function\(obj: any\) {\n  if \(obj === null \|\| typeof obj !== \'object\'\) return obj;\n  try { return JSON\.parse\(JSON\.stringify\(obj\)\); } catch \(e\) { return obj; }\n};', replacement.strip(), content)


with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched deepCloneSafe")
