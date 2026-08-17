import sys

with open('firestore.rules', 'r', encoding='utf-8') as f:
    content = f.read()

rule_to_add = """
    // System configuration (e.g. AI Avatars)
    match /system/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'OWNER' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADM' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MESTRE' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'STAFF'
      );
    }
"""

content = content.replace("""
    // System configuration (e.g. AI Avatars)
    match /system/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'OWNER' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADM'
      );
    }
""", rule_to_add)


with open('firestore.rules', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated firestore rules")
