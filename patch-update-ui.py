import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if "(window as any).updateAppUIWithProfile = updateAppUIWithProfile;" not in content:
    content = content.replace("function updateAppUIWithProfile(profile: UserProfileData | null, gUser: any | null) {", 
    "function updateAppUIWithProfile(profile: UserProfileData | null, gUser: any | null) {\n  (window as any).updateAppUIWithProfile = updateAppUIWithProfile;")

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched ui exporter")
