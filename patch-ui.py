import sys
import re

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the placeholder text if gUser exists but no profile yet
content = content.replace(
    "const email = profile?.email || gUser?.email || 'No momento você é esse bostinha acima aguardando para começar a existir...';", 
    "const email = profile?.email || gUser?.email || 'No momento você é esse bostinha acima aguardando para começar a existir...';"
)

replacement = """
  // Update auth status in the modal
  const authStatusBadge = document.getElementById('account-auth-status-badge');
  if (authStatusBadge) {
    if (gUser) {
      authStatusBadge.innerHTML = `
        <span class="text-emerald-400 flex items-center space-x-1.5 font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>✓ Autenticado via Google Auth (${gUser.email})</span>
        </span>
      `;
    } else {
      authStatusBadge.innerHTML = `
        <span class="text-amber-400 flex items-center space-x-1.5 font-semibold">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Crie sua conta Ordos.</span>
        </span>
      `;
    }
  }

  // Hide or show login button of account modal
"""
old_regex = r"  // Account Modal Elements[\s\S]*?  const logoutBtn = document\.getElementById\('account-logout-btn'\);"

# Actually, the string that sets the funny phrase is here:
# const email = profile?.email || gUser?.email || 'No momento você é esse bostinha acima aguardando para começar a existir...';
# Since gUser?.email will be used when logged in, it already replaces the funny phrase with the email when logged in. 
# So there's nothing to change there except the role name, which we just did.

