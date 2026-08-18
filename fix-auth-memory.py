import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we load the memory when user logs in successfully
content = content.replace(
    "window.currentGoogleUser = gUser;",
    "window.currentGoogleUser = gUser;\n  if (gUser && (window as any).loadChatbotMemory) { (window as any).loadChatbotMemory(gUser.uid); }"
)

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added auth load trigger")
