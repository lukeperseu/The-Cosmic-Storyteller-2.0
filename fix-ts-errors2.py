import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    auth_content = f.read()

# Fix types
auth_content = auth_content.replace(
    "type: currentActionMode === 'narrator' ? 'narrative' : currentActionMode,",
    "type: (currentActionMode === 'narrator' ? 'narrative' : currentActionMode) as 'narrative' | 'speech' | 'action' | 'thought' | 'roll' | 'combat' | 'item' | 'system',"
)
auth_content = auth_content.replace(
    "const isAurora = msg.senderRole === 'aurora';",
    "const isAurora = msg.senderRole === ('aurora' as any);"
)

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(auth_content)
