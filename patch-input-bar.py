import sys
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
      <!-- Suggestions Bar -->
      <div class="px-4 py-2 bg-cosmic-950/80 border-t border-purple-500/20 flex items-center space-x-2 overflow-x-auto hide-scrollbar">
         <button onclick="document.getElementById('chatbot-input').value = 'Aurora, me ajude a criar uma ficha de personagem nova!'; handleSendChatbot(new Event('submit'))" class="shrink-0 bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/50 px-3 py-1.5 rounded-full text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-colors">
            <span>✨ CRIAR FICHA COM A AURORA</span>
         </button>
      </div>

      <!-- Chatbot Input Bar -->
      <form onsubmit="handleSendChatbot(event)" class="p-3 bg-cosmic-950 border-t border-purple-500/20 flex items-center space-x-2">
"""

content = content.replace("<!-- Chatbot Input Bar -->\n      <form onsubmit=\"handleSendChatbot(event)\"", replacement.strip())

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched suggestion button")
