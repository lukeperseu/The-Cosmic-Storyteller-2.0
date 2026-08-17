import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

types_to_add = """
    modifyCharacterGold: (amount: number) => Promise<void>;
    modifyCharacterItem: (action: 'add'|'remove', itemName: string, quantity: number) => Promise<void>;
    openManagementScreen: () => void;
    closeManagementScreen: () => void;
    loadAdminUserDetails: (uid: string) => Promise<void>;
    adminApplyRole: () => Promise<void>;
    saveCharacterDetailsEdit: () => Promise<void>;
    openFichaPersonagemModal: () => void;
    getRoleBadgeHtml: (role: string, a: boolean, b: string, c: string) => string;
"""

if "modifyCharacterGold: (amount" not in content:
    content = content.replace(
        "interface Window {",
        "interface Window {\n" + types_to_add
    )
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched Window interface in auth-app.ts")
else:
    print("Window interface already patched")

with open('src/firebase.ts', 'r', encoding='utf-8') as f:
    fb_content = f.read()

if "senderRole: 'narrator' | 'player' | 'system' | 'aurora';" not in fb_content:
    fb_content = fb_content.replace(
        "senderRole: 'narrator' | 'player' | 'system';",
        "senderRole: 'narrator' | 'player' | 'system' | 'aurora';"
    )
    fb_content = fb_content.replace(
        "type: 'narrative' | 'speech' | 'action' | 'thought' | 'roll' | 'combat' | 'item' | 'system';",
        "type: 'narrative' | 'speech' | 'action' | 'thought' | 'roll' | 'combat' | 'item' | 'system' | 'chat';"
    )
    with open('src/firebase.ts', 'w', encoding='utf-8') as f:
        f.write(fb_content)
    print("Patched SessionMessage in firebase.ts")
