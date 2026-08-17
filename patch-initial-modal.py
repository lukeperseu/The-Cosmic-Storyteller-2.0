import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
  // Hide or show close button of account modal
  const closeAccountModalBtn = document.querySelector('#account-modal button[onclick*="closeModal"]');
  if (closeAccountModalBtn) {
    if (gUser) {
      (closeAccountModalBtn as HTMLElement).style.display = 'block';
    } else {
      (closeAccountModalBtn as HTMLElement).style.display = 'none';
    }
  }

  // Management Buttons Toggle
"""

if "closeAccountModalBtn" not in content:
    content = content.replace("  // Management Buttons Toggle", replacement.strip() + "\n\n  // Management Buttons Toggle")
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched account modal close button logic")
else:
    print("Already patched")
