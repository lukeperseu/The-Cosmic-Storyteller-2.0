import sys

with open('src/firebase.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfileData;
      if (data.email === 'lukeperseu@gmail.com' && data.role !== 'OWNER') {
        data.role = 'OWNER';
        // Fire and forget update
        setDoc(userDocRef, { role: 'OWNER' }, { merge: true }).catch(e => console.error("Auto-promote owner failed:", e));
      }
      return data;
    }
    return null; // document doesn't exist
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    // If it's an offline error, throw it so we don't assume the user has no profile
    if (error.message && error.message.includes('offline')) {
      throw error;
    }
    return null;
  }
}
"""

import re
old_regex = r"export async function getUserProfile\(uid: string\): Promise<UserProfileData \| null> \{[\s\S]*?    return null;\n  \}\n\}"
content = re.sub(old_regex, replacement.strip(), content)

with open('src/firebase.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched getUserProfile")
