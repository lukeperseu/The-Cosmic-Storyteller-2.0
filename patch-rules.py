import sys

with open('firestore.rules', 'r', encoding='utf-8') as f:
    content = f.read()

# I will rewrite the whole file to make sure it's structurally sound.
new_content = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profile documents
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'OWNER');
    }
    
    // Username registry for uniqueness checks
    match /usernames/{usernameLower} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }
    
    // RPG Characters
    match /characters/{characterId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if request.auth != null;
    }
    
    // Real-time Online Members Presence
    match /presence/{presenceId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Uploaded Text Files (Sistemas, Mundos, Contos&Personagens)
    match /uploadedFiles/{fileId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if true;
    }
    
    // RPG Campaigns
    match /campaigns/{campaignId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if true;
    }
    
    // Campaign Session Messages (Chat, Roll logs, Combat actions, System notifications)
    match /campaign_messages/{messageId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if true;
    }
    
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
  }
}
"""

with open('firestore.rules', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Rewritten firestore rules correctly")
