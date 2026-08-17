import sys

with open('new-functions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("export {}", "")
content = "declare var activeGameCharacter: any;\ndeclare var currentGoogleUser: any;\ndeclare var window: any;\n" + content

with open('new-functions.ts', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    auth_content = f.read()

# Add missing types to global interface
global_types = """
  var modifyCharacterGold: (amount: number) => Promise<void>;
  var modifyCharacterItem: (action: 'add'|'remove', itemName: string, quantity: number) => Promise<void>;
  var openManagementScreen: () => void;
  var closeManagementScreen: () => void;
  var loadAdminUserDetails: (uid: string) => Promise<void>;
  var adminApplyRole: () => Promise<void>;
  var saveCharacterDetailsEdit: () => Promise<void>;
  var openFichaPersonagemModal: () => void;
"""

if "var modifyCharacterGold" not in auth_content:
    auth_content = auth_content.replace(
        "var modifyCharacterStat: (stat: 'pv' | 'pm', delta: number) => Promise<void>;",
        "var modifyCharacterStat: (stat: 'pv' | 'pm', delta: number) => Promise<void>;\n" + global_types
    )

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(auth_content)
