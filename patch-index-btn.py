import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

global_chat_replace = """
      const canDelete = activeRole === 'OWNER' || activeRole === 'ADM';
      const deleteBtn = canDelete ? `<button onclick="this.closest('.flex').remove()" class="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-950/30 transition-colors ml-2" title="Excluir"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>` : '';

      const feed = document.getElementById('chat-global-feed');
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex items-start space-x-2.5 group';
      msgDiv.innerHTML = `
        <img src="${activePhoto}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-purple-500/40">
        <div>
          <div class="flex items-center space-x-2 mb-1">
            ${roleBadge}
            <span class="font-bold text-purple-200 font-rajdhani">${escapeHtml(activeName)}</span>
            <div class="flex items-center">
              <span class="text-[10px] text-slate-500">Agora</span>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                ${deleteBtn}
              </div>
            </div>
          </div>
          <div class="bg-cosmic-950 border border-purple-500/20 p-2.5 rounded-xl text-slate-200">
            ${escapeHtml(text)}
          </div>
        </div>
      `;
"""

chatbot_replace = """
      const canDelete = activeRole === 'OWNER' || activeRole === 'ADM';
      const deleteBtn = canDelete ? `<button onclick="this.closest('.flex').remove()" class="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-950/30 transition-colors ml-2" title="Excluir"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>` : '';

      const feed = document.getElementById('chatbot-feed');
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex items-start space-x-3 justify-end group';
      msgDiv.innerHTML = `
        <div class="text-right">
          <div class="flex items-center justify-end space-x-2 mb-1">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center mr-2">
              ${deleteBtn}
            </div>
            <span class="font-bold text-purple-200 font-rajdhani">${escapeHtml(activeName)}</span>
            ${roleBadge}
            <span class="text-[10px] text-slate-500">Agora</span>
          </div>
          <div class="bg-purple-900/50 border border-purple-500/40 p-3 rounded-2xl max-w-md text-white text-left">
            ${escapeHtml(text)}
          </div>
        </div>
        <img src="${activePhoto}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-purple-500/40">
      `;
"""

# Replace in global chat
content = content.replace("""
      const feed = document.getElementById('chat-global-feed');
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex items-start space-x-2.5';
      msgDiv.innerHTML = `
        <img src="${activePhoto}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-purple-500/40">
        <div>
          <div class="flex items-center space-x-2 mb-1">
            ${roleBadge}
            <span class="font-bold text-purple-200 font-rajdhani">${escapeHtml(activeName)}</span>
            <span class="text-[10px] text-slate-500">Agora</span>
          </div>
          <div class="bg-cosmic-950 border border-purple-500/20 p-2.5 rounded-xl text-slate-200">
            ${escapeHtml(text)}
          </div>
        </div>
      `;
""", global_chat_replace)

# Replace in chatbot
content = content.replace("""
      const feed = document.getElementById('chatbot-feed');
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex items-start space-x-3 justify-end';
      msgDiv.innerHTML = `
        <div class="text-right">
          <div class="flex items-center justify-end space-x-2 mb-1">
            <span class="font-bold text-purple-200 font-rajdhani">${escapeHtml(activeName)}</span>
            ${roleBadge}
            <span class="text-[10px] text-slate-500">Agora</span>
          </div>
          <div class="bg-purple-900/50 border border-purple-500/40 p-3 rounded-2xl max-w-md text-white text-left">
            ${escapeHtml(text)}
          </div>
        </div>
        <img src="${activePhoto}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-purple-500/40">
      `;
""", chatbot_replace)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.html for global/chatbot delete buttons")
