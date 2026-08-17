import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_else = """
  } else {
    currentGoogleUser = null;
    currentUserProfile = null;
    updateAppUIWithProfile(null, null);
    sendPresenceHeartbeat(true);
"""

new_else = """
  } else {
    currentGoogleUser = null;
    currentUserProfile = null;
    updateAppUIWithProfile(null, null);
    sendPresenceHeartbeat(true);
    
    // Force open account modal and hide close btn is handled in updateAppUIWithProfile
    if ((window as any).openModal) {
      (window as any).openModal('account-modal');
    }
"""

content = content.replace(old_else.strip(), new_else.strip())

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched onAuthStateChanged")
