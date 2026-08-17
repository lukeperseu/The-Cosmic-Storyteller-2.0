import sys

with open('src/firebase.ts', 'r', encoding='utf-8') as f:
    fb_content = f.read()

func = """
/**
 * Deletes a session message by ID
 */
export async function deleteSessionMessage(messageId: string): Promise<void> {
  try {
    const msgRef = doc(db, 'campaign_messages', messageId);
    await deleteDoc(msgRef);
  } catch (error) {
    console.error("Error deleting session message:", error);
    throw error;
  }
}
"""

if "deleteSessionMessage" not in fb_content:
    fb_content = fb_content + "\n" + func
    with open('src/firebase.ts', 'w', encoding='utf-8') as f:
        f.write(fb_content)
    print("Patched firebase.ts")
else:
    print("Already patched")
