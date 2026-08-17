import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
    async function saveProfileOptions() {
      const urlInput = document.getElementById('input-avatar-url');
      const enterCheck = document.getElementById('check-enter-send');

      if (urlInput && urlInput.value.trim() && window.currentGoogleUser) {
        try {
          const newUrl = urlInput.value.trim();
          
          // Import from auth-app context safely
          if (window.db && window.doc && window.setDoc && window.currentGoogleUser) {
            const userRef = window.doc(window.db, 'users', window.currentGoogleUser.uid);
            await window.setDoc(userRef, { photoURL: newUrl }, { merge: true });
            
            if (window.currentUserProfile) {
              window.currentUserProfile.photoURL = newUrl;
              if (window.updateAppUIWithProfile) {
                window.updateAppUIWithProfile(window.currentUserProfile, window.currentGoogleUser);
              }
            }
          }
        } catch (e) {
          console.error("Failed to save avatar", e);
          showToast('Erro ao salvar avatar no banco de dados.', 'error');
          return;
        }
      }
      
      if (enterCheck && window.currentUserProfile) {
         // playerProfile.enterSend = enterCheck.checked;
      }

      closeModal('options-modal');
      showToast('Avatar e opções atualizados com sucesso!');
    }
"""

import re
old_regex = r"    function saveProfileOptions\(\) \{[\s\S]*?showToast\('Profile atualizado com sucesso!'\);\n    \}"
content = re.sub(old_regex, replacement.strip(), content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched saveProfileOptions")
