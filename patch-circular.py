import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# The error Uncaught TypeError: Converting circular structure to JSON 
# probably comes from `updateUserPresence(uid, true, currentGoogleUser, currentUserProfile);`
# updatePresence expects simple types but currentGoogleUser is a complex Firebase User object.

# Let's check `updateUserPresence` signature in firebase.ts
