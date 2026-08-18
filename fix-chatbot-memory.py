import sys
import re

# 1. Update index.html for memory and avatars
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix broken image links by using valid default avatars if config is missing
replacement = r"""
      const auroraDefault = 'https://i.pinimg.com/1200x/29/79/11/2979116e033deea5086d790401889aeb.jpg';
      const irisDefault = 'https://i.pinimg.com/1200x/57/40/f4/5740f4236bd1e97669d0ce468494b8e2.jpg';
      const avatarSrc = isAurora ? (window.globalAiConfig?.auroraAvatar || auroraDefault) : (window.globalAiConfig?.irisAvatar || irisDefault);
"""

content = re.sub(
    r"const avatarSrc = isAurora \? \(window.globalAiConfig \? window.globalAiConfig.auroraAvatar : '.*?'\) : \(window.globalAiConfig \? window.globalAiConfig.irisAvatar : '.*?'\);", 
    replacement.strip(), 
    content
)

# Open Memory Modal instead of toast
content = content.replace("showToast('Acessando memória de preferências...')", "openModal('chatbot-memory-modal')")

# Inject Memory Modal HTML
memory_modal = """
  <!-- MODAL: CHATBOT MEMORY -->
  <div id="chatbot-memory-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 hidden">
    <div class="glass-card w-full max-w-lg rounded-2xl flex flex-col border border-purple-500/40 shadow-neon-purple overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b border-purple-500/30 flex justify-between items-center bg-cosmic-950/80">
        <div class="flex items-center space-x-3">
          <span class="text-xl">🧠</span>
          <div>
            <h3 class="text-white font-rajdhani font-bold text-lg">Memória das Companheiras</h3>
            <p class="text-xs text-slate-400">Instruções e preferências que as IAs sempre vão lembrar sobre você.</p>
          </div>
        </div>
        <button onclick="closeModal('chatbot-memory-modal')" class="text-slate-400 hover:text-white p-1">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <!-- Content -->
      <div class="p-4 space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider font-orbitron">Instruções Personalizadas</label>
          <textarea id="chatbot-memory-input" rows="6" placeholder="Ex: 'Sempre me chame de Vossa Majestade', 'Foque as dicas de combos apenas no sistema de Tormenta20', 'Não use emojis', etc..." class="w-full bg-cosmic-950 border border-purple-500/30 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500 resize-none font-mono"></textarea>
        </div>
      </div>
      <!-- Footer -->
      <div class="p-4 border-t border-purple-500/30 bg-cosmic-950/50 flex justify-end space-x-3">
        <button onclick="closeModal('chatbot-memory-modal')" class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-colors">CANCELAR</button>
        <button onclick="saveChatbotMemory()" class="btn-purple-neon px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center space-x-1.5">
          <i data-lucide="save" class="w-4 h-4"></i>
          <span>SALVAR MEMÓRIA</span>
        </button>
      </div>
    </div>
  </div>
"""

content = content.replace("<!-- 5. MODAL: TOAST -->", memory_modal + "\n  <!-- 5. MODAL: TOAST -->")

# Inject Memory fetch logic
memory_logic = """
    let userChatbotMemory = "";

    window.saveChatbotMemory = async function() {
      const input = document.getElementById('chatbot-memory-input');
      const val = input.value.trim();
      userChatbotMemory = val;
      
      if (window.currentGoogleUser && window.db && window.doc && window.setDoc) {
        try {
          const userRef = window.doc(window.db, 'users', window.currentGoogleUser.uid);
          await window.setDoc(userRef, { chatbotMemory: val }, { merge: true });
          showToast("Memória salva na nuvem com sucesso!", "success");
        } catch (e) {
          showToast("Salvo apenas localmente (erro no banco).", "warning");
        }
      } else {
        showToast("Memória salva localmente (faça login para sincronizar).", "info");
      }
      closeModal('chatbot-memory-modal');
    };

    window.loadChatbotMemory = async function(uid) {
      if (window.db && window.getDoc && window.doc) {
        const docSnap = await window.getDoc(window.doc(window.db, 'users', uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.chatbotMemory) {
            userChatbotMemory = data.chatbotMemory;
            const input = document.getElementById('chatbot-memory-input');
            if (input) input.value = userChatbotMemory;
          }
        }
      }
    };
"""

content = content.replace("// Chatbot Íris & Aurora Sending", memory_logic + "\n    // Chatbot Íris & Aurora Sending")

# Inject memory payload into fetch call
content = content.replace(
    "body: JSON.stringify({ message: text, history: historyCopy, isAurora: isAurora })",
    "body: JSON.stringify({ message: text, history: historyCopy, isAurora: isAurora, userMemory: userChatbotMemory })"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched index.html")
