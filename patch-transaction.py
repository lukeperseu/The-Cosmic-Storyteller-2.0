import sys

with open('src/firebase.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
  // Run as a Firestore transaction for strict atomic uniqueness
  await runTransaction(db, async (transaction) => {
    const newUsernameRef = doc(db, 'usernames', usernameLower);
    const userRef = doc(db, 'users', uid);
    const oldUsernameRef = (oldUsername && oldUsername.toLowerCase() !== usernameLower) ? doc(db, 'usernames', oldUsername.toLowerCase()) : null;

    // ALL READS MUST COME FIRST
    const newUsernameSnap = await transaction.get(newUsernameRef);
    const existingUserSnap = await transaction.get(userRef);

    if (newUsernameSnap.exists() && newUsernameSnap.data().uid !== uid) {
      throw new Error("O nome de usuário acabou de ser reservado por outro jogador.");
    }

    // ALL WRITES AFTER READS
    if (oldUsernameRef) {
      transaction.delete(oldUsernameRef);
    }

    transaction.set(newUsernameRef, {
      uid: uid,
      username: cleanUsername,
      createdAt: serverTimestamp()
    });

    const existingRole = existingUserSnap.exists() ? existingUserSnap.data()?.role : null;
    let roleToSet = existingRole || 'JOGADOR';
    if (user.email === 'lukeperseu@gmail.com') {
      roleToSet = 'OWNER';
    }

    const profileData: Partial<UserProfileData> = {
      uid: uid,
      email: user.email || '',
      displayName: user.displayName || cleanUsername,
      username: cleanUsername,
      usernameLower: usernameLower,
      photoURL: user.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg',
      role: roleToSet,
      updatedAt: serverTimestamp()
    };

    transaction.set(userRef, profileData, { merge: true });
  });
"""

import re
old_regex = r"  // Run as a Firestore transaction for strict atomic uniqueness\n  await runTransaction\(db, async \(transaction\) => \{[\s\S]*?    transaction\.set\(userRef, profileData, \{ merge: true \}\);\n  \}\);"
content = re.sub(old_regex, replacement.strip(), content)

with open('src/firebase.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched transaction in firebase.ts")
