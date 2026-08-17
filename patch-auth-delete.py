import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if "deleteSessionMessage," not in content:
    content = content.replace("sendSessionMessage,", "sendSessionMessage,\n  deleteSessionMessage,")

# 2. Add to interface Window
if "deleteSessionMessage: (id: string) => Promise<void>;" not in content:
    content = content.replace("handleSendSessionMessage: (e: Event) => Promise<void>;", "handleSendSessionMessage: (e: Event) => Promise<void>;\n    deleteSessionMessage: (id: string) => Promise<void>;")

# 3. Add function implementation
func_impl = """
window.deleteSessionMessage = async function(id: string) {
  try {
    await deleteSessionMessage(id);
  } catch (error) {
    if (window.showToast) window.showToast("Erro ao deletar mensagem.", "error");
  }
};
"""
if "window.deleteSessionMessage = async" not in content:
    content = content + "\n" + func_impl

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched auth-app.ts declarations")
