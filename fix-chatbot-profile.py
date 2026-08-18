import sys
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("window.currentUserProfile?.role || 'JOGADOR'", "window.currentUserProfile?.role || 'PLAYER'")
content = content.replace("rounded\">JOGADOR</span>", "rounded\">PLAYER</span>")

# Also let's check if playerProfile is hardcoded somewhere and update it to the proper ghost defaults if it's there
content = content.replace("playerProfile.name", "(window.currentGoogleUser ? (window.currentGoogleUser.displayName || 'Jogador') : 'Aguardando para encarnar...')")
content = content.replace("playerProfile.avatarUrl", "(window.currentGoogleUser ? window.currentGoogleUser.photoURL : 'https://assets-v2.lottiefiles.com/a/2c79e772-1181-11ee-a2d8-83ae705f2af6/YOgxHDDL2U.gif')")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed chatbot profile data")
