import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
    const viewerRole = window.currentUserProfile?.role || 'JOGADOR';
    const canDelete = viewerRole === 'OWNER' || viewerRole === 'ADM';
    const deleteBtn = canDelete ? `<button onclick="window.deleteSessionMessage('${msg.id || ''}')" class="text-slate-500 hover:text-red-400 ml-2" title="Excluir"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>` : '';

    html += `
      <div class="p-3.5 rounded-xl border ${cardBg} space-y-1.5 shadow-md select-text animate-fade-in group">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            ${roleBadge}
            <span class="font-orbitron font-bold text-xs text-white">${escapeHtml(msg.senderName || 'Desconhecido')}</span>
          </div>
          <div class="flex items-center">
            <span class="text-[10px] text-slate-500 font-mono">${timeStr}</span>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
              ${deleteBtn}
            </div>
          </div>
        </div>
"""

content = content.replace("""
    html += `
      <div class="p-3.5 rounded-xl border ${cardBg} space-y-1.5 shadow-md select-text animate-fade-in">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            ${roleBadge}
            <span class="font-orbitron font-bold text-xs text-white">${escapeHtml(msg.senderName || 'Desconhecido')}</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono">${timeStr}</span>
        </div>""", replacement)

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched auth-app.ts with delete button")
