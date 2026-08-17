import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the inner part of the executor call block with one that handles OURO and ITEMS
old_inner = """
            for (const mut of mutations) {
              if (mut.type === 'PV') {
                if (window.modifyCharacterStat) await window.modifyCharacterStat('pv', mut.amount);
                toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} PV`);
              } else if (mut.type === 'PM') {
                if (window.modifyCharacterStat) await window.modifyCharacterStat('pm', mut.amount);
                toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} PM`);
              }
              // Ouro and items can be added here later
            }
"""

new_inner = """
            for (const mut of mutations) {
              if (mut.type === 'PV') {
                if (window.modifyCharacterStat) await window.modifyCharacterStat('pv', mut.amount);
                toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} PV`);
              } else if (mut.type === 'PM') {
                if (window.modifyCharacterStat) await window.modifyCharacterStat('pm', mut.amount);
                toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} PM`);
              } else if (mut.type === 'OURO') {
                if (window.modifyCharacterGold) await window.modifyCharacterGold(mut.amount);
                toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} Ouro`);
              } else if (mut.type === 'ITEM_ADD') {
                if (window.modifyCharacterItem) await window.modifyCharacterItem('add', mut.itemName, mut.amount || 1);
                toastLines.push(`+${mut.amount || 1} ${mut.itemName}`);
              } else if (mut.type === 'ITEM_REMOVE') {
                if (window.modifyCharacterItem) await window.modifyCharacterItem('remove', mut.itemName, mut.amount || 1);
                toastLines.push(`-${mut.amount || 1} ${mut.itemName}`);
              }
            }
"""

if old_inner.strip() in content:
    content = content.replace(old_inner.strip(), new_inner.strip())
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched executora handling")
else:
    print("Old inner not found")
    # Let's try a regex or finding by string
