import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
export let globalAiConfig = {
  irisAvatar: 'https://i.pinimg.com/736x/88/f2/e8/88f2e825cd40939eb5110d195a6ecae4.jpg',
  auroraAvatar: 'https://i.pinimg.com/736x/8c/fb/f0/8cfbf0f1c34a2e5d59046c3b6920f781.jpg'
};

async function loadAiConfig() {
  try {
    const docRef = doc(db, 'system', 'config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.irisAvatar) globalAiConfig.irisAvatar = data.irisAvatar;
      if (data.auroraAvatar) globalAiConfig.auroraAvatar = data.auroraAvatar;
    }
    const iInput = document.getElementById('iris-avatar-input') as HTMLInputElement;
    const aInput = document.getElementById('aurora-avatar-input') as HTMLInputElement;
    if (iInput) iInput.value = globalAiConfig.irisAvatar;
    if (aInput) aInput.value = globalAiConfig.auroraAvatar;
  } catch (e) {
    console.error("Error loading config:", e);
  }
}
loadAiConfig();

(window as any).saveAiConfig = async function() {
  const iInput = document.getElementById('iris-avatar-input') as HTMLInputElement;
  const aInput = document.getElementById('aurora-avatar-input') as HTMLInputElement;
  const irisAvatar = iInput?.value.trim();
  const auroraAvatar = aInput?.value.trim();
  
  if (!irisAvatar || !auroraAvatar) return;
  
  try {
    const docRef = doc(db, 'system', 'config');
    await setDoc(docRef, { irisAvatar, auroraAvatar }, { merge: true });
    globalAiConfig.irisAvatar = irisAvatar;
    globalAiConfig.auroraAvatar = auroraAvatar;
    if ((window as any).showToast) (window as any).showToast("Configurações de IA salvas!", "success");
    (window as any).closeModal('system-config-modal');
    // Re-render things
    renderOnlineMembers(lastOnlineUsers);
  } catch (e: any) {
    console.error(e);
    if ((window as any).showToast) (window as any).showToast("Erro ao salvar config.", "error");
  }
};
"""

idx = content.find("function renderOnlineMembers")
if idx != -1:
    content = content[:idx] + replacement + "\n\n" + content[idx:]
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched auth-app.ts with AI Config logic")
else:
    print("Could not find function renderOnlineMembers")
