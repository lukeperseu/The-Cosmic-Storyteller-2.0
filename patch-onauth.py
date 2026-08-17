import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
// Listen to Firebase Auth state change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentGoogleUser = user;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        currentUserProfile = profile;
        updateAppUIWithProfile(profile, user);
        sendPresenceHeartbeat(true);
        if ((window as any).closeModal) {
          (window as any).closeModal('account-modal');
        }
      } else {
        updateAppUIWithProfile(null, user);
        // Automatically prompt for username if new Google login
        window.openUsernameModal(false);
        sendPresenceHeartbeat(true);
      }
    } catch (e: any) {
      console.warn("Could not load profile, keeping offline state", e);
      // Keep UI showing the Google user but with offline placeholder
      updateAppUIWithProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Usuário Offline',
        username: user.displayName?.replace(/\s+/g, '_').toLowerCase() || 'offline_user',
        usernameLower: user.displayName?.replace(/\s+/g, '_').toLowerCase() || 'offline_user',
        photoURL: user.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg',
        role: 'JOGADOR',
        updatedAt: null
      }, user);
      if (window.showToast) {
        window.showToast("Conexão instável. Usando perfil local temporário.", "error");
      }
    }

    // Subscribe to user characters
"""

import re
old_regex = r"// Listen to Firebase Auth state change\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n(?:.*)\n    // Subscribe to user characters"
# Wait, safer way to replace:
old_regex = r"// Listen to Firebase Auth state change\nonAuthStateChanged\(auth, async \(user\) => \{\n  if \(user\) \{\n    currentGoogleUser = user;\n    const profile = await getUserProfile\(user\.uid\);if \(profile\) \{\n      currentUserProfile = profile;\n      updateAppUIWithProfile\(profile, user\);\n      sendPresenceHeartbeat\(true\);\n      if \(\(window as any\)\.closeModal\) \{\n        \(\(window as any\)\.closeModal\('account-modal'\);\n      \}\n    \} else \{\n      updateAppUIWithProfile\(null, user\);\n      // Automatically prompt for username if new Google login\n      window\.openUsernameModal\(false\);\n      sendPresenceHeartbeat\(true\);\n    \}\n    \n    // Subscribe to user characters"

content = content.replace("""// Listen to Firebase Auth state change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentGoogleUser = user;
    const profile = await getUserProfile(user.uid);if (profile) {
      currentUserProfile = profile;
      updateAppUIWithProfile(profile, user);
      sendPresenceHeartbeat(true);
      if ((window as any).closeModal) {
        (window as any).closeModal('account-modal');
      }
    } else {
      updateAppUIWithProfile(null, user);
      // Automatically prompt for username if new Google login
      window.openUsernameModal(false);
      sendPresenceHeartbeat(true);
    }
    
    // Subscribe to user characters""", replacement.strip())

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched onauth")
