import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "loadAdminUserDetails: (uid: string) => Promise<void>;",
    "loadAdminUserDetails: (uid?: string) => Promise<void>;"
)

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/firebase.ts', 'r', encoding='utf-8') as f:
    fb_content = f.read()

if "pathbuilderJson?: string;" not in fb_content:
    fb_content = fb_content.replace(
        "export interface CharacterData {",
        "export interface CharacterData {\n  pathbuilderJson?: string;"
    )
    with open('src/firebase.ts', 'w', encoding='utf-8') as f:
        f.write(fb_content)

print("Fixed TS errors")
