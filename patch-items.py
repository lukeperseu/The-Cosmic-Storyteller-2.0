import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

helpers = """
// --- Executora Helpers ---
window.modifyCharacterGold = async function(amount: number) {
  if (!activeGameCharacter) return;
  const char = activeGameCharacter;
  char.money = (char.money || 0) + amount;
  if (char.money < 0) char.money = 0;
  
  window.setGameSheetTab(currentGameSheetTab);
  if (char.id && char.id !== 'char-demo') {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await updateDoc(doc(db, 'characters', char.id), { money: char.money });
    } catch (e) {
      console.error(e);
    }
  }
};

window.modifyCharacterItem = async function(action: 'add' | 'remove', itemName: string, quantity: number) {
  if (!activeGameCharacter) return;
  const char = activeGameCharacter;
  if (!char.inventory) char.inventory = [];
  
  if (action === 'add') {
    const existing = char.inventory.find((i: any) => i.name?.toLowerCase() === itemName.toLowerCase());
    if (existing) {
      existing.quantity = (existing.quantity || 1) + quantity;
    } else {
      char.inventory.push({ name: itemName, quantity, weight: 0.1, category: 'Geral', notes: 'Adicionado pela Executora' });
    }
  } else if (action === 'remove') {
    const existingIdx = char.inventory.findIndex((i: any) => i.name?.toLowerCase() === itemName.toLowerCase());
    if (existingIdx !== -1) {
      const existing = char.inventory[existingIdx];
      existing.quantity = (existing.quantity || 1) - quantity;
      if (existing.quantity <= 0) {
        char.inventory.splice(existingIdx, 1);
      }
    }
  }
  
  window.renderConsumableItems();
  window.setGameSheetTab(currentGameSheetTab);
  if (char.id && char.id !== 'char-demo') {
    try {
      const { updateCharacterInventory } = await import('./firebase');
      await updateCharacterInventory(char.id, char.inventory);
    } catch (e) {
      console.error(e);
    }
  }
};
// -------------------------
"""

if "window.modifyCharacterGold =" not in content:
    content = content.replace("window.modifyCharacterStat = async function", helpers + "\nwindow.modifyCharacterStat = async function")
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched helpers")

