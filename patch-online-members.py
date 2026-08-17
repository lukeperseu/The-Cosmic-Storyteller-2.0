import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
let aiStatus = { online: false, message: 'Verificando conexão...' };
let lastOnlineUsers: PresenceData[] = [];

async function checkAiStatus() {
  try {
    const res = await fetch('/api/ai-status');
    const data = await res.json();
    aiStatus = data;
    renderOnlineMembers(lastOnlineUsers);
  } catch (e) {
    aiStatus = { online: false, message: 'Servidor Inacessível' };
    renderOnlineMembers(lastOnlineUsers);
  }
}

// Call on boot
setTimeout(() => checkAiStatus(), 2000);

function renderOnlineMembers(users: PresenceData[]) {
  lastOnlineUsers = users;
  const container = document.getElementById('online-members-container');
  const countEl = document.getElementById('online-members-count');
  
  const currentUid = currentGoogleUser?.uid || getLocalSessionId();
  
  // Ensure current user is in the displayed list if online
  let displayUsers = [...users];
  const hasCurrent = displayUsers.some(u => u.uid === currentUid);
  if (!hasCurrent) {
    displayUsers.unshift({
      uid: currentUid,
      username: currentUserProfile?.username || (currentGoogleUser ? currentGoogleUser.displayName : null) || 'Você (Aventureiro)',
      photoURL: currentUserProfile?.photoURL || currentGoogleUser?.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg',
      role: currentUserProfile?.role || (currentGoogleUser ? 'JOGADOR' : 'CONVIDADO'),
      isOnline: true,
      statusText: 'No Menu Principal'
    } as PresenceData);
  }

  // Add AIs
  const statusColor = aiStatus.online ? 'bg-emerald-400' : 'bg-red-500';
  const statusText = aiStatus.online ? 'Operacional' : 'Offline / Erro de Auth';

  const irisHtml = `
    <div class="inline-flex items-center space-x-2 bg-[#0d1122] hover:bg-[#161c34] border border-purple-500/30 hover:border-purple-500/60 rounded-full pl-1.5 pr-3 py-1 text-xs transition-all shadow-sm group cursor-default" title="Íris Arcádia - ${statusText}">
      <div class="relative">
        <div class="w-5 h-5 rounded-full bg-[#1a112c] border border-red-500 flex items-center justify-center text-[10px]">🔮</div>
        <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${statusColor} border border-black shadow-sm"></span>
      </div>
      <span class="font-bold text-white font-rajdhani text-xs tracking-wide group-hover:text-purple-300 transition-colors">Íris Arcádia</span>
      ${getRoleBadgeHtml('IA NARRADORA', false, 'px-1.5', 'py-0.2')}
    </div>
  `;

  const auroraHtml = `
    <div class="inline-flex items-center space-x-2 bg-[#0d1122] hover:bg-[#161c34] border border-emerald-500/30 hover:border-emerald-500/60 rounded-full pl-1.5 pr-3 py-1 text-xs transition-all shadow-sm group cursor-default" title="Aurora - ${statusText}">
      <div class="relative">
        <div class="w-5 h-5 rounded-full bg-[#0a1a10] border border-[#39ff14] flex items-center justify-center text-[10px]">⚙️</div>
        <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${statusColor} border border-black shadow-sm"></span>
      </div>
      <span class="font-bold text-[#39ff14] font-rajdhani text-xs tracking-wide group-hover:text-emerald-300 transition-colors">Aurora</span>
      ${getRoleBadgeHtml('IA MEDIADORA', false, 'px-1.5', 'py-0.2')}
    </div>
  `;

  if (countEl) {
    countEl.innerText = (displayUsers.length + 2).toString();
  }

  if (!container) return;

  const usersHtml = displayUsers.map(user => {
    const isMe = user.uid === currentUid;
    const photo = user.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg';
    let roleBadge = getRoleBadgeHtml(user.role || 'JOGADOR', isMe, 'px-1.5', 'py-0.2');

    return `
      <div class="inline-flex items-center space-x-2 bg-[#0d1122] hover:bg-[#161c34] border border-purple-500/30 hover:border-purple-500/60 rounded-full pl-1.5 pr-3 py-1 text-xs transition-all shadow-sm group cursor-default" title="${user.username} - ${user.statusText || 'Online'}">
        <div class="relative">
          <img src="${photo}" alt="${user.username}" class="w-5 h-5 rounded-full object-cover border border-purple-500/50">
          <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-sm"></span>
        </div>
        <span class="font-bold text-white font-rajdhani text-xs tracking-wide group-hover:text-purple-300 transition-colors">
          ${user.username}
        </span>
        ${roleBadge}
      </div>
    `;
  }).join('');

  container.innerHTML = irisHtml + auroraHtml + usersHtml;
}
"""

# find start and end
start_str = "function renderOnlineMembers(users: PresenceData[]) {"
end_str = "// Initial presence and listeners setup"

idx_start = content.find(start_str)
idx_end = content.find(end_str)

if idx_start != -1 and idx_end != -1:
    new_content = content[:idx_start] + replacement.strip() + "\n\n" + content[idx_end:]
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched renderOnlineMembers")
else:
    print("Could not find renderOnlineMembers bounds")
