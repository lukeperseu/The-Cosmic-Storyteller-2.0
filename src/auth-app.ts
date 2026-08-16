import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  checkUsernameAvailable, 
  registerCustomUsername, 
  getUserProfile, 
  onAuthStateChanged,
  saveCharacter,
  getUserCharacters,
  UserProfileData,
  CharacterClass,
  CharacterData,
  updateUserPresence,
  subscribeToOnlinePresence,
  PresenceData,
  uploadTextFile,
  deleteUploadedFile,
  subscribeToUploadedFiles,
  getUploadedFileById,
  UploadedFileData,
  FileCategory,
  CampaignData,
  createCampaign,
  subscribeToCampaigns,
  deleteCampaign,
  getCampaignById,
  sendSessionMessage,
  subscribeToSessionMessages,
  updateCharacterPVPM,
  updateCharacterInventory,
  SessionMessage
} from './firebase';

let currentGoogleUser: any = null;
let currentUserProfile: UserProfileData | null = null;
let liveCheckDebounceTimer: any = null;
let isCurrentUsernameValid = false;

// Declare on window so inline onclick handlers in index.html work seamlessly
declare global {
  interface Window {
    handleGoogleLogin: () => Promise<void>;
    handleGoogleLogout: () => Promise<void>;
    openUsernameModal: (isChange?: boolean) => void;
    closeUsernameModal: () => void;
    checkUsernameLive: (val?: string) => Promise<void>;
    submitCustomUsername: (e: Event) => Promise<void>;
    toggleSecondClass: () => void;
    characterClasses: CharacterClass[];
    renderClasses: () => void;
    addClassUI: () => void;
    removeClassUI: (idx: number) => void;
    updateClassProp: (idx: number, prop: 'name' | 'level', val: any) => void;
    updateTotalLevel: () => void;
    saveCharacterUI: () => Promise<void>;
    openPersonagensModal: () => Promise<void>;
    editCharacter: (charId: string) => void;
    resetCharacterForm: () => void;
    loadedCharacters: any[];
    editingCharacterId: string | null;
    characterAttributes: any[];
    addAttributeUI: () => void;
    updateAttributeValue: (attrId: string, index: number, value: number) => void;
    renderAttributes: () => void;
    removeAttribute: (attrId: string) => void;
    characterSkills: any[];
    defaultSkills: any[];
    renderSkills: () => void;
    updateSkillProp: (idx: number, prop: string, value: any) => void;
    addCustomSkill: () => void;
    removeCustomSkill: (idx: number) => void;
    characterDefenseBoxes: any[];
    renderDefense: () => void;
    updateDefenseTotalOnly: () => void;
    updateDefenseBox: (idx: number, prop: string, value: any) => void;
    updateDefenseBoxType: (idx: number, type: string) => void;
    addDefenseBox: () => void;
    removeDefenseBox: (idx: number) => void;
    characterInventory: any[];
    renderInventory: () => void;
    renderEquippedGearTab: () => void;
    unequipItemById: (itemId: string) => void;
    updateInventoryItem: (idx: number, prop: string, value: any) => void;
    toggleEquipItem: (idx: number, isEquipped: boolean) => void;
    addInventoryItem: () => void;
    removeInventoryItem: (idx: number) => void;
    characterAttacks: any[];
    renderAttacks: () => void;
    addAttack: () => void;
    removeAttack: (idx: number) => void;
    updateAttackProp: (idx: number, prop: string, value: any) => void;
    addAttackDamageComponent: (atkIdx: number) => void;
    removeAttackDamageComponent: (atkIdx: number, compIdx: number) => void;
    updateAttackDamageComponent: (atkIdx: number, compIdx: number, prop: string, value: any) => void;
    rollAttackTest: (idx: number) => void;
    rollAttackDamage: (idx: number, isCritical?: boolean) => void;
    characterCustomSections: any[];
    renderCustomSections: () => void;
    addCustomSection: () => void;
    removeCustomSection: (idx: number) => void;
    updateCustomSection: (idx: number, prop: 'title' | 'content', value: string) => void;
    openGeradorAtributos: () => void;
    setGeradorMethod: (method: 'points' | 'rolls') => void;
    updatePointValue: (index: number, delta: number) => void;
    rollDice: () => void;
    updateRollAssignment: (attrIdx: number, resultIdx: number) => void;
    applyGerador: () => void;
    renderPointsTab: () => string;
    renderRollsTab: () => string;
    renderGeradorModal: () => void;
    geradorState: any;
    currentUserProfile: UserProfileData | null;
    currentGoogleUser: any;
    updateProfileUI: () => void;
    showToast: (msg: string, type?: string) => void;
    openModal: (id: string) => void;
    closeModal: (id: string) => void;
    characterMoney: number;
    characterCurrencyName: string;
    updateCharacterMoney: (val: number) => void;
    updateCharacterCurrencyName: (val: string) => void;
    updateInventoryWeightDisplay: () => void;
    applyStartingMoneyAndGear: (level: number, moneyAmount: number) => void;
    characterEpisodes: CharacterEpisode[];
    addEpisode: () => void;
    removeEpisode: (idx: number) => void;
    updateEpisode: (idx: number, prop: 'title' | 'summary' | 'rewards', value: string) => void;
    renderEpisodes: () => void;
    toggleAccordionTab: (contentId: string, btnEl?: HTMLElement) => void;
    expandAllAccordionTabs: () => void;
    collapseAllAccordionTabs: () => void;
    toggleTextareaExpand: (target: string | HTMLElement, btnEl?: HTMLElement) => void;
    autoExpandTextarea: (el: HTMLTextAreaElement) => void;
    allUploadedFiles: UploadedFileData[];
    uploadedFilesFilterKeyword: string;
    currentViewingFile: UploadedFileData | null;
    openArquivosModal: () => void;
    handleUploadFile: (category: FileCategory, fileList: FileList | null) => Promise<void>;
    viewUploadedFile: (fileId: string) => Promise<void>;
    downloadUploadedFile: (fileId: string) => void;
    deleteUploadedFileUI: (fileId: string) => Promise<void>;
    renderUploadedFilesUI: () => void;
    filterUploadedFilesUI: (keyword: string) => void;
    closeFileViewerModal: () => void;
    copyViewerContent: () => void;
    copyToClipboard: (text: string) => void;
    allCampaigns: CampaignData[];
    activeCampaign: CampaignData | null;
    selectedCampaignCharacterId: string;
    activeCampaignFilter: string;
    campaignSearchQuery: string;
    openCarregarCampanhaModal: () => Promise<void>;
    closeCarregarCampanhaModal: () => void;
    renderCampaignsListUI: () => void;
    setCampaignFilter: (filterType: string) => void;
    filterCampaignsList: (query: string) => void;
    loadAndContinueCampaign: (campaignId: string) => Promise<void>;
    deleteCampaignUI: (campaignId: string, campaignName: string) => Promise<void>;
    renderGlobalCampaignsListUI: () => void;
    openNovaCampanhaModal: () => void;
    closeNovaCampanhaModal: () => void;
    handleNovaCampanhaSubmit: (e: Event) => Promise<void>;
    onCampaignSystemChange: () => void;
    selectCampaignCharacter: (charId: string) => void;
    populateNovaCampanhaSelects: () => void;
    renderCampaignCharacterSelector: () => void;
    createNewCharacterForSystem: (systemName: string) => void;
    enterGameSession: (campaignId?: string) => Promise<void>;
    exitGameSession: () => void;
    activeGameCampaign: CampaignData | null;
    activeGameCharacter: any;
    toggleGameLeftSidebar: () => void;
    closeGameLeftSidebarMobile: () => void;
    setGameSheetTab: (tabId: string) => void;
    copyCurrentTabContent: () => void;
    toggleGameRightSidebar: () => void;
    closeGameRightSidebarMobile: () => void;
    updateGameHUD: () => void;
    modifyCharacterStat: (stat: 'pv' | 'pm', delta: number) => Promise<void>;
    promptCustomStatChange: (stat: 'pv' | 'pm') => void;
    renderEquippedWeapons: () => void;
    renderEquippedArmor: () => void;
    renderConsumableItems: () => void;
    useConsumableItem: (itemIndex: number) => Promise<void>;
    promptAddConsumableItem: () => void;
    setSessionActionMode: (mode: 'speech' | 'action' | 'thought' | 'narrator') => void;
    handleChatInputKeydown: (e: KeyboardEvent) => void;
    handleSendSessionMessage: (e: Event) => Promise<void>;
    quickRollDice: (formula: string, label: string) => Promise<void>;
    rollCharacterAttack: (weaponName: string, atkBonus: number, dmgFormula: string, critRange: string) => Promise<void>;
    executeDiceModalRoll: () => void;
    setDiceModalDie: (dieName: string) => void;
    triggerQuickAttackModal: () => void;
    executeCharacterRest: (type: 'curto' | 'longo') => Promise<void>;
    saveSessionNotesLocal: (text: string) => void;
    copySessionNotes: () => void;
    filterRulesSearch: (query: string) => void;
    clearSessionChatFeed: () => void;
    renderSessionMessages: (messages: SessionMessage[]) => void;
  }
}

/**
 * Utility helper to safely escape strings for HTML injection
 */
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Update UI across header, sidebar, account modal and options modal with logged in user data
 */
function updateAppUIWithProfile(profile: UserProfileData | null, gUser: any | null) {
  const username = profile?.username || 'Convidado';
  const email = profile?.email || gUser?.email || 'convidado@cosmos.local';
  const photo = profile?.photoURL || gUser?.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg';
  const role = profile?.role || 'JOGADOR';

  // Window references
  window.currentUserProfile = profile;
  window.currentGoogleUser = gUser;

  // Header Elements
  const headerName = document.getElementById('header-username');
  const headerAvatar = document.getElementById('header-avatar-img');
  if (headerName) headerName.innerText = username;
  if (headerAvatar && headerAvatar instanceof HTMLImageElement) headerAvatar.src = photo;

  // Sidebar Elements
  const sidebarName = document.getElementById('sidebar-username');
  const sidebarAvatar = document.getElementById('sidebar-avatar-img');
  if (sidebarName) sidebarName.innerText = username;
  if (sidebarAvatar && sidebarAvatar instanceof HTMLImageElement) sidebarAvatar.src = photo;

  // Account Modal Elements
  const modalName = document.getElementById('modal-account-username');
  const modalAvatar = document.getElementById('modal-account-avatar-img');
  const modalEmail = document.getElementById('modal-account-email');
  const authStatusBadge = document.getElementById('account-auth-status-badge');
  const loginGoogleBtn = document.getElementById('account-login-google-btn');
  const logoutBtn = document.getElementById('account-logout-btn');
  const changeUsernameBtn = document.getElementById('account-change-username-btn');

  if (modalName) modalName.innerText = username;
  if (modalAvatar && modalAvatar instanceof HTMLImageElement) modalAvatar.src = photo;
  if (modalEmail) modalEmail.innerText = email;

  if (authStatusBadge) {
    if (gUser) {
      authStatusBadge.innerHTML = `
        <span class="text-emerald-400 flex items-center space-x-1.5 font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>✓ Autenticado via Google Auth (${gUser.email})</span>
        </span>
      `;
    } else {
      authStatusBadge.innerHTML = `
        <span class="text-amber-400 flex items-center space-x-1.5 font-semibold">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Modo Convidado (Não Conectado)</span>
        </span>
      `;
    }
  }

  if (loginGoogleBtn) {
    if (gUser) {
      loginGoogleBtn.classList.add('hidden');
    } else {
      loginGoogleBtn.classList.remove('hidden');
    }
  }

  if (logoutBtn) {
    if (gUser) {
      logoutBtn.classList.remove('hidden');
    } else {
      logoutBtn.classList.add('hidden');
    }
  }

  if (changeUsernameBtn) {
    if (gUser) {
      changeUsernameBtn.classList.remove('hidden');
    } else {
      changeUsernameBtn.classList.add('hidden');
    }
  }

  // Options Modal Preview
  const optName = document.getElementById('options-preview-username');
  const optAvatar = document.getElementById('options-preview-avatar');
  const optEmail = document.getElementById('options-preview-email');
  if (optName) optName.innerText = username;
  if (optAvatar && optAvatar instanceof HTMLImageElement) optAvatar.src = photo;
  if (optEmail) optEmail.innerText = email;

  // Options Input
  const nameInput = document.getElementById('input-username') as HTMLInputElement;
  if (nameInput) nameInput.value = username;

  const urlInput = document.getElementById('input-avatar-url') as HTMLInputElement;
  if (urlInput) urlInput.value = photo;
}

/**
 * Handle Google Login
 */
window.handleGoogleLogin = async function() {
  try {
    if (window.showToast) window.showToast("Iniciando Login do Google...", "info");
    const user = await loginWithGoogle();
    currentGoogleUser = user;

    // Check if user already exists in Firestore
    const existingProfile = await getUserProfile(user.uid);

    if (existingProfile && existingProfile.username) {
      currentUserProfile = existingProfile;
      updateAppUIWithProfile(existingProfile, user);
      if (window.showToast) window.showToast(`Bem-vindo de volta, ${existingProfile.username}! 🚀`);
    } else {
      // User doesn't have a username yet! Force open username modal
      if (window.showToast) window.showToast("Google Auth concluído! Agora escolha seu nome único.", "success");
      window.openUsernameModal(false);
    }
  } catch (error: any) {
    console.error("Google Login failed:", error);
    if (window.showToast) window.showToast("Erro ao autenticar com o Google. Tente novamente.", "error");
  }
};

/**
 * Handle Logout
 */
window.handleGoogleLogout = async function() {
  try {
    await logoutUser();
    currentGoogleUser = null;
    currentUserProfile = null;
    updateAppUIWithProfile(null, null);
    if (window.closeModal) window.closeModal('account-modal');
    if (window.showToast) window.showToast("Sessão encerrada com sucesso.", "info");
  } catch (err) {
    console.error("Logout error:", err);
  }
};

/**
 * Open Custom Username Creation Modal
 */
window.openUsernameModal = function(isChange = false) {
  const modal = document.getElementById('create-username-modal');
  const title = document.getElementById('username-modal-title');
  const subtitle = document.getElementById('username-modal-subtitle');
  const input = document.getElementById('input-custom-username') as HTMLInputElement;

  if (title) {
    title.innerText = isChange ? "✏️ ALTERAR NOME DE USUÁRIO ÚNICO" : "⚡ CRIAR SEU NOME DE USUÁRIO ÚNICO";
  }

  if (subtitle) {
    subtitle.innerText = isChange 
      ? "Altere seu identificador exclusivo no banco de dados Firebase. Seu nome anterior ficará livre."
      : "Sua conta do Google foi vinculada. Agora escolha um nome exclusivo para aparecer no jogo e nas campanhas.";
  }

  if (input) {
    input.value = currentUserProfile?.username || currentGoogleUser?.displayName?.replace(/\s+/g, '_').toLowerCase() || '';
  }

  if (modal) {
    modal.classList.remove('hidden');
  }

  // Trigger initial check
  window.checkUsernameLive();
};

window.closeUsernameModal = function() {
  const modal = document.getElementById('create-username-modal');
  if (modal) modal.classList.add('hidden');
};

/**
 * Live validation of username input against Firebase Firestore
 */
window.checkUsernameLive = async function(val?: string) {
  const input = document.getElementById('input-custom-username') as HTMLInputElement;
  const statusDiv = document.getElementById('username-availability-status');
  const saveBtn = document.getElementById('btn-save-custom-username') as HTMLButtonElement;

  const text = (val !== undefined ? val : input?.value || '').trim();

  if (liveCheckDebounceTimer) clearTimeout(liveCheckDebounceTimer);

  if (!text) {
    if (statusDiv) {
      statusDiv.className = 'p-3 rounded-xl bg-cosmic-950 border border-purple-500/20 text-xs font-rajdhani text-slate-400';
      statusDiv.innerHTML = '🔍 Digite um nome para verificar a disponibilidade no Firebase.';
    }
    if (saveBtn) saveBtn.disabled = true;
    isCurrentUsernameValid = false;
    return;
  }

  if (statusDiv) {
    statusDiv.className = 'p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-rajdhani text-purple-300 animate-pulse';
    statusDiv.innerHTML = '🔄 Consultando base de dados do Firebase em tempo real...';
  }

  liveCheckDebounceTimer = setTimeout(async () => {
    const res = await checkUsernameAvailable(text, currentGoogleUser?.uid);

    if (statusDiv) {
      if (res.available) {
        statusDiv.className = 'p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-xs font-rajdhani text-emerald-200 font-bold';
        statusDiv.innerHTML = `✓ ${res.message}`;
        if (saveBtn) saveBtn.disabled = false;
        isCurrentUsernameValid = true;
      } else {
        statusDiv.className = 'p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-xs font-rajdhani text-red-200 font-bold';
        statusDiv.innerHTML = `❌ ${res.message}`;
        if (saveBtn) saveBtn.disabled = true;
        isCurrentUsernameValid = false;
      }
    }
  }, 300);
};

/**
 * Submit Custom Username Form
 */
window.submitCustomUsername = async function(e: Event) {
  e.preventDefault();
  const input = document.getElementById('input-custom-username') as HTMLInputElement;
  const saveBtn = document.getElementById('btn-save-custom-username') as HTMLButtonElement;
  const username = input.value.trim();

  if (!username || !currentGoogleUser) {
    if (!currentGoogleUser) {
      if (window.showToast) window.showToast("Você precisa estar conectado com uma conta Google!", "error");
    }
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerText = "RESERVANDO NO FIREBASE...";
  }

  try {
    const oldUsername = currentUserProfile?.username;
    const profile = await registerCustomUsername(currentGoogleUser, username, oldUsername);
    currentUserProfile = profile;

    updateAppUIWithProfile(profile, currentGoogleUser);
    sendPresenceHeartbeat(true);
    window.closeUsernameModal();

    if (window.showToast) {
      window.showToast(`✨ Nome de usuário '@${profile.username}' registrado com sucesso no Firebase!`, "success");
    }
  } catch (err: any) {
    console.error("Error registering username:", err);
    if (window.showToast) {
      window.showToast(`Erro ao registrar nome: ${err.message || 'Falha no servidor.'}`, "error");
    }
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerText = "CONFIRMAR NOME DE USUÁRIO 🚀";
    }
  }
};

function getLocalSessionId(): string {
  let id = localStorage.getItem('ordos_session_uid');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('ordos_session_uid', id);
  }
  return id;
}

function sendPresenceHeartbeat(isOnline = true) {
  const uid = currentGoogleUser?.uid || getLocalSessionId();
  const username = currentUserProfile?.username || (currentGoogleUser ? currentGoogleUser.displayName : null) || 'Aventureiro Convidado';
  const photoURL = currentUserProfile?.photoURL || currentGoogleUser?.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg';
  const role = currentUserProfile?.role || (currentGoogleUser ? 'JOGADOR' : 'CONVIDADO');

  updateUserPresence({
    uid,
    username,
    photoURL,
    role,
    isOnline,
    statusText: 'No Menu Principal'
  });
}

function renderOnlineMembers(users: PresenceData[]) {
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
    });
  }

  if (countEl) {
    countEl.innerText = displayUsers.length.toString();
  }

  if (!container) return;

  if (displayUsers.length === 0) {
    container.innerHTML = `
      <span class="text-xs text-slate-500 font-rajdhani italic">Nenhum membro detectado.</span>
    `;
    return;
  }

  container.innerHTML = displayUsers.map(user => {
    const isMe = user.uid === currentUid;
    const photo = user.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg';
    let roleBadge = '';
    if (user.role === 'MESTRE') {
      roleBadge = '<span class="bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[9px] font-orbitron font-bold px-1 py-0.2 rounded">GM</span>';
    } else if (isMe) {
      roleBadge = '<span class="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[9px] font-orbitron font-bold px-1.5 py-0.2 rounded">VOCÊ</span>';
    } else if (user.role) {
      roleBadge = `<span class="bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[9px] font-orbitron px-1 py-0.2 rounded">${user.role}</span>`;
    }

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
}

// Initial presence and listeners setup
sendPresenceHeartbeat(true);
setInterval(() => sendPresenceHeartbeat(true), 30000);
subscribeToOnlinePresence((users) => {
  renderOnlineMembers(users);
});

window.addEventListener('beforeunload', () => {
  sendPresenceHeartbeat(false);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    sendPresenceHeartbeat(true);
  }
});

// Listen to Firebase Auth state change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentGoogleUser = user;
    const profile = await getUserProfile(user.uid);
    if (profile) {
      currentUserProfile = profile;
      updateAppUIWithProfile(profile, user);
      sendPresenceHeartbeat(true);
    } else {
      updateAppUIWithProfile(null, user);
      // Automatically prompt for username if new Google login
      window.openUsernameModal(false);
      sendPresenceHeartbeat(true);
    }
  } else {
    currentGoogleUser = null;
    currentUserProfile = null;
    updateAppUIWithProfile(null, null);
    sendPresenceHeartbeat(true);
  }
});

/**
 * Multi-class state and management for character sheet
 */
window.characterClasses = [
  { id: 'cls_1', name: '', level: 1 }
];

/**
 * Calculates and updates total level automatically from sum of class levels
 */
window.updateTotalLevel = function() {
  const classes = window.characterClasses || [];
  let sum = 0;
  for (const c of classes) {
    const lvl = parseInt(c.level as any) || 0;
    sum += Math.max(0, lvl);
  }
  const total = sum > 0 ? sum : 1;

  const levelInput = document.getElementById('char-level') as HTMLInputElement;
  if (levelInput) {
    levelInput.value = String(total);
  }

  const badge = document.getElementById('char-level-badge');
  if (badge) {
    badge.innerText = `Nível ${total}`;
  }

  const countBadge = document.getElementById('classes-count-badge');
  if (countBadge) {
    const count = classes.length;
    countBadge.innerText = `${count} ${count === 1 ? 'classe' : 'classes'}`;
  }

  // Recalculate skills (which depend on half-level)
  if (window.renderSkills) {
    window.renderSkills();
  }
};

/**
 * Renders the dynamic classes list in the Cabeçalho
 */
window.renderClasses = function() {
  const container = document.getElementById('character-classes-list');
  if (!container) return;

  if (!window.characterClasses || window.characterClasses.length === 0) {
    window.characterClasses = [{ id: 'cls_1', name: '', level: 1 }];
  }

  const countBadge = document.getElementById('classes-count-badge');
  if (countBadge) {
    const count = window.characterClasses.length;
    countBadge.innerText = `${count} ${count === 1 ? 'classe' : 'classes'}`;
  }

  container.innerHTML = window.characterClasses.map((cls, idx) => {
    const safeName = (cls.name || '').replace(/"/g, '&quot;');
    const ordinal = `${idx + 1}ª Classe`;

    return `
      <div class="bg-[#0b0f19] border border-[#2d354f] hover:border-purple-500/40 rounded-lg p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition-all">
        <div class="flex items-center justify-between sm:justify-start space-x-2 flex-shrink-0">
          <span class="text-xs font-bold text-purple-300 font-mono min-w-[76px] flex items-center space-x-1">
            <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>${ordinal}</span>
          </span>
          <div class="sm:hidden flex items-center space-x-1.5">
            <span class="text-[11px] text-slate-400 font-bold uppercase">Nível:</span>
            <input 
              type="number" 
              min="1" 
              max="99" 
              value="${cls.level || 1}" 
              oninput="window.updateClassProp(${idx}, 'level', this.value)" 
              class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500 w-16 text-center font-bold"
            >
            ${window.characterClasses.length > 1 ? `
              <button type="button" onclick="window.removeClassUI(${idx})" class="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors" title="Remover Classe">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          </div>
        </div>

        <input 
          type="text" 
          value="${safeName}" 
          oninput="window.updateClassProp(${idx}, 'name', this.value)" 
          placeholder="Nome da Classe (Ex: Bárbaro, Guerreiro, Arcanista, Ladino...)" 
          class="bg-black border border-[#2d354f] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 flex-1 placeholder-slate-600"
        >

        <div class="hidden sm:flex items-center space-x-2 flex-shrink-0">
          <span class="text-[11px] text-slate-400 font-bold uppercase">Nível:</span>
          <input 
            type="number" 
            min="1" 
            max="99" 
            value="${cls.level || 1}" 
            oninput="window.updateClassProp(${idx}, 'level', this.value)" 
            class="bg-black border border-[#2d354f] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 w-16 text-center font-bold"
          >
          ${window.characterClasses.length > 1 ? `
            <button type="button" onclick="window.removeClassUI(${idx})" class="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors" title="Remover Classe">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : `<div class="w-7"></div>`}
        </div>
      </div>
    `;
  }).join('');

  if ((window as any).lucide) {
    (window as any).lucide.createIcons();
  }

  window.updateTotalLevel();
};

/**
 * Adds another class to the character
 */
window.addClassUI = function() {
  if (!window.characterClasses) {
    window.characterClasses = [];
  }
  const nextNum = window.characterClasses.length + 1;
  window.characterClasses.push({
    id: 'cls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: '',
    level: 1
  });
  window.renderClasses();
  if (window.showToast) {
    window.showToast(`${nextNum}ª Classe adicionada!`, 'info');
  }
};

/**
 * Removes a class from the character
 */
window.removeClassUI = function(idx: number) {
  if (!window.characterClasses || window.characterClasses.length <= 1) {
    if (window.characterClasses && window.characterClasses.length === 1) {
      window.characterClasses[0].name = '';
      window.characterClasses[0].level = 1;
      window.renderClasses();
    }
    return;
  }
  window.characterClasses.splice(idx, 1);
  window.renderClasses();
  if (window.showToast) {
    window.showToast('Classe removida.', 'info');
  }
};

/**
 * Updates a property on a class
 */
window.updateClassProp = function(idx: number, prop: 'name' | 'level', val: any) {
  if (!window.characterClasses || !window.characterClasses[idx]) return;
  if (prop === 'level') {
    const parsed = parseInt(val, 10);
    window.characterClasses[idx].level = isNaN(parsed) ? 0 : Math.max(0, parsed);
    window.updateTotalLevel();
  } else {
    window.characterClasses[idx].name = val;
  }
};

/**
 * Backward compatibility stub for legacy toggleSecondClass
 */
window.toggleSecondClass = function() {
  if (window.addClassUI) window.addClassUI();
};

/**
 * Extracts data from the UI and saves it to Firestore
 */
window.saveCharacterUI = async function() {
  if (!currentGoogleUser) {
    if (window.showToast) window.showToast("Você precisa estar conectado para salvar personagens.", "error");
    return;
  }

  const btn = document.getElementById('btn-save-character') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Salvando...";
  }

  try {
    const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
    const getNum = (id: string) => parseInt((document.getElementById(id) as HTMLInputElement)?.value || '0', 10);

    const classes = (window.characterClasses && window.characterClasses.length > 0)
      ? window.characterClasses.map(c => ({
          id: c.id,
          name: (c.name || '').trim(),
          level: Math.max(1, parseInt(c.level as any) || 1)
        }))
      : [{ id: 'cls_1', name: '', level: 1 }];

    const computedTotalLevel = classes.reduce((sum: number, c) => sum + (c.level || 0), 0) || 1;
    const class1 = classes[0]?.name || '';
    const class1Level = classes[0]?.level || 1;
    const class2 = classes[1]?.name || '';
    const class2Level = classes[1]?.level || 0;

    const charData = {
      system: getValue('char-system'),
      name: getValue('char-name') || 'Herói Sem Nome',
      playerName: getValue('char-player'),
      race: getValue('char-race'),
      origin: getValue('char-origin'),
      divinity: getValue('char-divinity'),
      totalLevel: computedTotalLevel,
      alignment: getValue('char-alignment'),
      size: getValue('char-size'),
      speed: getValue('char-speed'),
      age: getNum('char-age'),
      classes: classes,
      class1: class1,
      class1Level: class1Level,
      ...(classes.length > 1 && { 
        class2: class2,
        class2Level: class2Level
      }),
      attributes: window.characterAttributes || [],
      skills: window.characterSkills || [],
      pvAtual: getNum('char-pv-atual'),
      pvMax: getNum('char-pv-max'),
      pmAtual: getNum('char-pm-atual'),
      pmMax: getNum('char-pm-max'),
      defenseBase: parseInt((document.getElementById('char-defense-base') as HTMLInputElement)?.value || '10', 10),
      defenseBoxes: window.characterDefenseBoxes || [],
      inventory: window.characterInventory || [],
      money: parseInt((document.getElementById('char-money') as HTMLInputElement)?.value || '0', 10) || 0,
      currencyName: (document.getElementById('char-currency-name') as HTMLInputElement)?.value || 'T$ (Tibares)',
      attacks: window.characterAttacks || [],
      customSections: window.characterCustomSections || [],
      background: getValue('char-background'),
      eyes: getValue('char-eyes'),
      skin: getValue('char-skin'),
      hair: getValue('char-hair'),
      appearanceOther: getValue('char-appearance-other'),
      personality: getValue('char-personality'),
      genderIdentity: getValue('char-gender-identity'),
      sexualOrientation: getValue('char-sexual-orientation'),
      activism: getValue('char-activism'),
      prejudices: getValue('char-prejudices'),
      likesOther: getValue('char-likes-other'),
      episodes: window.characterEpisodes || []
    };

    await saveCharacter(charData, currentGoogleUser.uid, window.editingCharacterId || undefined);
    
    if (window.showToast) window.showToast(`✨ Personagem '${charData.name}' salvo com sucesso!`, "success");
    if (window.closeModal) window.closeModal('novo-personagem-modal');

  } catch (error: any) {
    console.error("Save failed", error);
    if (window.showToast) window.showToast("Falha ao salvar personagem no servidor.", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = window.editingCharacterId ? "Salvar Alterações" : "Salvar Herói no Banco";
    }
  }
};

/**
 * Opens and populates the My Characters modal
 */
window.openPersonagensModal = async function() {
  window.openModal('personagens-modal');
  const listContainer = document.getElementById('characters-list');
  if (!listContainer) return;

  if (!currentGoogleUser) {
    listContainer.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-sm">
        <div class="text-2xl mb-2">🔒</div>
        Faça login com sua conta Google para ver seus personagens salvos.
      </div>
    `;
    return;
  }

  listContainer.innerHTML = `
    <div class="text-center py-6 text-indigo-400 text-sm flex flex-col items-center justify-center space-y-2">
      <span class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
      <span>Sincronizando banco de dados...</span>
    </div>
  `;

  try {
    const characters = await getUserCharacters(currentGoogleUser.uid);
    window.loadedCharacters = characters; // Store for editing
    
    if (characters.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-sm">
          <div class="text-3xl mb-2 opacity-50">📜</div>
          Você ainda não possui nenhum personagem salvo.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = characters.map(char => {
      const initial = char.name.charAt(0).toUpperCase();
      const level = char.totalLevel || 1;
      let charClass = 'Sem Classe';
      if (char.classes && Array.isArray(char.classes) && char.classes.length > 0) {
        const validClasses = char.classes.filter(c => c.name && c.name.trim());
        if (validClasses.length > 0) {
          charClass = validClasses.map(c => `${c.name} ${c.level || 1}`).join(' / ');
        }
      } else if (char.class1) {
        charClass = char.class2 
          ? `${char.class1} ${char.class1Level || 1} / ${char.class2} ${char.class2Level || 1}`
          : `${char.class1} ${char.class1Level || 1}`;
      }
      
      return `
        <div class="bg-[#0b0f19] border border-[#1e2336] p-3.5 rounded-xl flex items-center justify-between hover:border-indigo-500/30 transition-colors">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-[#1e2336] flex items-center justify-center font-orbitron font-bold text-indigo-300 text-lg">${initial}</div>
            <div>
              <h4 class="font-rajdhani font-bold text-base text-white">${char.name}</h4>
              <p class="text-xs text-indigo-300">${charClass} &bull; Nível ${level} &bull; HP: --/--</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="editCharacter('${char.id}')" class="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-lg transition-colors" title="Editar Ficha">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="showToast('Personagem ${char.name} selecionado!')" class="text-xs bg-[#1e2336] hover:bg-[#262c45] border border-[#2f3755] px-4 py-2 rounded-lg text-indigo-200 transition-colors font-bold">Jogar</button>
          </div>
        </div>
      `;
    }).join('');
    
    if ((window as any).lucide) (window as any).lucide.createIcons();
    
  } catch (err) {
    console.error(err);
    listContainer.innerHTML = `
      <div class="text-center py-6 text-red-400 text-sm">
        Erro ao carregar personagens.
      </div>
    `;
  }
};

/**
 * Edit an existing character
 */
window.editCharacter = function(charId: string) {
  const char = window.loadedCharacters?.find(c => c.id === charId);
  if (!char) return;

  window.editingCharacterId = charId;

  // Title and Buttons
  const modalTitle = document.getElementById('modal-personagem-title');
  if (modalTitle) modalTitle.innerText = "Editar Personagem";
  
  const saveBtn = document.getElementById('btn-save-character');
  if (saveBtn) saveBtn.innerText = "Salvar Alterações";

  // Set field values
  const setValue = (id: string, val: any) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) el.value = val !== undefined && val !== null ? val : '';
  };

  setValue('char-system', char.system);
  setValue('char-name', char.name);
  setValue('char-player', char.playerName);
  setValue('char-race', char.race);
  setValue('char-origin', char.origin);
  setValue('char-divinity', char.divinity);
  setValue('char-level', char.totalLevel);
  setValue('char-alignment', char.alignment);
  setValue('char-size', char.size);
  setValue('char-speed', char.speed);
  setValue('char-age', char.age);

  // Dynamic Classes handling
  if (char.classes && Array.isArray(char.classes) && char.classes.length > 0) {
    window.characterClasses = char.classes.map((c, i) => ({
      id: c.id || `cls_${i + 1}`,
      name: c.name || '',
      level: typeof c.level === 'number' ? c.level : (parseInt(c.level as any) || 1)
    }));
  } else if (char.class1) {
    window.characterClasses = [
      { id: 'cls_1', name: char.class1, level: char.class1Level || 1 }
    ];
    if (char.class2) {
      window.characterClasses.push({
        id: 'cls_2',
        name: char.class2,
        level: char.class2Level || 1
      });
    }
  } else {
    window.characterClasses = [{ id: 'cls_1', name: '', level: 1 }];
  }
  window.renderClasses();
  window.updateTotalLevel();

  // Attributes
  window.characterAttributes = char.attributes ? JSON.parse(JSON.stringify(char.attributes)) : [];
  window.renderAttributes();

  // Skills
  window.characterSkills = char.skills ? JSON.parse(JSON.stringify(char.skills)) : [];
  if (window.renderSkills) window.renderSkills();

  // HP and PM
  setValue('char-pv-atual', char.pvAtual);
  setValue('char-pv-max', char.pvMax);
  setValue('char-pm-atual', char.pmAtual);
  setValue('char-pm-max', char.pmMax);

  // Defense
  setValue('char-defense-base', char.defenseBase || 10);
  window.characterDefenseBoxes = char.defenseBoxes ? JSON.parse(JSON.stringify(char.defenseBoxes)) : [{ type: 'manual', value: 0, attrId: '' }];
  if (window.renderDefense) window.renderDefense();

  // Money & Currency
  window.characterMoney = typeof char.money === 'number' ? char.money : 0;
  window.characterCurrencyName = char.currencyName || 'T$ (Tibares)';
  setValue('char-money', window.characterMoney);
  setValue('char-currency-name', window.characterCurrencyName);

  // Inventory
  window.characterInventory = char.inventory ? JSON.parse(JSON.stringify(char.inventory)) : [];
  if (window.renderInventory) window.renderInventory();
  if (window.renderEquippedGearTab) window.renderEquippedGearTab();

  // Attacks
  window.characterAttacks = char.attacks ? JSON.parse(JSON.stringify(char.attacks)) : [];
  if (window.renderAttacks) window.renderAttacks();

  // Custom Sections (Habilidades, Magias e Informações Livres)
  window.characterCustomSections = char.customSections ? JSON.parse(JSON.stringify(char.customSections)) : [];
  if (window.renderCustomSections) window.renderCustomSections();

  // Lore & Diário
  setValue('char-background', char.background || '');
  setValue('char-eyes', char.eyes || '');
  setValue('char-skin', char.skin || '');
  setValue('char-hair', char.hair || '');
  setValue('char-appearance-other', char.appearanceOther || '');
  setValue('char-personality', char.personality || '');
  setValue('char-gender-identity', char.genderIdentity || '');
  setValue('char-sexual-orientation', char.sexualOrientation || '');
  setValue('char-activism', char.activism || '');
  setValue('char-prejudices', char.prejudices || '');
  setValue('char-likes-other', char.likesOther || '');
  window.characterEpisodes = char.episodes ? JSON.parse(JSON.stringify(char.episodes)) : [];
  if (window.renderEpisodes) window.renderEpisodes();

  // Open modal
  window.closeModal('personagens-modal');
  window.openModal('novo-personagem-modal');
};

/**
 * Reset form for a new character
 */
window.resetCharacterForm = function() {
  window.editingCharacterId = null;

  // Title and Buttons
  const modalTitle = document.getElementById('modal-personagem-title');
  if (modalTitle) modalTitle.innerText = "Novo Personagem";
  
  const saveBtn = document.getElementById('btn-save-character');
  if (saveBtn) saveBtn.innerText = "Salvar Herói no Banco";

  // Clear field values
  const clearValue = (id: string, defaultVal: any = '') => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) el.value = defaultVal;
  };

  clearValue('char-system', 'Tormenta20 (Nativo)');
  clearValue('char-name');
  clearValue('char-player');
  clearValue('char-race');
  clearValue('char-origin');
  clearValue('char-divinity');
  clearValue('char-alignment');
  clearValue('char-size', 'Médio');
  clearValue('char-speed');
  clearValue('char-age', '');

  // Reset classes to 1 blank class
  window.characterClasses = [{ id: 'cls_1', name: '', level: 1 }];
  window.renderClasses();
  window.updateTotalLevel();

  // Clear attributes
  window.characterAttributes = [];
  window.renderAttributes();

  // Clear skills
  window.characterSkills = [];
  if (window.renderSkills) window.renderSkills();

  // Clear HP/PM
  clearValue('char-pv-atual', '');
  clearValue('char-pv-max', '');
  clearValue('char-pm-atual', '');
  clearValue('char-pm-max', '');
  clearValue('char-defense-base', '10');

  // Clear Defense
  window.characterDefenseBoxes = [{ type: 'manual', value: 0, attrId: '' }];
  if (window.renderDefense) window.renderDefense();

  // Clear Money & Currency
  window.characterMoney = 0;
  window.characterCurrencyName = 'T$ (Tibares)';
  clearValue('char-money', '0');
  clearValue('char-currency-name', 'T$ (Tibares)');

  // Clear Inventory
  window.characterInventory = [];
  if (window.renderInventory) window.renderInventory();
  if (window.renderEquippedGearTab) window.renderEquippedGearTab();

  // Clear Attacks
  window.characterAttacks = [];
  if (window.renderAttacks) window.renderAttacks();

  // Clear Custom Sections
  window.characterCustomSections = [];
  if (window.renderCustomSections) window.renderCustomSections();

  // Clear Lore & Diário
  clearValue('char-background');
  clearValue('char-eyes');
  clearValue('char-skin');
  clearValue('char-hair');
  clearValue('char-appearance-other');
  clearValue('char-personality');
  clearValue('char-gender-identity');
  clearValue('char-sexual-orientation');
  clearValue('char-activism');
  clearValue('char-prejudices');
  clearValue('char-likes-other');
  window.characterEpisodes = [];
  if (window.renderEpisodes) window.renderEpisodes();
};

// Initialize attributes
window.characterAttributes = [];

window.addAttributeUI = function() {
  const nameInput = document.getElementById('new-attr-name') as HTMLInputElement;
  const boxesInput = document.getElementById('new-attr-boxes') as HTMLInputElement;
  
  if (!nameInput || !boxesInput) return;
  
  let name = nameInput.value.trim().toUpperCase().substring(0, 4);
  const boxes = parseInt(boxesInput.value, 10) || 2;
  
  if (!name) {
    if (window.showToast) window.showToast('Digite um ID para o atributo', 'error');
    return;
  }

  if (window.characterAttributes.some(a => a.id === name)) {
    if (window.showToast) window.showToast('Atributo já existe', 'error');
    return;
  }
  
  window.characterAttributes.push({
    id: name,
    boxes: boxes,
    values: Array(boxes).fill(0)
  });
  
  nameInput.value = '';
  boxesInput.value = '2';
  
  window.renderAttributes();
};

window.updateAttributeValue = function(attrId: string, index: number, value: number) {
  const attr = window.characterAttributes.find(a => a.id === attrId);
  if (attr) {
    attr.values[index] = value;
    const total = attr.values.reduce((a: number, b: number) => a + b, 0);
    const totalEl = document.getElementById(`${attr.id}_ttl`);
    if (totalEl) {
      totalEl.innerText = total >= 0 ? `+${total}` : `${total}`;
    }
    if (window.renderSkills) window.renderSkills();
    if (window.updateDefenseTotalOnly) window.updateDefenseTotalOnly();
    if (window.renderAttacks) window.renderAttacks();
    if (window.updateInventoryWeightDisplay) window.updateInventoryWeightDisplay();
  }
};

window.renderAttributes = function() {
  const container = document.getElementById('attributes-list');
  if (!container) return;
  
  const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
  
  if (window.characterAttributes.length === 0) {
    container.innerHTML = '<div class="text-sm text-slate-500 italic">Nenhum atributo cadastrado. Adicione abaixo.</div>';
    return;
  }
  
  container.innerHTML = window.characterAttributes.map(attr => {
    const total = attr.values.reduce((a, b) => a + b, 0);
    const formattedTotal = total >= 0 ? `+${total}` : `${total}`;
    
    let boxesHtml = '';
    for (let i = 0; i < attr.boxes; i++) {
      if (i > 0) boxesHtml += `<span class="text-slate-500 text-xs font-bold">+</span>`;
      boxesHtml += `
        <input type="number" 
          id="${attr.id}_${ordinals[i]}"
          value="${attr.values[i]}" 
          oninput="window.updateAttributeValue('${attr.id}', ${i}, parseInt(this.value) || 0)"
          class="w-12 h-10 bg-[#161b2e] border border-[#2d354f] rounded text-center text-white font-bold focus:outline-none focus:border-purple-500"
        >
      `;
    }
    
    return `
      <div class="flex items-center bg-black p-3 rounded-lg border border-[#1e2336] overflow-x-auto w-max">
        <span class="font-bold text-[#b5a3e6] uppercase min-w-[3rem] text-center text-sm tracking-wider mr-2">${attr.id}</span>
        <div class="flex items-center space-x-2">
          ${boxesHtml}
          <span class="text-slate-500 text-xs font-bold">=</span>
          <div id="${attr.id}_ttl" class="min-w-[3rem] px-2 h-10 bg-[#1e2336] border border-[#3e2086] rounded flex items-center justify-center text-white font-bold shadow-inner">
            ${formattedTotal}
          </div>
          <button onclick="window.removeAttribute('${attr.id}')" class="ml-2 text-slate-600 hover:text-red-400 transition-colors p-1" title="Remover Atributo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  if (window.renderSkills) window.renderSkills();
};

window.removeAttribute = function(attrId: string) {
  window.characterAttributes = window.characterAttributes.filter(a => a.id !== attrId);
  window.renderAttributes();
};

const POINT_COSTS: Record<number, number> = {
  '-1': -1,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 4,
  '4': 7
};

window.geradorState = {
  method: 'points',
  points: { values: [0, 0, 0, 0, 0, 0] },
  rolls: {
    results: [],
    assignments: [-1, -1, -1, -1, -1, -1],
    log: [],
    totalSum: 0
  }
};

window.openGeradorAtributos = function() {
  const attrs = window.characterAttributes || [];
  if (attrs.length !== 6) {
    if (window.showToast) window.showToast('Você precisa ter exatamente 6 atributos para usar o gerador.', 'error');
    return;
  }
  
  const allHaveTwoBoxes = attrs.every(a => (a.boxes || 0) >= 2);
  if (!allHaveTwoBoxes) {
    if (window.showToast) window.showToast('Todos os 6 atributos precisam ter pelo menos 2 caixas de valor.', 'error');
    return;
  }
  
  if (window.showToast) window.showToast('Aviso: Gerador otimizado para o sistema Tormenta20.', 'info');
  
  window.geradorState = {
    method: 'points',
    points: { values: [0, 0, 0, 0, 0, 0] },
    rolls: {
      results: [],
      assignments: [-1, -1, -1, -1, -1, -1],
      log: [],
      totalSum: 0
    }
  };
  
  window.setGeradorMethod('points');
  window.openModal('gerador-atributos-modal');
};

window.setGeradorMethod = function(method: 'points' | 'rolls') {
  window.geradorState.method = method;
  
  const tabPoints = document.getElementById('tab-points');
  const tabRolls = document.getElementById('tab-rolls');
  
  if (method === 'points') {
    tabPoints?.classList.add('bg-[#281358]', 'text-white');
    tabPoints?.classList.remove('text-slate-400');
    tabRolls?.classList.remove('bg-[#281358]', 'text-white');
    tabRolls?.classList.add('text-slate-400');
  } else {
    tabRolls?.classList.add('bg-[#281358]', 'text-white');
    tabRolls?.classList.remove('text-slate-400');
    tabPoints?.classList.remove('bg-[#281358]', 'text-white');
    tabPoints?.classList.add('text-slate-400');
  }
  
  window.renderGeradorModal();
};

window.updatePointValue = function(index: number, delta: number) {
  const current = window.geradorState.points.values[index];
  const next = current + delta;
  
  if (next < -1 || next > 4) return;
  
  let currentTotal = 0;
  for (let i = 0; i < 6; i++) {
    currentTotal += POINT_COSTS[i === index ? next : window.geradorState.points.values[i]];
  }
  
  if (currentTotal > 10) {
    if (window.showToast) window.showToast('Pontos insuficientes!', 'error');
    return;
  }
  
  window.geradorState.points.values[index] = next;
  window.renderGeradorModal();
};

window.renderPointsTab = function() {
  const attrs = window.characterAttributes;
  const values = window.geradorState.points.values;
  
  let totalCost = values.reduce((sum: number, val: number) => sum + POINT_COSTS[val], 0);
  let remaining = 10 - totalCost;
  
  let html = `
    <div class="bg-black border border-[#1e2336] p-4 rounded-lg mb-4 flex justify-between items-center">
      <div>
        <h4 class="font-bold text-slate-300">PONTOS DISPONÍVEIS:</h4>
        <p class="text-[10px] text-slate-500">Distribua entre os 6 atributos (-1 a +4)</p>
      </div>
      <div class="text-right">
        <span class="text-2xl font-bold ${remaining === 0 ? 'text-yellow-400' : 'text-yellow-400'}">${remaining}</span>
        <span class="text-xs text-slate-500">/ 10 pts</span>
      </div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
  `;
  
  attrs.forEach((attr: any, idx: number) => {
    const val = values[idx];
    const cost = POINT_COSTS[val];
    const formattedVal = val >= 0 ? `+${val}` : `${val}`;
    
    html += `
      <div class="bg-[#0b0f19] border border-[#1e2336] p-3 rounded-lg flex items-center justify-between">
        <div>
          <h5 class="font-bold text-slate-200 text-sm">${attr.id}</h5>
          <p class="text-[10px] text-slate-500">Custo acumulado: <span class="text-indigo-400 font-bold">${cost} pts</span></p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="window.updatePointValue(${idx}, -1)" class="w-8 h-8 rounded bg-[#1e2336] hover:bg-[#262c45] flex items-center justify-center text-slate-400 transition-colors" ${val <= -1 ? 'disabled style="opacity: 0.5;"' : ''}>-</button>
          <div class="w-10 text-center font-bold text-white">${formattedVal}</div>
          <button onclick="window.updatePointValue(${idx}, 1)" class="w-8 h-8 rounded bg-[#281358] hover:bg-[#341b71] flex items-center justify-center text-indigo-300 transition-colors" ${val >= 4 ? 'disabled style="opacity: 0.5;"' : ''}>+</button>
        </div>
      </div>
    `;
  });
  
  html += `
    </div>
    <div class="bg-black border border-[#1e2336] p-3 rounded-lg">
      <h5 class="text-xs font-bold text-yellow-500 mb-2 flex items-center space-x-1">
        <i data-lucide="lightbulb" class="w-3 h-3"></i>
        <span>Tabela Oficial de Custo de Pontos:</span>
      </h5>
      <div class="grid grid-cols-6 gap-2 text-center text-[10px] font-bold">
        <div class="bg-[#0b0f19] border border-[#1e2336] rounded py-1 text-slate-400">-1 &rarr; <span class="text-green-400">-1pt</span></div>
        <div class="bg-[#0b0f19] border border-[#1e2336] rounded py-1 text-slate-400">0 &rarr; 0pt</div>
        <div class="bg-[#0b0f19] border border-[#1e2336] rounded py-1 text-slate-400">+1 &rarr; 1pt</div>
        <div class="bg-[#0b0f19] border border-[#1e2336] rounded py-1 text-slate-400">+2 &rarr; 2pts</div>
        <div class="bg-[#0b0f19] border border-[#1e2336] rounded py-1 text-slate-400">+3 &rarr; 4pts</div>
        <div class="bg-[#0b0f19] border border-[#1e2336] rounded py-1 text-slate-400">+4 &rarr; 7pts</div>
      </div>
    </div>
  `;
  
  return html;
};

window.rollDice = function() {
  let results = [];
  let log = [];
  let totalT20Sum = 0;
  
  const rollD6 = () => Math.floor(Math.random() * 6) + 1;
  
  for (let i = 0; i < 6; i++) {
    const dices = [rollD6(), rollD6(), rollD6(), rollD6()];
    const sorted = [...dices].sort((a, b) => a - b);
    sorted.shift();
    const sum = sorted.reduce((a, b) => a + b, 0);
    const t20 = Math.floor((sum - 10) / 2);
    results.push({ dices, sum, t20, originalIndex: i });
  }
  
  totalT20Sum = results.reduce((acc, curr) => acc + curr.t20, 0);
  
  let iterationCount = 0;
  while (totalT20Sum < 6 && iterationCount < 20) {
    iterationCount++;
    let lowestIdx = 0;
    for (let i = 1; i < 6; i++) {
      if (results[i].t20 < results[lowestIdx].t20) {
        lowestIdx = i;
      }
    }
    
    const oldT20 = results[lowestIdx].t20;
    
    const dices = [rollD6(), rollD6(), rollD6(), rollD6()];
    const sorted = [...dices].sort((a, b) => a - b);
    sorted.shift();
    const sum = sorted.reduce((a, b) => a + b, 0);
    const t20 = Math.floor((sum - 10) / 2);
    
    results[lowestIdx] = { dices, sum, t20, originalIndex: lowestIdx, rerolled: true };
    
    log.push(`Soma atual (${totalT20Sum}) é menor que 6. Re-rolando o menor valor (Rolagem #${lowestIdx + 1}: ${oldT20})...`);
    
    totalT20Sum = results.reduce((acc, curr) => acc + curr.t20, 0);
  }
  
  if (iterationCount > 0) {
    log.push(`Soma final atingida com sucesso: ${totalT20Sum} (>= 6).`);
  }
  
  window.geradorState.rolls.results = results;
  window.geradorState.rolls.log = log;
  window.geradorState.rolls.totalSum = totalT20Sum;
  
  window.geradorState.rolls.assignments = [-1, -1, -1, -1, -1, -1];
  
  window.renderGeradorModal();
};

window.updateRollAssignment = function(attrIdx: number, resultIdx: number) {
  const currentOwner = window.geradorState.rolls.assignments.indexOf(resultIdx);
  if (currentOwner !== -1 && currentOwner !== attrIdx && resultIdx !== -1) {
    window.geradorState.rolls.assignments[currentOwner] = -1;
  }
  window.geradorState.rolls.assignments[attrIdx] = resultIdx;
  window.renderGeradorModal();
};

window.renderRollsTab = function() {
  const state = window.geradorState.rolls;
  const hasRolled = state.results.length > 0;
  
  let html = `
    <div class="bg-black border border-[#1e2336] p-4 rounded-lg mb-4 flex justify-between items-center">
      <div>
        <h4 class="font-bold text-slate-300">Rolar 6 Atributos <span class="text-xs font-normal text-slate-500">(4d6 descarte o menor)</span></h4>
        <p class="text-[10px] text-slate-500">Garante proteção de soma total mínima >= 6 em T20</p>
      </div>
      <button onclick="window.rollDice()" class="bg-[#281358] hover:bg-[#341b71] border border-[#502b9e] px-4 py-2 rounded-md text-sm font-bold text-white transition-colors flex items-center space-x-2">
        <i data-lucide="dice-5" class="w-4 h-4"></i>
        <span>Rolar Dados</span>
      </button>
    </div>
  `;
  
  if (hasRolled) {
    html += `
      <div class="mb-4">
        <h5 class="text-xs font-bold text-indigo-400 mb-2 uppercase">Resultados Obtidos (${state.totalSum} PTS NO TOTAL):</h5>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
    `;
    
    state.results.forEach((res: any, idx: number) => {
      const formattedT20 = res.t20 >= 0 ? `+${res.t20}` : `${res.t20}`;
      html += `
        <div class="bg-black border ${res.rerolled ? 'border-orange-900/50' : 'border-[#1e2336]'} p-2 rounded flex flex-col justify-between">
          <div class="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Rolagem #${idx + 1} ${res.rerolled ? '<i data-lucide="refresh-cw" class="w-3 h-3 text-blue-400 inline"></i> (Re-rolado)' : ''}</span>
            <span>[${res.dices.join(', ')}]</span>
          </div>
          <div class="flex justify-between items-end">
            <span class="text-xs text-slate-400">Soma (3d6): <span class="text-white font-bold">${res.sum}</span></span>
            <span class="text-sm font-bold ${res.t20 < 0 ? 'text-red-400' : 'text-purple-400'}">T20: ${formattedT20}</span>
          </div>
        </div>
      `;
    });
    
    html += `</div></div>`;
    
    if (state.log.length > 0) {
      html += `
        <div class="bg-orange-950/20 border border-orange-900/30 p-3 rounded-lg mb-4">
          <h5 class="text-[10px] font-bold text-orange-500 mb-1 flex items-center space-x-1">
            <i data-lucide="shield" class="w-3 h-3"></i>
            <span>Proteção do Sistema Tormenta20 Aplicada:</span>
          </h5>
          <ul class="text-[10px] text-orange-200/70 list-disc list-inside space-y-1">
            ${state.log.map((l: string) => `<li>${l}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    html += `
      <div class="bg-[#0b0f19] border border-[#1e2336] p-4 rounded-lg">
        <h5 class="text-xs font-bold text-slate-300 mb-3 uppercase">Atribuir Valores Aos Atributos:</h5>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    `;
    
    window.characterAttributes.forEach((attr: any, idx: number) => {
      let options = state.results.map((res: any, resIdx: number) => {
        const formattedT20 = res.t20 >= 0 ? `+${res.t20}` : `${res.t20}`;
        const selected = state.assignments[idx] === resIdx ? 'selected' : '';
        return `<option value="${resIdx}" ${selected}>Valor #${resIdx + 1}: ${formattedT20}</option>`;
      }).join('');
      
      html += `
        <div class="flex items-center justify-between bg-black border border-[#2d354f] p-2 rounded">
          <span class="text-xs font-bold text-slate-300">${attr.id}</span>
          <select onchange="window.updateRollAssignment(${idx}, parseInt(this.value))" class="bg-[#1e2336] border border-[#3e2086] rounded px-2 py-1 text-xs text-white font-bold focus:outline-none">
            <option value="-1" ${state.assignments[idx] === -1 ? 'selected' : ''}>-- Selecione --</option>
            ${options}
          </select>
        </div>
      `;
    });
    
    html += `</div></div>`;
  }
  
  return html;
};

window.renderGeradorModal = function() {
  const container = document.getElementById('gerador-content-container');
  if (!container) return;
  
  if (window.geradorState.method === 'points') {
    container.innerHTML = window.renderPointsTab();
  } else {
    container.innerHTML = window.renderRollsTab();
  }
  
  if ((window as any).lucide) (window as any).lucide.createIcons();
};

window.applyGerador = function() {
  const attrs = window.characterAttributes;
  if (window.geradorState.method === 'points') {
    window.geradorState.points.values.forEach((val: number, idx: number) => {
      attrs[idx].values[0] = val;
    });
  } else {
    const assignments = window.geradorState.rolls.assignments;
    if (assignments.includes(-1) || window.geradorState.rolls.results.length === 0) {
      if (window.showToast) window.showToast('Atribua todos os valores rolados antes de aplicar.', 'error');
      return;
    }
    
    const uniqueAssignments = new Set(assignments);
    if (uniqueAssignments.size !== 6) {
      if (window.showToast) window.showToast('Cada valor rolado só pode ser atribuído a um único atributo.', 'error');
      return;
    }
    
    assignments.forEach((resIdx: number, attrIdx: number) => {
      attrs[attrIdx].values[0] = window.geradorState.rolls.results[resIdx].t20;
    });
  }
  
  window.renderAttributes();
  window.closeModal('gerador-atributos-modal');
  if (window.showToast) window.showToast('Atributos Iniciais Aplicados!', 'success');
};


// ---------------------- PERICIAS (SKILLS) ----------------------

window.characterSkills = [];

window.defaultSkills = [
  { id: 'acrobacia', name: 'Acrobacia', attr: '', isTrained: false, others: 0, notes: 'Penal. Armadura', bgColor: '' },
  { id: 'adestramento', name: 'Adestramento', attr: '', isTrained: false, others: 0, notes: 'Somente Treinado', bgColor: '' },
  { id: 'atletismo', name: 'Atletismo', attr: '', isTrained: false, others: 0, notes: 'Penal. Armadura', bgColor: '' },
  { id: 'atuacao', name: 'Atuação', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'cavalgar', name: 'Cavalgar', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'cura', name: 'Cura', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'diplomacia', name: 'Diplomacia', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'enganacao', name: 'Enganação', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'fortitude', name: 'Fortitude', attr: '', isTrained: false, others: 0, notes: '—', bgColor: 'bg-blue-950/40' },
  { id: 'furtividade', name: 'Furtividade', attr: '', isTrained: false, others: 0, notes: 'Penal. Armadura', bgColor: '' },
  { id: 'guerra', name: 'Guerra', attr: '', isTrained: false, others: 0, notes: 'Somente Treinado', bgColor: '' },
  { id: 'iniciativa', name: 'Iniciativa', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'intimidacao', name: 'Intimidação', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'intuicao', name: 'Intuição', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'investigacao', name: 'Investigação', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'jogatina', name: 'Jogatina', attr: '', isTrained: false, others: 0, notes: 'Somente Treinado', bgColor: '' },
  { id: 'ladinagem', name: 'Ladinagem', attr: '', isTrained: false, others: 0, notes: 'Penal. Armadura | Somente Treinado', bgColor: '' },
  { id: 'luta', name: 'Luta', attr: '', isTrained: false, others: 0, notes: '—', bgColor: 'bg-red-950/40' },
  { id: 'misticismo', name: 'Misticismo', attr: '', isTrained: false, others: 0, notes: 'Somente Treinado', bgColor: '' },
  { id: 'nobreza', name: 'Nobreza', attr: '', isTrained: false, others: 0, notes: 'Somente Treinado', bgColor: '' },
  { id: 'percepcao', name: 'Percepção', attr: '', isTrained: false, others: 0, notes: '—', bgColor: 'bg-green-950/40' },
  { id: 'pilotagem', name: 'Pilotagem', attr: '', isTrained: false, others: 0, notes: 'Somente Treinado', bgColor: '' },
  { id: 'pontaria', name: 'Pontaria', attr: '', isTrained: false, others: 0, notes: '—', bgColor: 'bg-red-950/40' },
  { id: 'reflexos', name: 'Reflexos', attr: '', isTrained: false, others: 0, notes: '—', bgColor: 'bg-blue-950/40' },
  { id: 'religiao', name: 'Religião', attr: '', isTrained: false, others: 0, notes: 'Somente Treinado', bgColor: '' },
  { id: 'sobrevivencia', name: 'Sobrevivência', attr: '', isTrained: false, others: 0, notes: '—', bgColor: '' },
  { id: 'vontade', name: 'Vontade', attr: '', isTrained: false, others: 0, notes: '—', bgColor: 'bg-blue-950/40' }
];

function getCharacterLevel(): number {
  if (window.characterClasses && window.characterClasses.length > 0) {
    const sum = window.characterClasses.reduce((acc, c) => acc + (parseInt(c.level as any) || 0), 0);
    if (sum > 0) return sum;
  }
  const levelEl = document.getElementById('char-level') as HTMLInputElement;
  return levelEl ? (parseInt(levelEl.value) || 1) : 1;
}

window.renderSkills = function() {
  const container = document.getElementById('skills-list');
  if (!container) return;

  const totalLevel = getCharacterLevel();
  const halfLevel = Math.floor(totalLevel / 2);

  const attrs = window.characterAttributes || [];

  if (!window.characterSkills || window.characterSkills.length === 0) {
    window.characterSkills = JSON.parse(JSON.stringify(window.defaultSkills));
  }

  container.innerHTML = window.characterSkills.map((skill, idx) => {
    // Find attribute total
    const attr = attrs.find(a => a.id === skill.attr);
    const attrTotal = attr ? attr.values.reduce((a: number, b: number) => a + b, 0) : 0;

    const others = parseInt(skill.others) || 0;
    const total = (skill.isTrained ? halfLevel : 0) + attrTotal + others;
    const formattedTotal = total >= 0 ? `+${total}` : `${total}`;

    const bgColor = skill.bgColor || 'bg-[#0b0f19]';
    const attrOptions = `<option value="">--</option>` + attrs.map(a => `<option value="${a.id}" ${skill.attr === a.id ? 'selected' : ''}>${a.id}</option>`).join('');
    
    return `
      <div class="grid grid-cols-[180px_60px_60px_80px_60px_80px_1fr] gap-2 items-center p-1.5 rounded ${bgColor} border border-[#1e2336]">
        <div class="flex items-center space-x-2 pl-2">
          <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
          ${skill.isCustom ? 
            `<input type="text" value="${skill.name}" oninput="window.updateSkillProp(${idx}, 'name', this.value)" class="bg-transparent border-b border-[#2d354f] text-white text-xs font-bold w-full focus:outline-none">` :
            `<span class="text-white text-xs font-bold">${skill.name}</span>`
          }
        </div>
        
        <div id="skill_total_${idx}" class="bg-black border border-[#2d354f] rounded text-white text-xs font-bold h-7 flex items-center justify-center shadow-inner">
          ${formattedTotal}
        </div>
        
        <div class="bg-black border border-[#2d354f] rounded text-slate-400 text-xs font-bold h-7 flex items-center justify-center">
          ${halfLevel}
        </div>
        
        <div>
          <select onchange="window.updateSkillProp(${idx}, 'attr', this.value)" class="w-full bg-[#161b2e] border border-[#2d354f] rounded text-white text-[10px] font-bold h-7 focus:outline-none text-center uppercase">
            ${attrOptions}
          </select>
        </div>
        
        <div class="flex items-center justify-center">
          <input type="checkbox" ${skill.isTrained ? 'checked' : ''} onchange="window.updateSkillProp(${idx}, 'isTrained', this.checked)" class="w-4 h-4 bg-black border-[#2d354f] rounded text-purple-600 focus:ring-purple-500">
        </div>
        
        <div>
          <input type="number" value="${skill.others}" oninput="window.updateSkillProp(${idx}, 'others', parseInt(this.value) || 0)" class="w-full bg-black border border-[#2d354f] rounded text-white text-xs text-center h-7 focus:outline-none">
        </div>
        
        <div class="text-slate-500 text-[10px] italic truncate flex items-center justify-between pl-1">
          <span>${skill.notes}</span>
          ${skill.isCustom ? `<button onclick="window.removeCustomSkill(${idx})" class="text-red-500 hover:text-red-400 p-1"><i data-lucide="trash-2" class="w-3 h-3"></i></button>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  if ((window as any).lucide) {
    setTimeout(() => (window as any).lucide.createIcons(), 0);
  }
};

window.updateSkillProp = function(idx: number, prop: string, value: any) {
  if (window.characterSkills[idx]) {
    window.characterSkills[idx][prop] = value;
    if (prop === 'name') {
      return;
    }
    if (prop === 'others' || prop === 'isTrained' || prop === 'attr') {
      const skill = window.characterSkills[idx];
      const totalLevel = getCharacterLevel();
      const halfLevel = Math.floor(totalLevel / 2);
      const attrs = window.characterAttributes || [];
      const attr = attrs.find(a => a.id === skill.attr);
      const attrTotal = attr ? attr.values.reduce((a: number, b: number) => a + b, 0) : 0;
      const others = parseInt(skill.others) || 0;
      const total = (skill.isTrained ? halfLevel : 0) + attrTotal + others;
      const formattedTotal = total >= 0 ? `+${total}` : `${total}`;
      const totalEl = document.getElementById(`skill_total_${idx}`);
      if (totalEl) totalEl.innerText = formattedTotal;
      if (window.renderAttacks) window.renderAttacks();
      return;
    }
    window.renderSkills();
    if (window.renderAttacks) window.renderAttacks();
  }
};

window.addCustomSkill = function() {
  window.characterSkills.push({
    id: 'custom_' + Date.now(),
    name: 'Nova Especialidade',
    attr: '',
    isTrained: false,
    others: 0,
    notes: '—',
    bgColor: '',
    isCustom: true
  });
  window.renderSkills();
};

window.removeCustomSkill = function(idx: number) {
  window.characterSkills.splice(idx, 1);
  window.renderSkills();
};


// ---------------------- DEFENSE ----------------------

window.characterDefenseBoxes = [{ type: 'manual', value: 0, attrId: '' }];

function getDefenseBoxValue(box: any): number {
  if (box.type === 'manual') {
    return parseInt(box.value) || 0;
  } else if (box.type === 'attr') {
    if (!box.attrId) return 0;
    
    // Check if it's an equipped item mechanical defense bonus/penalty
    if (box.attrId.startsWith('item_def_')) {
      const itemId = box.attrId.replace('item_def_', '');
      const item = (window.characterInventory || []).find((i: any) => i.id === itemId);
      if (item && item.isEquipped) {
        return parseInt(item.defenseBonus) || 0;
      }
      return 0;
    } else if (box.attrId.startsWith('item_pen_')) {
      const itemId = box.attrId.replace('item_pen_', '');
      const item = (window.characterInventory || []).find((i: any) => i.id === itemId);
      if (item && item.isEquipped) {
        return parseInt(item.penalty) || 0;
      }
      return 0;
    } else {
      // Standard Attribute
      const attrs = window.characterAttributes || [];
      const attr = attrs.find((a: any) => a.id === box.attrId);
      return attr ? attr.values.reduce((a: number, b: number) => a + b, 0) : 0;
    }
  }
  return 0;
}

window.updateDefenseTotalOnly = function() {
  const baseInput = document.getElementById('char-defense-base') as HTMLInputElement;
  const baseValue = parseInt(baseInput?.value || '10', 10);
  let total = baseValue;
  const countedAttrIds = new Set<string>();

  (window.characterDefenseBoxes || []).forEach((box: any) => {
    if (box.type === 'attr' && box.attrId) {
      if (countedAttrIds.has(box.attrId)) return; // Ensure each mechanical attribute only adds once
      countedAttrIds.add(box.attrId);
    }
    total += getDefenseBoxValue(box);
  });
  const totalEl = document.getElementById('defense-total');
  if (totalEl) totalEl.innerText = total.toString();
};

window.renderDefense = function() {
  const container = document.getElementById('defense-boxes-container');
  const totalEl = document.getElementById('defense-total');
  if (!container || !totalEl) return;

  const baseInput = document.getElementById('char-defense-base') as HTMLInputElement;
  const baseValue = parseInt(baseInput?.value || '10', 10);

  const attrs = window.characterAttributes || [];
  const inventory = window.characterInventory || [];
  const equippedDefenseItems = inventory.filter((item: any) => 
    item.isEquipped && (item.tag === 'Armadura' || item.tag === 'Escudo' || item.tag === 'Roupa')
  );

  // Set of all selected attrIds across all boxes to enforce uniqueness
  const selectedAttrIds = new Set<string>();
  (window.characterDefenseBoxes || []).forEach((b: any) => {
    if (b.type === 'attr' && b.attrId) {
      selectedAttrIds.add(b.attrId);
    }
  });

  let total = baseValue;
  const countedAttrIds = new Set<string>();
  let html = '';

  window.characterDefenseBoxes.forEach((box: any, idx: number) => {
    const boxValue = getDefenseBoxValue(box);
    if (box.type === 'attr' && box.attrId) {
      if (!countedAttrIds.has(box.attrId)) {
        countedAttrIds.add(box.attrId);
        total += boxValue;
      }
    } else {
      total += boxValue;
    }

    let attrOptions = `<option value="">-- Selecione Atributo / Item --</option>`;
    
    attrOptions += `<optgroup label="Atributos Básicos">` + 
      attrs.map((a: any) => {
        const isSelected = box.attrId === a.id;
        const isAlreadyUsed = !isSelected && selectedAttrIds.has(a.id);
        const val = a.values.reduce((s: number, v: number) => s + v, 0);
        const disabledAttr = isAlreadyUsed ? 'disabled' : '';
        const labelSuffix = isAlreadyUsed ? ' (Já Selecionado)' : '';
        return `<option value="${a.id}" ${isSelected ? 'selected' : ''} ${disabledAttr}>${a.id} (${val >= 0 ? '+' : ''}${val})${labelSuffix}</option>`;
      }).join('') +
    `</optgroup>`;

    if (equippedDefenseItems.length > 0) {
      attrOptions += `<optgroup label="Itens Equipados (Defesa / Penalidade)">` +
        equippedDefenseItems.map((item: any) => {
          const bDef = parseInt(item.defenseBonus) || 0;
          const pen = parseInt(item.penalty) || 0;
          
          const defKey = `item_def_${item.id}`;
          const isDefSelected = box.attrId === defKey;
          const isDefUsed = !isDefSelected && selectedAttrIds.has(defKey);
          const defDisabled = isDefUsed ? 'disabled' : '';
          const defSuffix = isDefUsed ? ' (Já Selecionado)' : '';

          let opts = `<option value="${defKey}" ${isDefSelected ? 'selected' : ''} ${defDisabled}>B.DEF: ${item.name} (${item.tag}) [${bDef >= 0 ? '+' : ''}${bDef}]${defSuffix}</option>`;
          
          if (pen !== 0) {
            const penKey = `item_pen_${item.id}`;
            const isPenSelected = box.attrId === penKey;
            const isPenUsed = !isPenSelected && selectedAttrIds.has(penKey);
            const penDisabled = isPenUsed ? 'disabled' : '';
            const penSuffix = isPenUsed ? ' (Já Selecionado)' : '';
            opts += `<option value="${penKey}" ${isPenSelected ? 'selected' : ''} ${penDisabled}>PEN: ${item.name} (${item.tag}) [${pen}]${penSuffix}</option>`;
          }
          return opts;
        }).join('') +
      `</optgroup>`;
    }

    html += `
      <div class="flex items-center space-x-2 shrink-0">
        <span class="text-slate-500 font-bold">+</span>
        <div class="flex flex-col items-center space-y-1">
          ${box.type === 'manual' ? 
            `<input type="number" value="${boxValue}" oninput="window.updateDefenseBox(${idx}, 'value', parseInt(this.value) || 0)" class="w-16 bg-[#0b0f19] border border-[#2d354f] rounded text-white text-sm text-center h-8 focus:outline-none focus:border-purple-500">` :
            `<div class="w-16 bg-black border border-[#2d354f] rounded text-white text-sm font-bold h-8 flex items-center justify-center shadow-inner">${boxValue}</div>`
          }
          <div class="flex items-center space-x-1">
            <select onchange="window.updateDefenseBoxType(${idx}, this.value)" class="bg-transparent text-[9px] text-slate-400 uppercase font-bold focus:outline-none cursor-pointer text-center w-16">
              <option value="manual" ${box.type === 'manual' ? 'selected' : ''}>Preencher</option>
              <option value="attr" ${box.type === 'attr' ? 'selected' : ''}>Atributo</option>
            </select>
          </div>
          ${box.type === 'attr' ? 
            `<select onchange="window.updateDefenseBox(${idx}, 'attrId', this.value)" class="w-28 bg-[#161b2e] border border-[#2d354f] rounded text-white text-[9px] font-bold h-5 focus:outline-none text-center mt-1 truncate" title="Cada atributo mecânico só pode ser selecionado uma vez">
              ${attrOptions}
            </select>` : ''
          }
          ${idx > 0 ? `<button type="button" onclick="window.removeDefenseBox(${idx})" class="text-red-500 hover:text-red-400 text-[10px] mt-1"><i data-lucide="x" class="w-3 h-3"></i></button>` : `<div class="h-4 mt-1"></div>`}
        </div>
      </div>
    `;
  });

  html += `
    <div class="flex items-center space-x-2 h-8 self-start mt-0 shrink-0">
      <button type="button" onclick="window.addDefenseBox()" class="w-8 h-8 rounded-full bg-[#1e2336] border border-[#2d354f] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#252a40] transition-colors" title="Adicionar Bloco de Defesa">
        <i data-lucide="plus" class="w-4 h-4"></i>
      </button>
    </div>
  `;

  container.innerHTML = html;
  totalEl.innerText = total.toString();

  if ((window as any).lucide) {
    setTimeout(() => (window as any).lucide.createIcons(), 0);
  }
};

window.updateDefenseBox = function(idx: number, prop: string, value: any) {
  if (window.characterDefenseBoxes[idx]) {
    if (prop === 'attrId' && value) {
      // Check if already selected in another defense box
      const isAlreadyUsed = window.characterDefenseBoxes.some(
        (b: any, i: number) => i !== idx && b.type === 'attr' && b.attrId === value
      );
      if (isAlreadyUsed) {
        if (window.showToast) {
          window.showToast("⚠️ Regra de Defesa: Cada atributo mecânico só pode ser adicionado à defesa uma única vez.", "error");
        }
        window.renderDefense();
        return;
      }
    }
    window.characterDefenseBoxes[idx][prop] = value;
    if (prop === 'value') {
      window.updateDefenseTotalOnly();
      return;
    }
    window.renderDefense();
  }
};

window.updateDefenseBoxType = function(idx: number, type: string) {
  if (window.characterDefenseBoxes[idx]) {
    window.characterDefenseBoxes[idx].type = type;
    if (type === 'manual') {
      window.characterDefenseBoxes[idx].value = 0;
      window.characterDefenseBoxes[idx].attrId = '';
    }
    window.renderDefense();
  }
};

window.addDefenseBox = function() {
  window.characterDefenseBoxes.push({ type: 'manual', value: 0, attrId: '' });
  window.renderDefense();
};

window.removeDefenseBox = function(idx: number) {
  window.characterDefenseBoxes.splice(idx, 1);
  window.renderDefense();
};


// ---------------------- INVENTÁRIO & REGRAS DE EQUIPAMENTOS ----------------------

window.characterInventory = [];

// Equipment Rules Validation & Toggle
window.toggleEquipItem = function(idx: number, isEquipped: boolean) {
  const item = window.characterInventory[idx];
  if (!item) return;

  if (!isEquipped) {
    item.isEquipped = false;
    if (window.showToast) window.showToast(`Item '${item.name}' desequipado.`, "info");
    window.renderInventory();
    if (window.renderEquippedGearTab) window.renderEquippedGearTab();
    if (window.renderDefense) window.renderDefense();
    if (window.renderAttacks) window.renderAttacks();
    return;
  }

  const inv = window.characterInventory || [];
  const otherEquipped = inv.filter((it: any, i: number) => i !== idx && it.isEquipped);

  let currentHands = 0;
  otherEquipped.forEach((it: any) => {
    if (it.tag === 'Arma') currentHands += it.twoHanded ? 2 : 1;
    if (it.tag === 'Escudo') currentHands += 1;
  });

  // Regra 1: Armadura (Apenas 1)
  if (item.tag === 'Armadura') {
    const otherArmors = otherEquipped.filter((it: any) => it.tag === 'Armadura').length;
    if (otherArmors >= 1) {
      if (window.showToast) window.showToast("⚠️ Regras de Equipamento: Apenas uma armadura pode ser equipada por vez.", "error");
      window.renderInventory();
      return;
    }
  }

  // Regra 2: Roupa (Apenas 1)
  if (item.tag === 'Roupa') {
    const otherClothes = otherEquipped.filter((it: any) => it.tag === 'Roupa').length;
    if (otherClothes >= 1) {
      if (window.showToast) window.showToast("⚠️ Regras de Equipamento: Apenas uma roupa pode ser equipada por vez.", "error");
      window.renderInventory();
      return;
    }
  }

  // Regra 3: Escudo (Apenas 1 + 1 mão livre)
  if (item.tag === 'Escudo') {
    const otherShields = otherEquipped.filter((it: any) => it.tag === 'Escudo').length;
    if (otherShields >= 1) {
      if (window.showToast) window.showToast("⚠️ Regras de Equipamento: Apenas um escudo pode ser equipado por vez.", "error");
      window.renderInventory();
      return;
    }
    if (currentHands + 1 > 2) {
      if (window.showToast) window.showToast("⚠️ Lógica de Duas Mãos: Ambas as mãos já estão ocupadas. Libere uma mão para empunhar o escudo.", "error");
      window.renderInventory();
      return;
    }
  }

  // Regra 4: Arma (Lógica de Duas Mãos)
  if (item.tag === 'Arma') {
    const neededHands = item.twoHanded ? 2 : 1;
    if (currentHands + neededHands > 2) {
      if (item.twoHanded) {
        if (window.showToast) window.showToast("⚠️ Lógica de Duas Mãos: Armas de Duas Mãos ocupam ambas as mãos. Libere as duas mãos primeiro.", "error");
      } else {
        if (window.showToast) window.showToast("⚠️ Lógica de Duas Mãos: Suas duas mãos já estão ocupadas (armas/escudo). Libere uma mão primeiro.", "error");
      }
      window.renderInventory();
      return;
    }
  }

  // Regra 5: Acessórios (Máximo 5)
  if (item.tag === 'Acessório') {
    const otherAccs = otherEquipped.filter((it: any) => it.tag === 'Acessório').length;
    if (otherAccs >= 5) {
      if (window.showToast) window.showToast("⚠️ Regras de Equipamento: Apenas cinco acessórios podem ser equipados por vez.", "error");
      window.renderInventory();
      return;
    }
  }

  item.isEquipped = true;
  if (window.showToast) window.showToast(`🛡️ '${item.name}' foi equipado!`, "success");
  window.renderInventory();
  if (window.renderEquippedGearTab) window.renderEquippedGearTab();
  if (window.renderDefense) window.renderDefense();
  if (window.renderAttacks) window.renderAttacks();
};

window.unequipItemById = function(itemId: string) {
  const item = (window.characterInventory || []).find((i: any) => i.id === itemId);
  if (!item) return;

  item.isEquipped = false;
  if (window.showToast) window.showToast(`🛡️ Item '${item.name}' desequipado.`, "info");
  
  if (window.renderInventory) window.renderInventory();
  if (window.renderEquippedGearTab) window.renderEquippedGearTab();
  if (window.renderDefense) window.renderDefense();
  if (window.renderAttacks) window.renderAttacks();
};

window.renderEquippedGearTab = function() {
  const container = document.getElementById('equipped-gear-container');
  const badgeEl = document.getElementById('equipped-gear-badge');
  const inv = window.characterInventory || [];

  const equippedArmors = inv.filter((it: any) => it.isEquipped && it.tag === 'Armadura');
  const equippedShields = inv.filter((it: any) => it.isEquipped && it.tag === 'Escudo');
  const equippedClothes = inv.filter((it: any) => it.isEquipped && it.tag === 'Roupa');
  const equippedAccessories = inv.filter((it: any) => it.isEquipped && it.tag === 'Acessório');
  
  const allEquippedProtection = [...equippedArmors, ...equippedShields, ...equippedClothes, ...equippedAccessories];
  const totalCount = allEquippedProtection.length;

  if (badgeEl) {
    badgeEl.innerText = `${totalCount} equipado${totalCount === 1 ? '' : 's'}`;
    badgeEl.className = totalCount > 0 
      ? "text-[10px] bg-purple-900/80 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full font-mono font-bold"
      : "text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono";
  }

  if (!container) return;

  // Compute summary stats
  let totalBDef = 0;
  let totalPen = 0;
  let totalWeight = 0;

  [...equippedArmors, ...equippedShields, ...equippedClothes].forEach((it: any) => {
    totalBDef += parseInt(it.defenseBonus) || 0;
    totalPen += parseInt(it.penalty) || 0;
    totalWeight += parseInt(it.weight) || 0;
  });

  equippedAccessories.forEach((it: any) => {
    totalWeight += parseInt(it.weight) || 0;
  });

  // Top metric bar
  let summaryHtml = `
    <div class="bg-[#0b0f19] border border-[#2d354f] rounded-xl p-3.5 shadow-sm">
      <div class="flex items-center justify-between mb-2.5 pb-2 border-b border-[#2d354f]/60">
        <div class="flex items-center space-x-2">
          <i data-lucide="shield" class="w-4 h-4 text-purple-400"></i>
          <span class="text-xs font-orbitron font-bold text-slate-200 uppercase tracking-wide">Equipamentos de Proteção & Acessórios</span>
        </div>
        <button type="button" onclick="document.getElementById('inventory-content')?.classList.remove('hidden'); if(window.renderInventory) window.renderInventory();" class="text-[10px] text-purple-300 hover:text-purple-100 flex items-center space-x-1 underline">
          <i data-lucide="package" class="w-3 h-3"></i>
          <span>Gerenciar no Inventário</span>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="bg-black/60 border border-emerald-500/30 rounded-lg p-2 flex flex-col">
          <span class="text-[9px] text-slate-400 font-bold uppercase">Bônus Defesa Total</span>
          <span class="text-sm font-bold font-mono text-emerald-400">${totalBDef >= 0 ? '+' : ''}${totalBDef}</span>
        </div>
        <div class="bg-black/60 border ${totalPen < 0 ? 'border-red-500/40' : 'border-[#2d354f]'} rounded-lg p-2 flex flex-col">
          <span class="text-[9px] text-slate-400 font-bold uppercase">Penalidade Total</span>
          <span class="text-sm font-bold font-mono ${totalPen < 0 ? 'text-red-400' : 'text-slate-400'}">${totalPen}</span>
        </div>
        <div class="bg-black/60 border border-[#2d354f] rounded-lg p-2 flex flex-col">
          <span class="text-[9px] text-slate-400 font-bold uppercase">Carga de Proteção</span>
          <span class="text-sm font-bold font-mono text-amber-300">${totalWeight} Espaços</span>
        </div>
      </div>
    </div>
  `;

  if (totalCount === 0) {
    container.innerHTML = summaryHtml + `
      <div class="bg-[#0b0f19] border border-dashed border-[#2d354f] rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-[#1e2336] flex items-center justify-center text-slate-500">
          <i data-lucide="shield-alert" class="w-6 h-6"></i>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-300">Nenhum equipamento defensivo equipado</h4>
          <p class="text-xs text-slate-500 max-w-sm mt-1">Nenhuma armadura, escudo, veste ou acessório está equipado no momento. Acesse a aba <strong>Inventário</strong> e marque o item como "Equipado".</p>
        </div>
        <button type="button" onclick="document.getElementById('inventory-content')?.classList.remove('hidden'); if(window.renderInventory) window.renderInventory();" class="mt-2 bg-[#281358] hover:bg-[#381b7a] border border-[#48259c] px-4 py-2 rounded text-xs font-bold text-purple-200 transition-colors flex items-center space-x-1.5">
          <i data-lucide="package-plus" class="w-3.5 h-3.5"></i>
          <span>Abrir Inventário</span>
        </button>
      </div>
    `;
    if ((window as any).lucide) setTimeout(() => (window as any).lucide.createIcons(), 0);
    return;
  }

  // Render Category Cards
  let sectionsHtml = '';

  // 1. Armadura
  sectionsHtml += `
    <div class="bg-[#0e1220] border border-[#2d354f] rounded-xl p-3.5 shadow-sm space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-[#2d354f]">
        <div class="flex items-center space-x-2">
          <i data-lucide="shield" class="w-4 h-4 text-emerald-400"></i>
          <span class="text-xs font-bold text-white uppercase tracking-wider">Armadura</span>
        </div>
        <span class="text-[10px] font-mono font-bold ${equippedArmors.length > 0 ? 'text-emerald-400' : 'text-slate-500'}">${equippedArmors.length} / 1 slot</span>
      </div>
  `;
  if (equippedArmors.length > 0) {
    const armor = equippedArmors[0];
    const bDef = parseInt(armor.defenseBonus) || 0;
    const pen = parseInt(armor.penalty) || 0;
    sectionsHtml += `
      <div class="bg-[#161b2e] border border-emerald-500/40 rounded-lg p-3 relative group">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-white">${armor.name}</span>
              <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">${armor.armorType || 'Armadura'}</span>
            </div>
            ${armor.description ? `<p class="text-[11px] text-slate-400 mt-1">${armor.description}</p>` : ''}
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <div class="flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded border border-[#2d354f] text-xs">
              <span class="text-emerald-400 font-bold font-mono">B.DEF: ${bDef >= 0 ? '+' : ''}${bDef}</span>
              ${pen !== 0 ? `<span class="text-red-400 font-bold font-mono">| PEN: ${pen}</span>` : ''}
              ${armor.weight ? `<span class="text-slate-400 font-mono">| Carga: ${armor.weight}</span>` : ''}
            </div>
            <button type="button" onclick="window.unequipItemById('${armor.id}')" class="bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs px-2.5 py-1 rounded flex items-center space-x-1 transition-colors" title="Desequipar Armadura">
              <i data-lucide="shield-off" class="w-3 h-3"></i>
              <span>Desequipar</span>
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    sectionsHtml += `<div class="text-xs text-slate-500 italic py-2 text-center bg-black/30 rounded border border-dashed border-[#2d354f]/50">Nenhuma armadura equipada.</div>`;
  }
  sectionsHtml += `</div>`;

  // 2. Escudo
  sectionsHtml += `
    <div class="bg-[#0e1220] border border-[#2d354f] rounded-xl p-3.5 shadow-sm space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-[#2d354f]">
        <div class="flex items-center space-x-2">
          <i data-lucide="shield" class="w-4 h-4 text-cyan-400"></i>
          <span class="text-xs font-bold text-white uppercase tracking-wider">Escudo</span>
        </div>
        <span class="text-[10px] font-mono font-bold ${equippedShields.length > 0 ? 'text-cyan-400' : 'text-slate-500'}">${equippedShields.length} / 1 slot (ocupa 1 mão)</span>
      </div>
  `;
  if (equippedShields.length > 0) {
    const shield = equippedShields[0];
    const bDef = parseInt(shield.defenseBonus) || 0;
    const pen = parseInt(shield.penalty) || 0;
    sectionsHtml += `
      <div class="bg-[#161b2e] border border-cyan-500/40 rounded-lg p-3 relative group">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-white">${shield.name}</span>
              <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">${shield.shieldType || 'Escudo'}</span>
            </div>
            ${shield.description ? `<p class="text-[11px] text-slate-400 mt-1">${shield.description}</p>` : ''}
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <div class="flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded border border-[#2d354f] text-xs">
              <span class="text-emerald-400 font-bold font-mono">B.DEF: ${bDef >= 0 ? '+' : ''}${bDef}</span>
              ${pen !== 0 ? `<span class="text-red-400 font-bold font-mono">| PEN: ${pen}</span>` : ''}
              ${shield.weight ? `<span class="text-slate-400 font-mono">| Carga: ${shield.weight}</span>` : ''}
            </div>
            <button type="button" onclick="window.unequipItemById('${shield.id}')" class="bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs px-2.5 py-1 rounded flex items-center space-x-1 transition-colors" title="Desequipar Escudo">
              <i data-lucide="shield-off" class="w-3 h-3"></i>
              <span>Desequipar</span>
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    sectionsHtml += `<div class="text-xs text-slate-500 italic py-2 text-center bg-black/30 rounded border border-dashed border-[#2d354f]/50">Nenhum escudo equipado.</div>`;
  }
  sectionsHtml += `</div>`;

  // 3. Roupas / Vestes
  sectionsHtml += `
    <div class="bg-[#0e1220] border border-[#2d354f] rounded-xl p-3.5 shadow-sm space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-[#2d354f]">
        <div class="flex items-center space-x-2">
          <i data-lucide="shirt" class="w-4 h-4 text-purple-400"></i>
          <span class="text-xs font-bold text-white uppercase tracking-wider">Vestes & Roupas</span>
        </div>
        <span class="text-[10px] font-mono font-bold ${equippedClothes.length > 0 ? 'text-purple-400' : 'text-slate-500'}">${equippedClothes.length} / 1 slot</span>
      </div>
  `;
  if (equippedClothes.length > 0) {
    const cloth = equippedClothes[0];
    const bDef = parseInt(cloth.defenseBonus) || 0;
    const pen = parseInt(cloth.penalty) || 0;
    sectionsHtml += `
      <div class="bg-[#161b2e] border border-purple-500/40 rounded-lg p-3 relative group">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-white">${cloth.name}</span>
              <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">Roupa / Veste</span>
            </div>
            ${cloth.description ? `<p class="text-[11px] text-slate-400 mt-1">${cloth.description}</p>` : ''}
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <div class="flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded border border-[#2d354f] text-xs">
              <span class="text-emerald-400 font-bold font-mono">B.DEF: ${bDef >= 0 ? '+' : ''}${bDef}</span>
              ${pen !== 0 ? `<span class="text-red-400 font-bold font-mono">| PEN: ${pen}</span>` : ''}
              ${cloth.weight ? `<span class="text-slate-400 font-mono">| Carga: ${cloth.weight}</span>` : ''}
            </div>
            <button type="button" onclick="window.unequipItemById('${cloth.id}')" class="bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs px-2.5 py-1 rounded flex items-center space-x-1 transition-colors" title="Desequipar Roupa">
              <i data-lucide="shield-off" class="w-3 h-3"></i>
              <span>Desequipar</span>
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    sectionsHtml += `<div class="text-xs text-slate-500 italic py-2 text-center bg-black/30 rounded border border-dashed border-[#2d354f]/50">Nenhuma veste ou roupa equipada.</div>`;
  }
  sectionsHtml += `</div>`;

  // 4. Acessórios
  sectionsHtml += `
    <div class="bg-[#0e1220] border border-[#2d354f] rounded-xl p-3.5 shadow-sm space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-[#2d354f]">
        <div class="flex items-center space-x-2">
          <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
          <span class="text-xs font-bold text-white uppercase tracking-wider">Acessórios Equipados</span>
        </div>
        <span class="text-[10px] font-mono font-bold ${equippedAccessories.length >= 5 ? 'text-amber-400' : 'text-slate-400'}">${equippedAccessories.length} / 5 slots</span>
      </div>
  `;
  if (equippedAccessories.length > 0) {
    sectionsHtml += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">` + 
      equippedAccessories.map((acc: any) => {
        return `
          <div class="bg-[#161b2e] border border-amber-500/30 rounded-lg p-2.5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-white truncate">${acc.name}</span>
                <span class="text-[9px] text-amber-400 font-mono font-bold shrink-0">${acc.value ? acc.value + ' T$' : ''}</span>
              </div>
              <p class="text-[10px] text-slate-400 line-clamp-2">${acc.description || 'Sem descrição'}</p>
            </div>
            <div class="flex items-center justify-between pt-2 mt-2 border-t border-[#2d354f]/60">
              <span class="text-[9px] text-slate-400 font-mono">Carga: ${acc.weight || 0}</span>
              <button type="button" onclick="window.unequipItemById('${acc.id}')" class="text-[10px] bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-300 px-2 py-0.5 rounded flex items-center space-x-1 transition-colors">
                <i data-lucide="x" class="w-2.5 h-2.5"></i>
                <span>Desequipar</span>
              </button>
            </div>
          </div>
        `;
      }).join('') +
    `</div>`;
  } else {
    sectionsHtml += `<div class="text-xs text-slate-500 italic py-2 text-center bg-black/30 rounded border border-dashed border-[#2d354f]/50">Nenhum acessório equipado (máximo 5 simultâneos).</div>`;
  }
  sectionsHtml += `</div>`;

  container.innerHTML = summaryHtml + sectionsHtml;

  if ((window as any).lucide) {
    setTimeout(() => (window as any).lucide.createIcons(), 0);
  }
};

window.characterMoney = 0;
window.characterCurrencyName = 'T$ (Tibares)';

window.updateCharacterMoney = function(val: number) {
  window.characterMoney = val || 0;
  const el = document.getElementById('char-money') as HTMLInputElement;
  if (el && document.activeElement !== el) {
    el.value = String(window.characterMoney);
  }
};

window.updateCharacterCurrencyName = function(val: string) {
  window.characterCurrencyName = val || 'T$ (Tibares)';
  const el = document.getElementById('char-currency-name') as HTMLInputElement;
  if (el && document.activeElement !== el) {
    el.value = window.characterCurrencyName;
  }
};

window.updateInventoryWeightDisplay = function() {
  const currentEl = document.getElementById('inventory-current-weight');
  const maxEl = document.getElementById('inventory-max-weight');
  
  const inv = window.characterInventory || [];
  let totalWeight = 0;
  inv.forEach((item: any) => {
    const qty = parseInt(item.quantity) || 1;
    const w = parseFloat(item.weight) || 0;
    totalWeight += qty * w;
  });
  const formattedWeight = (Math.round(totalWeight * 10) / 10).toString();

  // Calculate Força attribute total
  const forAttr = (window.characterAttributes || []).find((a: any) => {
    const id = (a.id || a.name || '').toUpperCase();
    return id.startsWith('FOR');
  });
  const forVal = forAttr ? forAttr.values.reduce((a: number, b: number) => a + b, 0) : 0;
  // T20 capacity: 10 + 3 * FOR (min 10)
  const maxWeight = Math.max(10, 10 + Math.max(0, forVal) * 3);

  if (currentEl) {
    currentEl.innerText = formattedWeight;
    if (totalWeight > maxWeight) {
      currentEl.className = 'text-red-400 font-bold';
    } else {
      currentEl.className = 'text-white';
    }
  }
  if (maxEl) {
    maxEl.innerText = String(maxWeight);
  }
};

window.applyStartingMoneyAndGear = function(level: number, moneyAmount: number) {
  // 1. Update Money
  window.characterMoney = moneyAmount;
  const moneyInput = document.getElementById('char-money') as HTMLInputElement;
  if (moneyInput) {
    moneyInput.value = String(moneyAmount);
  }

  // 2. Add Starter Belongings to Inventory
  if (!window.characterInventory) {
    window.characterInventory = [];
  }

  const starterItems = [
    {
      id: 'it_mochila_' + Math.random().toString(36).substr(2, 5),
      name: 'Mochila',
      quantity: 1,
      tag: 'Outros',
      weight: 1,
      value: 2,
      extraText: 'Capacidade para carregar itens e suprimentos'
    },
    {
      id: 'it_saco_' + Math.random().toString(36).substr(2, 5),
      name: 'Saco de Dormir',
      quantity: 1,
      tag: 'Outros',
      weight: 1,
      value: 1,
      extraText: 'Essencial para descanso e recuperação em acampamentos'
    },
    {
      id: 'it_traje_' + Math.random().toString(36).substr(2, 5),
      name: 'Traje de Viajante',
      quantity: 1,
      tag: 'Roupa',
      weight: 1,
      value: 10,
      defenseBonus: 0,
      penalty: 0,
      isEquipped: true
    },
    {
      id: 'it_adaga_' + Math.random().toString(36).substr(2, 5),
      name: 'Adaga',
      quantity: 1,
      tag: 'Arma',
      weight: 1,
      value: 2,
      damage: '1d4',
      critRange: 19,
      critMultiplier: 'x2',
      range: 'Curto',
      damageType: 'Perfurante',
      isEquipped: true
    },
    {
      id: 'it_armadura_couro_' + Math.random().toString(36).substr(2, 5),
      name: 'Armadura de Couro',
      quantity: 1,
      tag: 'Armadura',
      armorType: 'Leve',
      defenseBonus: 2,
      penalty: 0,
      weight: 2,
      value: 20,
      isEquipped: true
    }
  ];

  starterItems.forEach(stItem => {
    const existing = window.characterInventory.find((i: any) => i.name.toLowerCase() === stItem.name.toLowerCase());
    if (!existing) {
      window.characterInventory.push(stItem);
    }
  });

  // 3. Render updates across sheet
  if (window.renderInventory) window.renderInventory();
  if (window.renderDefense) window.renderDefense();
  if (window.renderAttacks) window.renderAttacks();
  if (window.renderEquippedGearTab) window.renderEquippedGearTab();
  if (window.updateInventoryWeightDisplay) window.updateInventoryWeightDisplay();

  // 4. Toast notification
  const formattedMoney = moneyAmount.toLocaleString('pt-BR');
  if (window.showToast) {
    window.showToast(`✓ Nível ${level} selecionado! T$ ${formattedMoney} e pertences creditados no inventário!`, "success");
  }

  // 5. Close modal
  if (window.closeModal) {
    window.closeModal('tabela-dinheiro-modal');
  }
};

window.renderInventory = function() {
  const container = document.getElementById('inventory-list');
  if (!container) return;

  if (window.updateInventoryWeightDisplay) {
    window.updateInventoryWeightDisplay();
  }

  const inv = window.characterInventory || [];
  
  // Calculate equipment status for header
  let handsCount = 0;
  let armorCount = 0;
  let shieldCount = 0;
  let clothesCount = 0;
  let accCount = 0;

  inv.forEach((item: any) => {
    if (!item.isEquipped) return;
    if (item.tag === 'Arma') handsCount += item.twoHanded ? 2 : 1;
    if (item.tag === 'Escudo') {
      handsCount += 1;
      shieldCount += 1;
    }
    if (item.tag === 'Armadura') armorCount += 1;
    if (item.tag === 'Roupa') clothesCount += 1;
    if (item.tag === 'Acessório') accCount += 1;
  });

  const ammoItems = inv.filter((it: any) => it.tag === 'Munição');

  // Rules summary banner
  const rulesSummaryHtml = `
    <div class="bg-[#0e1220] border border-[#2d354f] rounded-xl p-3 mb-4 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-orbitron font-bold text-purple-300 flex items-center space-x-1.5">
          <i data-lucide="shield" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>REGRAS DE EQUIPAMENTOS & SLOTS</span>
        </span>
        <span class="text-[10px] text-slate-400 font-mono">Status Atual</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
        <div class="bg-black/60 border ${handsCount > 2 ? 'border-red-500 text-red-400' : (handsCount === 2 ? 'border-amber-500/50 text-amber-300' : 'border-[#2d354f] text-emerald-400')} rounded p-1.5 flex flex-col">
          <span class="text-[9px] text-slate-400 font-bold uppercase">Mãos Ocupadas</span>
          <span class="font-bold font-mono text-xs">${handsCount} / 2</span>
        </div>
        <div class="bg-black/60 border ${armorCount > 0 ? 'border-emerald-500/50 text-emerald-300' : 'border-[#2d354f] text-slate-400'} rounded p-1.5 flex flex-col">
          <span class="text-[9px] text-slate-400 font-bold uppercase">Armadura</span>
          <span class="font-bold font-mono text-xs">${armorCount} / 1</span>
        </div>
        <div class="bg-black/60 border ${shieldCount > 0 ? 'border-emerald-500/50 text-emerald-300' : 'border-[#2d354f] text-slate-400'} rounded p-1.5 flex flex-col">
          <span class="text-[9px] text-slate-400 font-bold uppercase">Escudo</span>
          <span class="font-bold font-mono text-xs">${shieldCount} / 1</span>
        </div>
        <div class="bg-black/60 border ${clothesCount > 0 ? 'border-emerald-500/50 text-emerald-300' : 'border-[#2d354f] text-slate-400'} rounded p-1.5 flex flex-col">
          <span class="text-[9px] text-slate-400 font-bold uppercase">Roupa</span>
          <span class="font-bold font-mono text-xs">${clothesCount} / 1</span>
        </div>
        <div class="bg-black/60 border ${accCount >= 5 ? 'border-amber-500/50 text-amber-300' : (accCount > 0 ? 'border-purple-500/50 text-purple-300' : 'border-[#2d354f] text-slate-400')} rounded p-1.5 flex flex-col">
          <span class="text-[9px] text-slate-400 font-bold uppercase">Acessórios</span>
          <span class="font-bold font-mono text-xs">${accCount} / 5</span>
        </div>
      </div>
    </div>
  `;

  if (inv.length === 0) {
    container.innerHTML = rulesSummaryHtml + `<div class="text-center text-slate-500 py-4 text-sm italic">Inventário vazio</div>`;
    return;
  }

  const itemsHtml = inv.map((item: any, idx: number) => {
    let conditionalHtml = '';
    const isEquippable = ['Arma', 'Armadura', 'Escudo', 'Roupa', 'Acessório'].includes(item.tag);
    
    if (item.tag === 'Arma') {
      const ammoOptions = ammoItems.map((ammo: any) => {
        const dType = ammo.ammoDamageType ? ` (${ammo.ammoDamageType})` : '';
        const dice = ammo.ammoDiceCount ? ` +${ammo.ammoDiceCount}d${ammo.ammoDiceSides}` : '';
        return `<option value="${ammo.id}" ${item.selectedAmmoId === ammo.id ? 'selected' : ''}>${ammo.name} [x${ammo.quantity}]${dType}${dice}</option>`;
      }).join('');

      conditionalHtml = `
        <div class="mt-2 pt-2 border-t border-[#2d354f]">
          <!-- Opções Especiais de Arma -->
          <div class="flex flex-wrap items-center gap-4 mb-2 bg-black/40 border border-[#2d354f] rounded p-2">
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" ${item.twoHanded ? 'checked' : ''} onchange="window.updateInventoryItem(${idx}, 'twoHanded', this.checked)" class="w-3.5 h-3.5 rounded bg-black border-[#2d354f] text-purple-600 focus:ring-0">
              <span class="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Duas Mãos</span>
            </label>
            <label class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" ${item.consumesAmmo ? 'checked' : ''} onchange="window.updateInventoryItem(${idx}, 'consumesAmmo', this.checked)" class="w-3.5 h-3.5 rounded bg-black border-[#2d354f] text-amber-500 focus:ring-0">
              <span class="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Consome Munição</span>
            </label>
          </div>

          ${item.consumesAmmo ? `
            <div class="mb-2 p-2 bg-amber-950/20 border border-amber-500/30 rounded flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span class="text-[10px] text-amber-400 font-bold uppercase shrink-0">Munição Vinculada:</span>
              <select onchange="window.updateInventoryItem(${idx}, 'selectedAmmoId', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none flex-1">
                <option value="">-- Nenhuma Munição Selecionada --</option>
                ${ammoOptions}
              </select>
              ${ammoItems.length === 0 ? `<span class="text-[10px] text-amber-300/80 italic">Adicione um item com a tag "Munição" no inventário.</span>` : ''}
            </div>
          ` : ''}

          <div class="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Dano</span>
              <input type="text" placeholder="ex: 1d8" value="${item.damage || ''}" oninput="window.updateInventoryItem(${idx}, 'damage', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Ameaça</span>
              <input type="number" placeholder="ex: 20" value="${item.critRange || ''}" oninput="window.updateInventoryItem(${idx}, 'critRange', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Crítico</span>
              <select onchange="window.updateInventoryItem(${idx}, 'critMultiplier', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
                <option value="x2" ${item.critMultiplier === 'x2' ? 'selected' : ''}>x2</option>
                <option value="x3" ${item.critMultiplier === 'x3' ? 'selected' : ''}>x3</option>
                <option value="x4" ${item.critMultiplier === 'x4' ? 'selected' : ''}>x4</option>
                <option value="x5" ${item.critMultiplier === 'x5' ? 'selected' : ''}>x5</option>
              </select>
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Alcance</span>
              <input type="text" placeholder="ex: Curto" value="${item.range || ''}" oninput="window.updateInventoryItem(${idx}, 'range', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Tipo</span>
              <select onchange="window.updateInventoryItem(${idx}, 'damageType', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
                <option value="Cortante" ${item.damageType === 'Cortante' ? 'selected' : ''}>Cortante</option>
                <option value="Perfurante" ${item.damageType === 'Perfurante' ? 'selected' : ''}>Perfurante</option>
                <option value="Contundente" ${item.damageType === 'Contundente' ? 'selected' : ''}>Contundente</option>
                <option value="Especial" ${item.damageType === 'Especial' ? 'selected' : ''}>Especial...</option>
              </select>
              ${item.damageType === 'Especial' ? `<input type="text" placeholder="Especial" value="${item.damageTypeSpecial || ''}" oninput="window.updateInventoryItem(${idx}, 'damageTypeSpecial', this.value)" class="bg-[#1e2336] border-b border-[#2d354f] px-1 py-0.5 text-[10px] text-white mt-1 focus:outline-none w-full">` : ''}
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Carga</span>
              <input type="number" placeholder="ex: 1" value="${item.weight || ''}" oninput="window.updateInventoryItem(${idx}, 'weight', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
            </div>
          </div>
        </div>
      `;
    } else if (item.tag === 'Armadura') {
      conditionalHtml = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 pt-2 border-t border-[#2d354f]">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Tipo de Armadura</span>
            <select onchange="window.updateInventoryItem(${idx}, 'armorType', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none font-bold">
              <option value="Leve" ${item.armorType === 'Leve' || !item.armorType ? 'selected' : ''}>Leve</option>
              <option value="Pesada" ${item.armorType === 'Pesada' ? 'selected' : ''}>Pesada</option>
            </select>
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Bônus de Defesa (B.DEF)</span>
            <input type="number" placeholder="ex: 4" value="${item.defenseBonus || ''}" oninput="window.updateInventoryItem(${idx}, 'defenseBonus', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-emerald-400 font-bold focus:outline-none">
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Penalidade (PEN)</span>
            <input type="number" placeholder="ex: -2" value="${item.penalty || ''}" oninput="window.updateInventoryItem(${idx}, 'penalty', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-red-400 focus:outline-none">
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Carga</span>
            <input type="number" placeholder="ex: 3" value="${item.weight || ''}" oninput="window.updateInventoryItem(${idx}, 'weight', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
          </div>
        </div>
      `;
    } else if (item.tag === 'Escudo') {
      conditionalHtml = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 pt-2 border-t border-[#2d354f]">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Tipo de Escudo</span>
            <select onchange="window.updateInventoryItem(${idx}, 'shieldType', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none font-bold">
              <option value="Leve" ${item.shieldType === 'Leve' || !item.shieldType ? 'selected' : ''}>Leve</option>
              <option value="Pesado" ${item.shieldType === 'Pesado' ? 'selected' : ''}>Pesado</option>
            </select>
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Bônus de Defesa (B.DEF)</span>
            <input type="number" placeholder="ex: 2" value="${item.defenseBonus || ''}" oninput="window.updateInventoryItem(${idx}, 'defenseBonus', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-emerald-400 font-bold focus:outline-none">
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Penalidade (PEN)</span>
            <input type="number" placeholder="ex: -1" value="${item.penalty || ''}" oninput="window.updateInventoryItem(${idx}, 'penalty', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-red-400 focus:outline-none">
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Carga</span>
            <input type="number" placeholder="ex: 1" value="${item.weight || ''}" oninput="window.updateInventoryItem(${idx}, 'weight', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
          </div>
        </div>
      `;
    } else if (item.tag === 'Roupa') {
      conditionalHtml = `
        <div class="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#2d354f]">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Bônus de Defesa (B.DEF)</span>
            <input type="number" placeholder="ex: 1" value="${item.defenseBonus || ''}" oninput="window.updateInventoryItem(${idx}, 'defenseBonus', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-emerald-400 font-bold focus:outline-none">
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Penalidade (PEN)</span>
            <input type="number" placeholder="ex: 0" value="${item.penalty || ''}" oninput="window.updateInventoryItem(${idx}, 'penalty', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-red-400 focus:outline-none">
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Carga</span>
            <input type="number" placeholder="ex: 1" value="${item.weight || ''}" oninput="window.updateInventoryItem(${idx}, 'weight', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
          </div>
        </div>
      `;
    } else if (item.tag === 'Acessório') {
      const nameClean = (item.name || 'item').replace(/\s+/g, '').toLowerCase() || 'item';
      conditionalHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#2d354f]">
          <div class="flex flex-col border border-purple-900/30 bg-purple-900/10 rounded p-2">
            <span id="gear_label_1_${idx}" class="text-[9px] text-purple-400 font-bold uppercase mb-1">Atributo 1 - Dado (gear_${nameClean}_1)</span>
            <div class="flex items-center space-x-1">
              <input type="number" min="1" placeholder="Qtd" value="${item.attr1DiceCount ?? ''}" oninput="window.updateInventoryItem(${idx}, 'attr1DiceCount', this.value)" class="w-16 bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white text-center focus:outline-none" title="Quantidade de Dados">
              <span class="text-slate-400 text-xs font-bold">d</span>
              <select onchange="window.updateInventoryItem(${idx}, 'attr1DiceSides', this.value)" class="flex-1 bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
                <option value="4" ${item.attr1DiceSides === '4' ? 'selected' : ''}>d4</option>
                <option value="6" ${item.attr1DiceSides === '6' || !item.attr1DiceSides ? 'selected' : ''}>d6</option>
                <option value="8" ${item.attr1DiceSides === '8' ? 'selected' : ''}>d8</option>
                <option value="10" ${item.attr1DiceSides === '10' ? 'selected' : ''}>d10</option>
                <option value="12" ${item.attr1DiceSides === '12' ? 'selected' : ''}>d12</option>
                <option value="20" ${item.attr1DiceSides === '20' ? 'selected' : ''}>d20</option>
                <option value="100" ${item.attr1DiceSides === '100' ? 'selected' : ''}>d100</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col border border-purple-900/30 bg-purple-900/10 rounded p-2">
            <span id="gear_label_2_${idx}" class="text-[9px] text-purple-400 font-bold uppercase mb-1">Atributo 2 - Texto (gear_${nameClean}_2)</span>
            <input type="text" placeholder="Efeito / Propriedade em texto" value="${item.attr2Text || item.attr2Value || ''}" oninput="window.updateInventoryItem(${idx}, 'attr2Text', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
          </div>
        </div>
      `;
    } else if (item.tag === 'Consumível') {
      const nameClean = (item.name || 'item').replace(/\s+/g, '').toLowerCase() || 'item';
      conditionalHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#2d354f]">
          <div class="flex flex-col border border-blue-900/30 bg-blue-900/10 rounded p-2">
            <span id="effect_label_1_${idx}" class="text-[9px] text-blue-400 font-bold uppercase mb-1">Efeito 1 - Dado (${nameClean}_value1)</span>
            <div class="flex items-center space-x-1">
              <input type="number" min="1" placeholder="Qtd" value="${item.effect1DiceCount ?? ''}" oninput="window.updateInventoryItem(${idx}, 'effect1DiceCount', this.value)" class="w-16 bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white text-center focus:outline-none" title="Quantidade de Dados">
              <span class="text-slate-400 text-xs font-bold">d</span>
              <select onchange="window.updateInventoryItem(${idx}, 'effect1DiceSides', this.value)" class="flex-1 bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
                <option value="4" ${item.effect1DiceSides === '4' ? 'selected' : ''}>d4</option>
                <option value="6" ${item.effect1DiceSides === '6' || !item.effect1DiceSides ? 'selected' : ''}>d6</option>
                <option value="8" ${item.effect1DiceSides === '8' ? 'selected' : ''}>d8</option>
                <option value="10" ${item.effect1DiceSides === '10' ? 'selected' : ''}>d10</option>
                <option value="12" ${item.effect1DiceSides === '12' ? 'selected' : ''}>d12</option>
                <option value="20" ${item.effect1DiceSides === '20' ? 'selected' : ''}>d20</option>
                <option value="100" ${item.effect1DiceSides === '100' ? 'selected' : ''}>d100</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col border border-blue-900/30 bg-blue-900/10 rounded p-2">
            <span id="effect_label_2_${idx}" class="text-[9px] text-blue-400 font-bold uppercase mb-1">Efeito 2 - Texto (${nameClean}_value2)</span>
            <input type="text" placeholder="Efeito / Propriedade em texto" value="${item.effect2Text || item.effect2Value || ''}" oninput="window.updateInventoryItem(${idx}, 'effect2Text', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
          </div>
        </div>
      `;
    } else if (item.tag === 'Munição') {
      conditionalHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#2d354f]">
          <div class="flex flex-col border border-amber-900/40 bg-amber-950/20 rounded p-2">
            <span class="text-[9px] text-amber-400 font-bold uppercase mb-1">Dano & Dados da Munição</span>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col">
                <span class="text-[8px] text-slate-400 font-semibold mb-0.5">Tipo de Dano</span>
                <input type="text" placeholder="ex: Fogo / Perfurante" value="${item.ammoDamageType || ''}" oninput="window.updateInventoryItem(${idx}, 'ammoDamageType', this.value)" class="bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
              </div>
              <div class="flex flex-col">
                <span class="text-[8px] text-slate-400 font-semibold mb-0.5">Dados Extras</span>
                <div class="flex items-center space-x-1">
                  <input type="number" min="1" placeholder="1" value="${item.ammoDiceCount ?? ''}" oninput="window.updateInventoryItem(${idx}, 'ammoDiceCount', this.value)" class="w-12 bg-black border border-[#2d354f] rounded px-1.5 py-1 text-xs text-white text-center focus:outline-none" title="Quantidade de Dados">
                  <span class="text-slate-400 text-xs font-bold">d</span>
                  <select onchange="window.updateInventoryItem(${idx}, 'ammoDiceSides', this.value)" class="flex-1 bg-black border border-[#2d354f] rounded px-1.5 py-1 text-xs text-white focus:outline-none">
                    <option value="4" ${item.ammoDiceSides === '4' ? 'selected' : ''}>d4</option>
                    <option value="6" ${item.ammoDiceSides === '6' || !item.ammoDiceSides ? 'selected' : ''}>d6</option>
                    <option value="8" ${item.ammoDiceSides === '8' ? 'selected' : ''}>d8</option>
                    <option value="10" ${item.ammoDiceSides === '10' ? 'selected' : ''}>d10</option>
                    <option value="12" ${item.ammoDiceSides === '12' ? 'selected' : ''}>d12</option>
                    <option value="20" ${item.ammoDiceSides === '20' ? 'selected' : ''}>d20</option>
                    <option value="100" ${item.ammoDiceSides === '100' ? 'selected' : ''}>d100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col border border-amber-900/40 bg-amber-950/20 rounded p-2">
            <span class="text-[9px] text-amber-400 font-bold uppercase mb-1">Efeitos & Bônus</span>
            <div class="space-y-1.5">
              <div>
                <input type="text" placeholder="Bônus adicionais (ex: +1 no Teste de Ataque)" value="${item.ammoBonus || ''}" oninput="window.updateInventoryItem(${idx}, 'ammoBonus', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-amber-200 focus:outline-none">
              </div>
              <div>
                <input type="text" placeholder="Descrição dos efeitos da munição" value="${item.ammoEffects || ''}" oninput="window.updateInventoryItem(${idx}, 'ammoEffects', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-slate-300 focus:outline-none">
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (item.tag === 'Outros') {
      conditionalHtml = `
        <div class="mt-2 pt-2 border-t border-[#2d354f]">
          <span class="text-[9px] text-slate-400 font-bold uppercase mb-1 block">Anotação Adicional</span>
          <input type="text" placeholder="..." value="${item.extraText || ''}" oninput="window.updateInventoryItem(${idx}, 'extraText', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1 text-xs text-white focus:outline-none">
        </div>
      `;
    }

    return `
      <div class="bg-[#1e2336] border ${item.isEquipped ? 'border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'border-[#2d354f]'} rounded p-3 relative group transition-all">
        <button type="button" onclick="window.removeInventoryItem(${idx})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir Item"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        
        <div class="grid grid-cols-1 md:grid-cols-[60px_1fr_120px_90px_auto] gap-3 items-start mb-2 pr-6">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Qnt</span>
            <input type="number" placeholder="0" value="${item.quantity}" oninput="window.updateInventoryItem(${idx}, 'quantity', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none">
          </div>
          
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Nome</span>
            <input type="text" placeholder="Nome do Item" value="${item.name}" oninput="window.updateInventoryItem(${idx}, 'name', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1.5 text-xs text-white focus:outline-none font-bold">
          </div>
          
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Tag</span>
            <select onchange="window.updateInventoryItem(${idx}, 'tag', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1.5 text-xs text-white focus:outline-none">
              <option value="Arma" ${item.tag === 'Arma' ? 'selected' : ''}>Arma</option>
              <option value="Armadura" ${item.tag === 'Armadura' ? 'selected' : ''}>Armadura</option>
              <option value="Escudo" ${item.tag === 'Escudo' ? 'selected' : ''}>Escudo</option>
              <option value="Roupa" ${item.tag === 'Roupa' ? 'selected' : ''}>Roupa</option>
              <option value="Acessório" ${item.tag === 'Acessório' ? 'selected' : ''}>Acessório</option>
              <option value="Consumível" ${item.tag === 'Consumível' ? 'selected' : ''}>Consumível</option>
              <option value="Munição" ${item.tag === 'Munição' ? 'selected' : ''}>Munição</option>
              <option value="Outros" ${item.tag === 'Outros' ? 'selected' : ''}>Outros</option>
            </select>
          </div>

          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-bold uppercase mb-1">Valor (T$)</span>
            <input type="number" placeholder="0" value="${item.value}" oninput="window.updateInventoryItem(${idx}, 'value', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1.5 text-xs text-green-400 text-center font-bold focus:outline-none">
          </div>

          ${isEquippable ? `
            <div class="flex flex-col items-center justify-center pt-5">
              <label class="flex items-center space-x-1.5 cursor-pointer bg-black/60 hover:bg-black/90 border ${item.isEquipped ? 'border-emerald-500 text-emerald-400' : 'border-[#2d354f] text-slate-400'} px-2.5 py-1 rounded transition-colors" title="Equipar / Desequipar item">
                <input type="checkbox" ${item.isEquipped ? 'checked' : ''} onchange="window.toggleEquipItem(${idx}, this.checked)" class="w-3.5 h-3.5 text-emerald-500 rounded bg-black border-[#2d354f] focus:ring-0">
                <span class="text-[10px] font-bold uppercase tracking-wider">${item.isEquipped ? 'Equipado' : 'Equipar'}</span>
              </label>
            </div>
          ` : '<div class="pt-5"></div>'}
        </div>

        <div class="mb-2">
           <textarea placeholder="Descrição do item..." rows="1" oninput="window.updateInventoryItem(${idx}, 'description', this.value)" class="w-full bg-black border border-[#2d354f] rounded px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none resize-none overflow-hidden" onkeyup="this.style.height='auto';this.style.height=(this.scrollHeight)+'px';">${item.description || ''}</textarea>
        </div>

        ${conditionalHtml}
      </div>
    `;
  }).join('');

  container.innerHTML = rulesSummaryHtml + itemsHtml;

  if ((window as any).lucide) {
    setTimeout(() => (window as any).lucide.createIcons(), 0);
  }
};

window.updateInventoryItem = function(idx: number, prop: string, value: any) {
  if (window.characterInventory[idx]) {
    const item = window.characterInventory[idx];

    // If penalty, force negative
    if (prop === 'penalty') {
       let val = parseInt(value) || 0;
       if (val > 0) val = -val;
       item[prop] = val;
       if (item.isEquipped && window.updateDefenseTotalOnly) {
         window.updateDefenseTotalOnly();
       }
    } else if (prop === 'defenseBonus') {
       item[prop] = value;
       if (item.isEquipped && window.updateDefenseTotalOnly) {
         window.updateDefenseTotalOnly();
       }
    } else if (prop === 'twoHanded') {
       if (value && item.isEquipped) {
         // Check if hands available
         const inv = window.characterInventory || [];
         const otherEquipped = inv.filter((it: any, i: number) => i !== idx && it.isEquipped);
         let currentHands = 0;
         otherEquipped.forEach((it: any) => {
           if (it.tag === 'Arma') currentHands += it.twoHanded ? 2 : 1;
           if (it.tag === 'Escudo') currentHands += 1;
         });
         if (currentHands + 2 > 2) {
           if (window.showToast) window.showToast("⚠️ Lógica de Duas Mãos: Não é possível ativar 'Duas Mãos' com a outra mão ocupada.", "error");
           item.twoHanded = false;
           window.renderInventory();
           return;
         }
       }
       item.twoHanded = !!value;
       window.renderInventory();
    } else if (prop === 'consumesAmmo') {
       item.consumesAmmo = !!value;
       window.renderInventory();
    } else {
       item[prop] = value;
    }
    
    // Only re-render when switching tag
    if (prop === 'tag') {
      // If was equipped and tag no longer equippable, unequip
      if (!['Arma', 'Armadura', 'Escudo', 'Roupa', 'Acessório'].includes(value)) {
        item.isEquipped = false;
      }
      window.renderInventory();
      if (window.renderEquippedGearTab) window.renderEquippedGearTab();
      if (window.renderDefense) window.renderDefense();
      if (window.renderAttacks) window.renderAttacks();
    } else if (prop === 'name') {
      const nameClean = (value || 'item').replace(/\s+/g, '').toLowerCase() || 'item';
      const elGear1 = document.getElementById(`gear_label_1_${idx}`);
      if (elGear1) elGear1.innerText = `Atributo 1 - Dado (gear_${nameClean}_1)`;
      const elGear2 = document.getElementById(`gear_label_2_${idx}`);
      if (elGear2) elGear2.innerText = `Atributo 2 - Texto (gear_${nameClean}_2)`;
      const elEff1 = document.getElementById(`effect_label_1_${idx}`);
      if (elEff1) elEff1.innerText = `Efeito 1 - Dado (${nameClean}_value1)`;
      const elEff2 = document.getElementById(`effect_label_2_${idx}`);
      if (elEff2) elEff2.innerText = `Efeito 2 - Texto (${nameClean}_value2)`;
      if (item.isEquipped && window.renderEquippedGearTab) window.renderEquippedGearTab();
      if (item.isEquipped && item.tag === 'Arma' && window.renderAttacks) {
        const matchingAtk = (window.characterAttacks || []).find((a: any) => a.sourceItemId === item.id);
        if (matchingAtk) matchingAtk.name = value || 'Arma Equipada';
        window.renderAttacks();
      }
    } else if (item.isEquipped && (prop === 'defenseBonus' || prop === 'penalty' || prop === 'weight' || prop === 'armorType' || prop === 'shieldType' || prop === 'description')) {
      if (window.renderEquippedGearTab) window.renderEquippedGearTab();
    } else if (item.isEquipped && item.tag === 'Arma') {
      if (window.renderAttacks) window.renderAttacks();
    }
    if (prop === 'weight' || prop === 'quantity') {
      if (window.updateInventoryWeightDisplay) window.updateInventoryWeightDisplay();
    }
  }
};

window.addInventoryItem = function() {
  window.characterInventory.push({
    id: 'item_' + Date.now(),
    name: 'Novo Item',
    description: '',
    quantity: 1,
    value: 0,
    weight: 0,
    tag: 'Outros',
    isEquipped: false
  });
  window.renderInventory();
  if (window.updateInventoryWeightDisplay) window.updateInventoryWeightDisplay();
};

window.removeInventoryItem = function(idx: number) {
  window.characterInventory.splice(idx, 1);
  window.renderInventory();
  if (window.renderEquippedGearTab) window.renderEquippedGearTab();
  if (window.renderDefense) window.renderDefense();
  if (window.renderAttacks) window.renderAttacks();
  if (window.updateInventoryWeightDisplay) window.updateInventoryWeightDisplay();
};

// ---------------------- ATAQUES & ARMAS EQUIPADAS ----------------------

window.characterAttacks = [];

export interface AttackDamageComponent {
  id: string;
  diceCount: number;
  diceFaces: number;
  damageType: string;
  customDamageType?: string;
}

/**
 * Parses weapon damage string like "2d6+1d6", "2d6 cortante + 1d6 astral", "1d8 + 1d4 fogo"
 */
function parseWeaponDamageFormula(formula: string, defaultType: string = 'Corte'): AttackDamageComponent[] {
  if (!formula || typeof formula !== 'string') {
    return [{ id: 'dc_' + Math.random().toString(36).substr(2, 5), diceCount: 1, diceFaces: 8, damageType: defaultType || 'Corte', customDamageType: '' }];
  }

  const parts = formula.split('+').map(p => p.trim()).filter(Boolean);
  const results: AttackDamageComponent[] = [];

  const knownTypes: Record<string, string> = {
    'corte': 'Corte',
    'cortante': 'Corte',
    'perfuração': 'Perfuração',
    'perfuracao': 'Perfuração',
    'perfurante': 'Perfuração',
    'impacto': 'Impacto',
    'contundente': 'Impacto',
    'astral': 'Astral',
    'fogo': 'Fogo',
    'frio': 'Frio',
    'eletricidade': 'Eletricidade',
    'eletrico': 'Eletricidade',
    'elétrico': 'Eletricidade',
    'ácido': 'Ácido',
    'acido': 'Ácido',
    'sônico': 'Sônico',
    'sonico': 'Sônico',
    'trevas': 'Trevas',
    'luz': 'Luz',
    'radiante': 'Luz',
    'mental': 'Mental',
    'psíquico': 'Psíquico',
    'psiquico': 'Psíquico',
    'essência': 'Essência',
    'essencia': 'Essência',
    'veneno': 'Veneno',
    'sagrado': 'Sagrado',
    'profano': 'Profano',
    'mágico': 'Mágico',
    'magico': 'Mágico'
  };

  parts.forEach((part, index) => {
    const match = part.match(/^(\d*)\s*[dD](\d+)(?:\s*(.+))?$/);
    if (match) {
      const count = parseInt(match[1]) || 1;
      const faces = parseInt(match[2]) || 6;
      const typeRaw = (match[3] || '').trim().toLowerCase();
      let dType = defaultType || 'Corte';
      let customType = '';

      if (typeRaw) {
        if (knownTypes[typeRaw]) {
          dType = knownTypes[typeRaw];
        } else {
          dType = 'Personalizado';
          customType = match[3].trim();
        }
      } else {
        if (index === 0) {
          const normDef = defaultType ? (knownTypes[defaultType.toLowerCase()] || defaultType) : 'Corte';
          dType = normDef;
        } else {
          dType = 'Astral';
        }
      }

      results.push({
        id: 'dc_' + Math.random().toString(36).substr(2, 5),
        diceCount: count,
        diceFaces: faces,
        damageType: dType,
        customDamageType: customType
      });
    }
  });

  if (results.length === 0) {
    results.push({
      id: 'dc_' + Math.random().toString(36).substr(2, 5),
      diceCount: 1,
      diceFaces: 8,
      damageType: defaultType || 'Corte',
      customDamageType: ''
    });
  }

  return results;
}

function ensureDamageComponents(atk: any) {
  if (!atk.damageComponents || !Array.isArray(atk.damageComponents) || atk.damageComponents.length === 0) {
    atk.damageComponents = [{
      id: 'dc_' + Math.random().toString(36).substr(2, 5),
      diceCount: parseInt(atk.diceCount) || 1,
      diceFaces: parseInt(atk.diceFaces) || 8,
      damageType: atk.damageType || 'Corte',
      customDamageType: atk.customDamageType || ''
    }];
  }
}

/**
 * Synchronize equipped weapons from inventory into the characterAttacks list
 */
function syncEquippedWeaponsWithAttacks() {
  if (!window.characterAttacks) {
    window.characterAttacks = [];
  }
  const inv = window.characterInventory || [];
  const equippedWeapons = inv.filter((it: any) => it.tag === 'Arma' && it.isEquipped);
  const equippedIds = new Set(equippedWeapons.map((it: any) => it.id));

  // Remove auto attacks for weapons that are no longer equipped or no longer in inventory
  window.characterAttacks = window.characterAttacks.filter((atk: any) => {
    if (atk.isEquippedWeapon && atk.sourceItemId) {
      return equippedIds.has(atk.sourceItemId);
    }
    return true;
  });

  // Add auto attacks for equipped weapons if not present
  equippedWeapons.forEach((weapon: any) => {
    const isRanged = weapon.consumesAmmo || false;
    const defaultType = weapon.damageType === 'Especial' ? (weapon.damageTypeSpecial || 'Corte') : (weapon.damageType || (isRanged ? 'Perfuração' : 'Corte'));
    const parsedComps = parseWeaponDamageFormula(weapon.damage || (weapon.twoHanded ? '2d6' : '1d8'), defaultType);

    let threat = 20;
    if (weapon.critRange) {
      threat = parseInt(weapon.critRange) || 20;
    }
    let mult = 2;
    if (weapon.critMultiplier) {
      mult = parseInt(String(weapon.critMultiplier).replace('x', '')) || 2;
    }

    let rangeVal = weapon.range || (isRanged ? 'Médio (18m / 12 sq)' : 'Corpo a Corpo');

    const existing = window.characterAttacks.find((atk: any) => atk.sourceItemId === weapon.id);
    if (!existing) {
      window.characterAttacks.push({
        id: 'atk_' + weapon.id,
        sourceItemId: weapon.id,
        isEquippedWeapon: true,
        name: weapon.name || 'Arma Equipada',
        skillType: isRanged ? 'pontaria' : 'luta',
        customSkillName: '',
        attackBonus: 0,
        damageComponents: parsedComps,
        damageBonus: 0,
        damageAttr: isRanged ? 'DES' : 'FOR',
        critThreat: threat,
        critMultiplier: mult,
        range: rangeVal,
        customRange: weapon.range || ''
      });
    } else {
      if (existing.isEquippedWeapon) {
        existing.name = weapon.name || 'Arma Equipada';
        if (weapon.critRange) existing.critThreat = threat;
        if (weapon.critMultiplier) existing.critMultiplier = mult;
        if (weapon.range) {
          existing.range = weapon.range;
          existing.customRange = weapon.range;
        }
        
        // If weapon damage formula was updated and existing only had default components or needs sync
        if (weapon.damage && existing.lastSyncedDamage !== weapon.damage) {
          existing.damageComponents = parseWeaponDamageFormula(weapon.damage, defaultType);
          existing.lastSyncedDamage = weapon.damage;
        } else {
          ensureDamageComponents(existing);
        }
      }
    }
  });

  // Ensure all attacks have damageComponents array
  window.characterAttacks.forEach((atk: any) => ensureDamageComponents(atk));
}

function getSkillBonusForAttack(skillType: string, customSkillName: string = ''): { name: string, bonus: number } {
  const totalLevel = getCharacterLevel();
  const halfLevel = Math.floor(totalLevel / 2);
  const skills = window.characterSkills || [];
  const attrs = window.characterAttributes || [];

  if (skillType === 'outro') {
    if (customSkillName) {
      const cleanCustom = customSkillName.trim().toLowerCase();
      const match = skills.find((s: any) => s.name.toLowerCase() === cleanCustom || s.id.toLowerCase() === cleanCustom);
      if (match) {
        const attr = attrs.find((a: any) => a.id === match.attr);
        const attrTotal = attr ? attr.values.reduce((a: number, b: number) => a + b, 0) : 0;
        const total = (match.isTrained ? halfLevel : 0) + attrTotal + (parseInt(match.others) || 0);
        return { name: match.name, bonus: total };
      }
      return { name: customSkillName, bonus: 0 };
    }
    return { name: 'Outro', bonus: 0 };
  }

  const skill = skills.find((s: any) => s.id.toLowerCase() === skillType.toLowerCase() || s.name.toLowerCase() === skillType.toLowerCase());
  if (skill) {
    const attr = attrs.find((a: any) => a.id === skill.attr);
    const attrTotal = attr ? attr.values.reduce((a: number, b: number) => a + b, 0) : 0;
    const total = (skill.isTrained ? halfLevel : 0) + attrTotal + (parseInt(skill.others) || 0);
    return { name: skill.name, bonus: total };
  }

  const defaultNames: Record<string, string> = {
    'luta': 'Luta',
    'pontaria': 'Pontaria',
    'atletismo': 'Atletismo',
    'misticismo': 'Misticismo'
  };
  return { name: defaultNames[skillType] || skillType, bonus: 0 };
}

function getAttributeBonus(attrId: string): number {
  if (!attrId) return 0;
  const attrs = window.characterAttributes || [];
  const attr = attrs.find((a: any) => a.id.toUpperCase() === attrId.toUpperCase());
  if (!attr) return 0;
  return attr.values.reduce((a: number, b: number) => a + b, 0);
}

window.addAttack = function() {
  if (!window.characterAttacks) window.characterAttacks = [];
  
  window.characterAttacks.push({
    id: 'atk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    sourceItemId: '',
    isEquippedWeapon: false,
    name: 'Novo Ataque',
    skillType: 'luta',
    customSkillName: '',
    attackBonus: 0,
    damageComponents: [
      { id: 'dc_' + Date.now(), diceCount: 1, diceFaces: 8, damageType: 'Impacto', customDamageType: '' }
    ],
    damageBonus: 0,
    damageAttr: 'FOR',
    critThreat: 20,
    critMultiplier: 2,
    range: 'Corpo a Corpo',
    customRange: ''
  });

  window.renderAttacks();
  if (window.showToast) window.showToast('⚔️ Novo ataque adicionado!', 'info');
};

window.removeAttack = function(idx: number) {
  if (window.characterAttacks && window.characterAttacks[idx]) {
    const atk = window.characterAttacks[idx];
    if (atk.isEquippedWeapon && atk.sourceItemId) {
      const item = (window.characterInventory || []).find((i: any) => i.id === atk.sourceItemId);
      if (item) {
        item.isEquipped = false;
        if (window.showToast) window.showToast(`Arma '${item.name}' desequipada.`, 'info');
        if (window.renderInventory) window.renderInventory();
        if (window.renderEquippedGearTab) window.renderEquippedGearTab();
      }
    }
    window.characterAttacks.splice(idx, 1);
    window.renderAttacks();
  }
};

window.updateAttackProp = function(idx: number, prop: string, value: any) {
  if (window.characterAttacks && window.characterAttacks[idx]) {
    window.characterAttacks[idx][prop] = value;
    window.renderAttacks();
  }
};

window.addAttackDamageComponent = function(atkIdx: number) {
  const atk = window.characterAttacks?.[atkIdx];
  if (!atk) return;
  ensureDamageComponents(atk);
  atk.damageComponents.push({
    id: 'dc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    diceCount: 1,
    diceFaces: 6,
    damageType: 'Astral',
    customDamageType: ''
  });
  window.renderAttacks();
  if (window.showToast) window.showToast('✨ Novo dado de dano adicionado!', 'info');
};

window.removeAttackDamageComponent = function(atkIdx: number, compIdx: number) {
  const atk = window.characterAttacks?.[atkIdx];
  if (!atk) return;
  ensureDamageComponents(atk);
  if (atk.damageComponents.length <= 1) {
    if (window.showToast) window.showToast('O ataque deve ter pelo menos um dado de dano.', 'warning');
    return;
  }
  atk.damageComponents.splice(compIdx, 1);
  window.renderAttacks();
};

window.updateAttackDamageComponent = function(atkIdx: number, compIdx: number, prop: string, value: any) {
  const atk = window.characterAttacks?.[atkIdx];
  if (!atk) return;
  ensureDamageComponents(atk);
  if (atk.damageComponents[compIdx]) {
    atk.damageComponents[compIdx][prop] = value;
    window.renderAttacks();
  }
};

window.rollAttackTest = function(idx: number) {
  const atk = window.characterAttacks?.[idx];
  if (!atk) return;

  const skillInfo = getSkillBonusForAttack(atk.skillType, atk.customSkillName);
  const extraBonus = parseInt(atk.attackBonus) || 0;
  const totalMod = skillInfo.bonus + extraBonus;
  
  const d20 = Math.floor(Math.random() * 20) + 1;
  const total = d20 + totalMod;
  const critThreat = parseInt(atk.critThreat) || 20;
  const isCrit = d20 >= critThreat;
  const isFumble = d20 === 1;

  const formattedMod = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
  
  let msg = `🎯 **${atk.name}** [Teste de Ataque]\nPerícia: ${skillInfo.name} (${skillInfo.bonus >= 0 ? '+' : ''}${skillInfo.bonus}) | Extra: ${extraBonus >= 0 ? '+' : ''}${extraBonus}\nRolagem: [d20: ${d20}] ${formattedMod} = **${total}**`;
  
  if (isCrit) {
    msg += ` 🔥 **AMEAÇA DE CRÍTICO!** (Margem ${critThreat} ou +)\nClique no botão de dano crítico para rolar com multiplicador x${atk.critMultiplier || 2}!`;
  } else if (isFumble) {
    msg += ` 💀 **FALHA CRÍTICA!** (1 Natural)`;
  }

  if (window.showToast) {
    window.showToast(msg, isCrit ? 'success' : (isFumble ? 'error' : 'info'));
  }
};

window.rollAttackDamage = function(idx: number, isCritical: boolean = false) {
  const atk = window.characterAttacks?.[idx];
  if (!atk) return;
  ensureDamageComponents(atk);

  const critMult = isCritical ? (parseInt(atk.critMultiplier) || 2) : 1;
  const attrBonus = getAttributeBonus(atk.damageAttr);
  const extraBonus = parseInt(atk.damageBonus) || 0;
  const totalFlatBonus = attrBonus + extraBonus;

  let grandDiceSum = 0;
  const detailLines: string[] = [];
  const typeTotals: Record<string, number> = {};

  atk.damageComponents.forEach((comp: AttackDamageComponent, cIdx: number) => {
    const baseCount = parseInt(String(comp.diceCount)) || 1;
    const totalCount = baseCount * critMult;
    const faces = parseInt(String(comp.diceFaces)) || 6;
    const finalType = comp.damageType === 'Personalizado' ? (comp.customDamageType || 'Dano') : comp.damageType;

    const rolls: number[] = [];
    let compSum = 0;
    for (let i = 0; i < totalCount; i++) {
      const r = Math.floor(Math.random() * faces) + 1;
      rolls.push(r);
      compSum += r;
    }

    grandDiceSum += compSum;
    typeTotals[finalType] = (typeTotals[finalType] || 0) + compSum;

    const critNote = isCritical ? ` [Crítico x${critMult}]` : '';
    detailLines.push(`• **${totalCount}d${faces}**${critNote} [${rolls.join(', ')}] = **${compSum}** (${finalType})`);
  });

  const totalDmg = Math.max(1, grandDiceSum + totalFlatBonus);

  // Summarize damage types
  const typesBreakdown = Object.entries(typeTotals)
    .map(([tName, val]) => `${val} ${tName}`)
    .join(' + ');

  let bonusStr = '';
  if (atk.damageAttr && attrBonus !== 0) {
    bonusStr += ` + ${atk.damageAttr} (${attrBonus >= 0 ? '+' : ''}${attrBonus})`;
  }
  if (extraBonus !== 0) {
    bonusStr += ` + Extra (${extraBonus >= 0 ? '+' : ''}${extraBonus})`;
  }

  const headerTitle = isCritical ? `🔥 **${atk.name}** [DANO CRÍTICO (x${critMult})]` : `💥 **${atk.name}** [Dano]`;
  const msg = `${headerTitle}\n${detailLines.join('\n')}${bonusStr ? `\n• Bônus Fixo:${bonusStr}` : ''}\n\n➡ **TOTAL:** **${totalDmg}** (${typesBreakdown}${totalFlatBonus !== 0 ? ` + ${totalFlatBonus} Bônus` : ''})`;

  if (window.showToast) {
    window.showToast(msg, isCritical ? 'warning' : 'success');
  }
};

window.renderAttacks = function() {
  syncEquippedWeaponsWithAttacks();

  const container = document.getElementById('attacks-list-container');
  const badgeEl = document.getElementById('attacks-count-badge');
  const attacks = window.characterAttacks || [];

  if (badgeEl) {
    const count = attacks.length;
    badgeEl.innerText = `${count} ataque${count === 1 ? '' : 's'}`;
  }

  if (!container) return;

  if (attacks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 border border-dashed border-[#2d354f] rounded-xl bg-[#0e121d]">
        <i data-lucide="swords" class="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-60"></i>
        <p class="text-sm text-slate-300 font-semibold">Nenhum ataque ou arma configurada.</p>
        <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">Equipe uma arma no Inventário (ela aparecerá automaticamente com todos os seus dados e tipos de dano) ou clique em "Adicionar Ataque" abaixo.</p>
      </div>
    `;
    if ((window as any).lucide) (window as any).lucide.createIcons();
    return;
  }

  const attrs = window.characterAttributes || [];
  const skills = window.characterSkills || [];

  // Standard skills options for Teste de Ataque
  const baseSkills = [
    { id: 'luta', name: 'Luta' },
    { id: 'pontaria', name: 'Pontaria' },
    { id: 'atletismo', name: 'Atletismo' },
    { id: 'misticismo', name: 'Misticismo' }
  ];

  // Other skills from sheet
  const otherSheetSkills = skills.filter((s: any) => !baseSkills.some(b => b.id === s.id.toLowerCase() || b.name.toLowerCase() === s.name.toLowerCase()));

  // Comprehensive Damage type options
  const damageTypes = [
    'Corte',
    'Perfuração',
    'Impacto',
    'Astral',
    'Fogo',
    'Frio',
    'Eletricidade',
    'Ácido',
    'Sônico',
    'Trevas',
    'Luz',
    'Mental',
    'Psíquico',
    'Essência',
    'Veneno',
    'Sagrado',
    'Profano',
    'Mágico',
    'Personalizado'
  ];

  // Range options
  const rangeOptions = [
    'Corpo a Corpo',
    'Corpo (1,5m)',
    'Curto (9m / 6 sq)',
    'Médio (18m / 12 sq)',
    'Longo (36m / 24 sq)',
    'Extremo (90m / 60 sq)',
    'Toque',
    'Personalizado'
  ];

  container.innerHTML = attacks.map((atk: any, idx: number) => {
    ensureDamageComponents(atk);

    // Skill bonus calculation
    const skillInfo = getSkillBonusForAttack(atk.skillType, atk.customSkillName);
    const extraAttackBonus = parseInt(atk.attackBonus) || 0;
    const totalAttackTestBonus = skillInfo.bonus + extraAttackBonus;
    const formattedAttackTest = totalAttackTestBonus >= 0 ? `+${totalAttackTestBonus}` : `${totalAttackTestBonus}`;

    // Damage components formula summary
    const attrBonus = getAttributeBonus(atk.damageAttr);
    const extraDamageBonus = parseInt(atk.damageBonus) || 0;
    const totalDamageBonus = attrBonus + extraDamageBonus;
    const formattedDamageBonus = totalDamageBonus >= 0 ? `+${totalDamageBonus}` : `${totalDamageBonus}`;

    const formulaParts = atk.damageComponents.map((c: AttackDamageComponent) => {
      const typeLabel = c.damageType === 'Personalizado' ? (c.customDamageType || 'Dano') : c.damageType;
      return `${c.diceCount || 1}d${c.diceFaces || 6} ${typeLabel}`;
    });
    let fullDamageFormula = formulaParts.join(' + ');
    if (totalDamageBonus !== 0) {
      fullDamageFormula += ` ${formattedDamageBonus}`;
    }

    // Threat & Multiplier display
    const threatDisplay = (atk.critThreat && parseInt(atk.critThreat) < 20) ? `${atk.critThreat}-20` : '20';
    const critDisplay = `${threatDisplay} / x${atk.critMultiplier || 2}`;

    // Attribute Select Options
    const attrOptions = `<option value="">--</option>` + attrs.map((a: any) => {
      const aTotal = a.values.reduce((sum: number, v: number) => sum + v, 0);
      const formattedATotal = aTotal >= 0 ? `+${aTotal}` : `${aTotal}`;
      const isSel = (atk.damageAttr || '').toUpperCase() === a.id.toUpperCase();
      return `<option value="${a.id}" ${isSel ? 'selected' : ''}>${a.id} (${formattedATotal})</option>`;
    }).join('');

    // Skill Select Options
    let skillOptionsHtml = baseSkills.map(b => {
      const isSel = (atk.skillType || '').toLowerCase() === b.id;
      const bInfo = getSkillBonusForAttack(b.id);
      const bFmt = bInfo.bonus >= 0 ? `+${bInfo.bonus}` : `${bInfo.bonus}`;
      return `<option value="${b.id}" ${isSel ? 'selected' : ''}>${b.name} (${bFmt})</option>`;
    }).join('');

    if (otherSheetSkills.length > 0) {
      skillOptionsHtml += `<optgroup label="Outras Perícias da Ficha">`;
      otherSheetSkills.forEach((s: any) => {
        const isSel = (atk.skillType || '').toLowerCase() === s.id.toLowerCase() || atk.skillType === s.name;
        const sInfo = getSkillBonusForAttack(s.id);
        const sFmt = sInfo.bonus >= 0 ? `+${sInfo.bonus}` : `${sInfo.bonus}`;
        skillOptionsHtml += `<option value="${s.id}" ${isSel ? 'selected' : ''}>${s.name} (${sFmt})</option>`;
      });
      skillOptionsHtml += `</optgroup>`;
    }

    skillOptionsHtml += `<option value="outro" ${atk.skillType === 'outro' ? 'selected' : ''}>Outro / Personalizado</option>`;

    // Range options
    const isRangeCustom = !rangeOptions.includes(atk.range) || atk.range === 'Personalizado';
    const rangeOptionsHtml = rangeOptions.map(r => {
      const isSel = (atk.range || 'Corpo a Corpo') === r;
      return `<option value="${r}" ${isSel ? 'selected' : ''}>${r}</option>`;
    }).join('');

    // Damage Components HTML rows
    const componentsHtml = atk.damageComponents.map((comp: AttackDamageComponent, cIdx: number) => {
      const dmgTypeOptionsHtml = damageTypes.map(t => {
        const isSel = (comp.damageType || 'Corte') === t;
        return `<option value="${t}" ${isSel ? 'selected' : ''}>${t}</option>`;
      }).join('');

      return `
        <div class="bg-[#181d2e] border border-[#2d354f] rounded-lg p-2 space-y-1.5 transition-all hover:border-purple-500/40">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full ${cIdx === 0 ? 'bg-purple-400' : 'bg-cyan-400'}"></span>
              Dado #${cIdx + 1}
            </span>
            ${atk.damageComponents.length > 1 ? `
              <button type="button" 
                onclick="window.removeAttackDamageComponent(${idx}, ${cIdx})" 
                class="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors" 
                title="Remover este dado de dano">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            <!-- Dados de Dano (Quantidade d Faces) -->
            <div class="flex items-center space-x-1">
              <input type="number" min="1" max="50" 
                value="${comp.diceCount || 1}" 
                onchange="window.updateAttackDamageComponent(${idx}, ${cIdx}, 'diceCount', Math.max(1, parseInt(this.value) || 1))" 
                class="w-12 bg-[#0e121d] border border-[#2d354f] focus:border-purple-500 rounded px-1.5 py-1 text-xs text-white text-center font-bold focus:outline-none"
                title="Quantidade de dados">
              <span class="text-slate-400 font-bold text-xs">d</span>
              <select onchange="window.updateAttackDamageComponent(${idx}, ${cIdx}, 'diceFaces', parseInt(this.value) || 6)" class="flex-1 bg-[#0e121d] border border-[#2d354f] focus:border-purple-500 rounded px-1.5 py-1 text-xs text-white font-medium focus:outline-none">
                <option value="4" ${comp.diceFaces === 4 ? 'selected' : ''}>d4</option>
                <option value="6" ${comp.diceFaces === 6 || !comp.diceFaces ? 'selected' : ''}>d6</option>
                <option value="8" ${comp.diceFaces === 8 ? 'selected' : ''}>d8</option>
                <option value="10" ${comp.diceFaces === 10 ? 'selected' : ''}>d10</option>
                <option value="12" ${comp.diceFaces === 12 ? 'selected' : ''}>d12</option>
                <option value="20" ${comp.diceFaces === 20 ? 'selected' : ''}>d20</option>
                <option value="100" ${comp.diceFaces === 100 ? 'selected' : ''}>d100</option>
              </select>
            </div>

            <!-- Tipo de Dano -->
            <div class="flex flex-col space-y-1">
              <select onchange="window.updateAttackDamageComponent(${idx}, ${cIdx}, 'damageType', this.value)" class="w-full bg-[#0e121d] border border-[#2d354f] focus:border-purple-500 rounded px-2 py-1 text-xs text-cyan-200 font-semibold focus:outline-none">
                ${dmgTypeOptionsHtml}
              </select>
              ${comp.damageType === 'Personalizado' ? `
                <input type="text" 
                  value="${comp.customDamageType || ''}" 
                  onchange="window.updateAttackDamageComponent(${idx}, ${cIdx}, 'customDamageType', this.value)" 
                  placeholder="Nome do tipo (ex: Astral)"
                  class="w-full bg-[#0e121d] border border-[#2d354f] rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-purple-500">
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="bg-[#0b0f19] border ${atk.isEquippedWeapon ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/20 via-[#0b0f19] to-[#0b0f19]' : 'border-[#1e2336]'} rounded-xl p-4 space-y-4 transition-all hover:border-[#3d466b] shadow-md">
        
        <!-- Header: Nome do Ataque & Ações Rápidas -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#1e2336]">
          <div class="flex items-center space-x-2.5 flex-1 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-300 shrink-0 shadow-sm">
              <i data-lucide="swords" class="w-4 h-4"></i>
            </div>
            <div class="flex items-center space-x-2 flex-1 min-w-0">
              <input type="text" 
                value="${(atk.name || '').replace(/"/g, '&quot;')}" 
                onchange="window.updateAttackProp(${idx}, 'name', this.value)" 
                placeholder="Nome do Ataque ou Arma"
                class="bg-[#141824] border border-[#2d354f] focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white w-full focus:outline-none transition-colors">
              ${atk.isEquippedWeapon ? `
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-200 border border-purple-400/30 shrink-0 whitespace-nowrap" title="Item vinculado ao Inventário como Arma Equipada">
                  ⚔️ Equipado
                </span>
              ` : ''}
            </div>
          </div>

          <div class="flex items-center justify-end shrink-0 self-end sm:self-auto">
            <button type="button" 
              onclick="window.removeAttack(${idx})" 
              class="px-2 py-1 text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 rounded-lg transition-colors flex items-center space-x-1 text-xs" 
              title="Remover Ataque">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Excluir</span>
            </button>
          </div>
        </div>

        <!-- Quick Roll Action Bar (Enquadramento perfeito e responsivo sem overflow) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <!-- Teste de Ataque -->
          <button type="button" 
            onclick="window.rollAttackTest(${idx})" 
            class="w-full px-3 py-2 rounded-lg bg-[#281358] hover:bg-[#391a7c] border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm group">
            <i data-lucide="dice-5" class="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform shrink-0"></i>
            <span class="truncate">Ataque: <strong class="text-white font-mono font-bold">${formattedAttackTest}</strong></span>
          </button>

          <!-- Dano Normal -->
          <button type="button" 
            onclick="window.rollAttackDamage(${idx}, false)" 
            class="w-full px-3 py-2 rounded-lg bg-[#3b1219] hover:bg-[#521721] border border-red-500/40 text-red-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm group">
            <i data-lucide="zap" class="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform shrink-0"></i>
            <span class="truncate">Dano: <strong class="text-white font-mono font-bold">${fullDamageFormula}</strong></span>
          </button>

          <!-- Dano Crítico -->
          <button type="button" 
            onclick="window.rollAttackDamage(${idx}, true)" 
            class="w-full px-3 py-2 rounded-lg bg-[#3b2310] hover:bg-[#523315] border border-amber-500/40 text-amber-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm group">
            <i data-lucide="flame" class="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0"></i>
            <span class="truncate">Crítico (x${atk.critMultiplier || 2})</span>
          </button>
        </div>

        <!-- Linha dos Campos Principais (Enquadramento perfeitamente distribuído) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 items-stretch text-xs">
          
          <!-- 1. Teste de Ataque -->
          <div class="bg-[#141824] border border-[#2d354f] rounded-xl p-3.5 space-y-2.5 lg:col-span-4 flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center justify-between pb-2 border-b border-[#1e2336] mb-2">
                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <span>🎯 TESTE DE ATAQUE</span>
                </span>
                <span class="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">d20 ${formattedAttackTest}</span>
              </div>
              
              <div class="space-y-2.5">
                <div>
                  <label class="text-[10px] text-slate-400 font-medium block mb-1">Perícia:</label>
                  <select onchange="window.updateAttackProp(${idx}, 'skillType', this.value)" class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-purple-500 transition-colors">
                    ${skillOptionsHtml}
                  </select>
                </div>

                ${atk.skillType === 'outro' ? `
                  <div>
                    <input type="text" 
                      value="${(atk.customSkillName || '').replace(/"/g, '&quot;')}" 
                      onchange="window.updateAttackProp(${idx}, 'customSkillName', this.value)" 
                      placeholder="Nome da perícia / teste"
                      class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500">
                  </div>
                ` : ''}

                <div>
                  <label class="text-[10px] text-slate-400 font-medium block mb-1">Bônus Extra de Acerto:</label>
                  <div class="flex items-center space-x-1.5">
                    <span class="text-slate-400 text-xs font-bold w-4 text-center">+</span>
                    <input type="number" 
                      value="${atk.attackBonus || 0}" 
                      onchange="window.updateAttackProp(${idx}, 'attackBonus', parseInt(this.value) || 0)" 
                      placeholder="0"
                      class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2.5 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-purple-500 transition-colors">
                  </div>
                </div>
              </div>
            </div>

            <div class="text-[10px] text-slate-500 pt-2 border-t border-[#1e2336] italic">
              Base: ${skillInfo.name} (${skillInfo.bonus >= 0 ? '+' : ''}${skillInfo.bonus})
            </div>
          </div>

          <!-- 2. Dano & Múltiplos Dados com Tipos Individuais -->
          <div class="bg-[#141824] border border-[#2d354f] rounded-xl p-3.5 space-y-3 lg:col-span-5 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between flex-wrap gap-1 pb-2 border-b border-[#1e2336] mb-2">
                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wider">💥 DADOS & TIPOS DE DANO</span>
                <span class="text-[10px] font-mono font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30 truncate max-w-[180px]">${fullDamageFormula}</span>
              </div>

              <!-- Lista de Componentes de Dano -->
              <div class="space-y-2 mb-2.5">
                ${componentsHtml}
              </div>

              <!-- Botão Adicionar Dado de Dano Extra -->
              <button type="button" 
                onclick="window.addAttackDamageComponent(${idx})" 
                class="w-full py-2 px-3 rounded-lg border border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm">
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-purple-400"></i>
                <span>+ Adicionar Dado Extra (ex: +1d6 Astral / Fogo)</span>
              </button>
            </div>

            <!-- Modificadores Fixos (Atributo e Bônus Fixo) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-[#1e2336]">
              <div>
                <label class="text-[10px] text-slate-400 font-medium block mb-1">Atributo no Dano:</label>
                <select onchange="window.updateAttackProp(${idx}, 'damageAttr', this.value)" class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-purple-500 transition-colors">
                  ${attrOptions}
                </select>
              </div>

              <div>
                <label class="text-[10px] text-slate-400 font-medium block mb-1">Bônus Fixo Extra:</label>
                <div class="flex items-center space-x-1">
                  <span class="text-slate-400 text-xs font-bold">+</span>
                  <input type="number" 
                    value="${atk.damageBonus || 0}" 
                    onchange="window.updateAttackProp(${idx}, 'damageBonus', parseInt(this.value) || 0)" 
                    placeholder="0"
                    class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-purple-500 transition-colors">
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Crítico & Alcance -->
          <div class="bg-[#141824] border border-[#2d354f] rounded-xl p-3.5 space-y-3 lg:col-span-3 flex flex-col justify-between shadow-sm md:col-span-2 lg:col-span-3">
            <!-- Crítico -->
            <div class="space-y-2">
              <div class="flex items-center justify-between pb-2 border-b border-[#1e2336]">
                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wider">⚡ CRÍTICO</span>
                <span class="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">${critDisplay}</span>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] text-slate-400 font-medium block mb-1">Ameaça:</label>
                  <select onchange="window.updateAttackProp(${idx}, 'critThreat', parseInt(this.value) || 20)" class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-purple-500 transition-colors">
                    <option value="20" ${(atk.critThreat || 20) === 20 ? 'selected' : ''}>20</option>
                    <option value="19" ${atk.critThreat === 19 ? 'selected' : ''}>19-20</option>
                    <option value="18" ${atk.critThreat === 18 ? 'selected' : ''}>18-20</option>
                    <option value="17" ${atk.critThreat === 17 ? 'selected' : ''}>17-20</option>
                    <option value="16" ${atk.critThreat === 16 ? 'selected' : ''}>16-20</option>
                    <option value="15" ${atk.critThreat === 15 ? 'selected' : ''}>15-20</option>
                    <option value="14" ${atk.critThreat === 14 ? 'selected' : ''}>14-20</option>
                  </select>
                </div>

                <div>
                  <label class="text-[10px] text-slate-400 font-medium block mb-1">Multiplicador:</label>
                  <select onchange="window.updateAttackProp(${idx}, 'critMultiplier', parseInt(this.value) || 2)" class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-purple-500 transition-colors">
                    <option value="2" ${(atk.critMultiplier || 2) === 2 ? 'selected' : ''}>x2</option>
                    <option value="3" ${atk.critMultiplier === 3 ? 'selected' : ''}>x3</option>
                    <option value="4" ${atk.critMultiplier === 4 ? 'selected' : ''}>x4</option>
                    <option value="5" ${atk.critMultiplier === 5 ? 'selected' : ''}>x5</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Alcance -->
            <div class="space-y-2 pt-2 border-t border-[#1e2336]">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wider">📏 ALCANCE</span>
                <span class="text-[10px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 truncate max-w-[120px]">${isRangeCustom ? (atk.customRange || atk.range || 'Custom') : atk.range}</span>
              </div>

              <div>
                <select onchange="window.updateAttackProp(${idx}, 'range', this.value)" class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-purple-500 transition-colors">
                  ${rangeOptionsHtml}
                </select>
              </div>

              ${isRangeCustom ? `
                <div>
                  <input type="text" 
                    value="${(atk.customRange || atk.range || '').replace(/"/g, '&quot;')}" 
                    onchange="window.updateAttackProp(${idx}, 'customRange', this.value)" 
                    placeholder="Ex: Corpo (1,5m), 15m..."
                    class="w-full bg-[#1e2336] border border-[#2d354f] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500">
                </div>
              ` : ''}
            </div>

          </div>

        </div>

      </div>
    `;
  }).join('');

  if ((window as any).lucide) {
    setTimeout(() => (window as any).lucide.createIcons(), 0);
  }
};


// ---------------------- HABILIDADES, MAGIAS & INFORMAÇÕES LIVRES (CARDS) ----------------------

export interface CharacterCustomSection {
  id: string;
  title: string;
  content: string;
}

window.characterCustomSections = [];

window.addCustomSection = function() {
  if (!window.characterCustomSections) {
    window.characterCustomSections = [];
  }
  window.characterCustomSections.push({
    id: 'sec_' + Math.random().toString(36).substr(2, 7),
    title: '',
    content: ''
  });
  window.renderCustomSections();
};

window.removeCustomSection = function(idx: number) {
  if (!window.characterCustomSections) return;
  window.characterCustomSections.splice(idx, 1);
  window.renderCustomSections();
};

window.updateCustomSection = function(idx: number, prop: 'title' | 'content', value: string) {
  if (!window.characterCustomSections || !window.characterCustomSections[idx]) return;
  window.characterCustomSections[idx][prop] = value;
  // Update badge count without full redraw so focus isn't lost on text input/textarea
  const badgeEl = document.getElementById('custom-sections-count-badge');
  if (badgeEl) {
    const count = window.characterCustomSections.length;
    badgeEl.innerText = `${count} categoria${count === 1 ? '' : 's'}`;
  }
};

window.renderCustomSections = function() {
  const container = document.getElementById('custom-sections-list');
  const badgeEl = document.getElementById('custom-sections-count-badge');
  const sections = window.characterCustomSections || [];

  if (badgeEl) {
    const count = sections.length;
    badgeEl.innerText = `${count} categoria${count === 1 ? '' : 's'}`;
  }

  if (!container) return;

  if (sections.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 border border-dashed border-[#2d354f] rounded-xl bg-[#0e121d]">
        <i data-lucide="sparkles" class="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-60"></i>
        <p class="text-sm text-slate-300 font-semibold">Nenhuma categoria de habilidades ou magias cadastrada.</p>
        <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">Adicione categorias personalizadas (como Magias de 1º Círculo, Poderes de Classe, Itens Mágicos ou Notas Livres) clicando no botão abaixo.</p>
      </div>
    `;
    if ((window as any).lucide) (window as any).lucide.createIcons();
    return;
  }

  container.innerHTML = sections.map((sec: CharacterCustomSection, idx: number) => {
    const safeTitle = (sec.title || '').replace(/"/g, '&quot;');
    const safeContent = (sec.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const textareaId = `custom-section-textarea-${idx}`;

    return `
      <div class="bg-[#0b0f19] border border-[#2d354f] rounded-xl p-3.5 space-y-2.5 transition-all hover:border-purple-500/40 shadow-sm">
        <!-- Top Row: Input Título da Categoria + Botão Remover -->
        <div class="flex items-center space-x-2">
          <input type="text" 
            value="${safeTitle}" 
            oninput="window.updateCustomSection(${idx}, 'title', this.value)" 
            placeholder="Título da Categoria (Ex: Magias de 1º Círculo, Poderes Concedidos...)"
            class="flex-1 bg-[#141824] border border-[#2d354f] focus:border-purple-500 rounded-lg px-3 py-2 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none transition-colors">
          
          <button type="button" 
            onclick="window.removeCustomSection(${idx})" 
            class="text-xs font-bold text-slate-400 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all flex items-center space-x-1.5 shrink-0" 
            title="Remover esta categoria">
            <i data-lucide="x" class="w-4 h-4 text-slate-400 hover:text-red-400"></i>
            <span>Remover</span>
          </button>
        </div>

        <!-- Textarea Descrição dos Efeitos com botão Expandir -->
        <div>
          <div class="flex items-center justify-end mb-1">
            <button type="button" 
              onclick="window.toggleTextareaExpand('${textareaId}', this)" 
              class="btn-expand-textarea flex items-center space-x-1 text-[10px] font-bold text-purple-300 hover:text-white bg-[#141824] hover:bg-[#252b3d] border border-[#2d354f] hover:border-purple-500/50 px-2 py-0.5 rounded transition-all shadow-sm" 
              title="Expandir caixa para comportar todo o conteúdo">
              <svg class="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              <span>Expandir</span>
            </button>
          </div>
          <textarea 
            id="${textareaId}"
            oninput="window.updateCustomSection(${idx}, 'content', this.value); window.autoExpandTextarea(this);" 
            placeholder="Descreva os efeitos, custos de PM, detalhes ou regras..."
            class="w-full bg-[#141824] border border-[#2d354f] focus:border-purple-500 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none resize-y min-h-[95px] leading-relaxed transition-all">${safeContent}</textarea>
        </div>
      </div>
    `;
  }).join('');

  if ((window as any).lucide) {
    setTimeout(() => (window as any).lucide.createIcons(), 0);
  }
};


// ---------------------- LORE & PARTICIPAÇÃO POR EPISÓDIO ----------------------

export interface CharacterEpisode {
  id: string;
  title: string;
  summary: string;
  rewards: string;
}

window.characterEpisodes = [];

window.addEpisode = function() {
  if (!window.characterEpisodes) {
    window.characterEpisodes = [];
  }
  const nextNum = window.characterEpisodes.length + 1;
  window.characterEpisodes.push({
    id: 'ep_' + Math.random().toString(36).substr(2, 7),
    title: `Episódio ${nextNum}`,
    summary: '',
    rewards: ''
  });
  window.renderEpisodes();
};

window.removeEpisode = function(idx: number) {
  if (!window.characterEpisodes) return;
  window.characterEpisodes.splice(idx, 1);
  window.renderEpisodes();
};

window.updateEpisode = function(idx: number, prop: 'title' | 'summary' | 'rewards', value: string) {
  if (!window.characterEpisodes || !window.characterEpisodes[idx]) return;
  window.characterEpisodes[idx][prop] = value;
};

window.renderEpisodes = function() {
  const container = document.getElementById('episodes-list');
  const episodes = window.characterEpisodes || [];

  if (!container) return;

  if (episodes.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 border border-dashed border-[#2d354f] rounded-xl bg-[#0e121d]">
        <p class="text-xs text-slate-400">Nenhum episódio registrado ainda.</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Clique no botão abaixo para adicionar registros de sessões e aventuras do herói.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = episodes.map((ep: CharacterEpisode, idx: number) => {
    const safeTitle = (ep.title || '').replace(/"/g, '&quot;');
    const safeSummary = (ep.summary || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeRewards = (ep.rewards || '').replace(/"/g, '&quot;');
    const episodeTextareaId = `episode-summary-textarea-${idx}`;

    return `
      <div class="bg-[#0b0f19] border border-[#2d354f] rounded-xl p-3.5 space-y-2.5 transition-all hover:border-purple-500/30">
        <!-- Top Row: Input Título do Episódio + Botão Remover -->
        <div class="flex items-center space-x-2">
          <input type="text" 
            value="${safeTitle}" 
            oninput="window.updateEpisode(${idx}, 'title', this.value)" 
            placeholder="Episódio ${idx + 1}"
            class="flex-1 bg-[#141824] border border-[#2d354f] focus:border-purple-500 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none transition-colors">
          
          <button type="button" 
            onclick="window.removeEpisode(${idx})" 
            class="text-xs font-bold text-slate-400 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all flex items-center space-x-1 shrink-0" 
            title="Remover este episódio">
            <span>✕ Remover</span>
          </button>
        </div>

        <!-- Textarea Resumo dos Acontecimentos com botão Expandir -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resumo da Aventura</span>
            <button type="button" 
              onclick="window.toggleTextareaExpand('${episodeTextareaId}', this)" 
              class="btn-expand-textarea flex items-center space-x-1 text-[10px] font-bold text-purple-300 hover:text-white bg-[#141824] hover:bg-[#252b3d] border border-[#2d354f] hover:border-purple-500/50 px-2 py-0.5 rounded transition-all shadow-sm" 
              title="Expandir caixa para comportar todo o conteúdo">
              <svg class="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              <span>Expandir</span>
            </button>
          </div>
          <textarea 
            id="${episodeTextareaId}"
            oninput="window.updateEpisode(${idx}, 'summary', this.value); window.autoExpandTextarea(this);" 
            placeholder="Resumo dos acontecimentos marcantes da participação do personagem..."
            class="w-full bg-[#141824] border border-[#2d354f] focus:border-purple-500 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder:text-slate-500 focus:outline-none resize-y min-h-[70px] leading-relaxed transition-all">${safeSummary}</textarea>
        </div>

        <!-- Input XP Ganho / Recompensas / Conquistas -->
        <div>
          <input type="text" 
            value="${safeRewards}" 
            oninput="window.updateEpisode(${idx}, 'rewards', this.value)" 
            placeholder="XP Ganho / Recompensas / Conquistas..."
            class="w-full bg-[#141824] border border-[#2d354f] focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono placeholder:text-slate-500 focus:outline-none transition-colors">
        </div>
      </div>
    `;
  }).join('');
};


// ---------------------- ACCORDION CONTROLS & EXPANDABLE TEXTAREAS ----------------------

const ACCORDION_TABS_CONFIG = [
  { id: 'cabecalho-content', onOpen: () => { if (window.renderClasses) window.renderClasses(); } },
  { id: 'atributos-content', onOpen: () => { if (window.renderAttributes) window.renderAttributes(); } },
  { id: 'pericias-content', onOpen: () => { if (window.renderSkills) window.renderSkills(); } },
  { id: 'recursos-content', onOpen: () => { if (window.renderDefense) window.renderDefense(); } },
  { id: 'armors-shields-content', onOpen: () => { if (window.renderEquippedGearTab) window.renderEquippedGearTab(); } },
  { id: 'attacks-content', onOpen: () => { if (window.renderAttacks) window.renderAttacks(); } },
  { id: 'custom-sections-content', onOpen: () => { if (window.renderCustomSections) window.renderCustomSections(); } },
  { id: 'inventory-content', onOpen: () => { if (window.renderInventory) window.renderInventory(); } },
  { id: 'lore-content', onOpen: () => { if (window.renderEpisodes) window.renderEpisodes(); } }
];

window.toggleAccordionTab = function(contentId: string, btnEl?: HTMLElement) {
  const content = document.getElementById(contentId);
  if (!content) return;
  const isHidden = content.classList.contains('hidden');

  if (isHidden) {
    content.classList.remove('hidden');
    const tabDef = ACCORDION_TABS_CONFIG.find(t => t.id === contentId);
    if (tabDef && tabDef.onOpen) tabDef.onOpen();
  } else {
    content.classList.add('hidden');
  }

  const button = btnEl || (content.previousElementSibling as HTMLElement);
  if (button) {
    const chevron = button.querySelector('.accordion-chevron') || button.querySelector('svg:last-of-type');
    if (chevron) {
      if (isHidden) {
        chevron.classList.add('rotate-180');
      } else {
        chevron.classList.remove('rotate-180');
      }
    }
  }
};

window.expandAllAccordionTabs = function() {
  ACCORDION_TABS_CONFIG.forEach(tab => {
    const content = document.getElementById(tab.id);
    if (content) {
      content.classList.remove('hidden');
      if (tab.onOpen) tab.onOpen();
      const button = content.previousElementSibling as HTMLElement;
      if (button) {
        const chevron = button.querySelector('.accordion-chevron') || button.querySelector('svg:last-of-type');
        if (chevron) chevron.classList.add('rotate-180');
      }
    }
  });
};

window.collapseAllAccordionTabs = function() {
  ACCORDION_TABS_CONFIG.forEach(tab => {
    const content = document.getElementById(tab.id);
    if (content) {
      content.classList.add('hidden');
      const button = content.previousElementSibling as HTMLElement;
      if (button) {
        const chevron = button.querySelector('.accordion-chevron') || button.querySelector('svg:last-of-type');
        if (chevron) chevron.classList.remove('rotate-180');
      }
    }
  });
};

window.toggleTextareaExpand = function(target: string | HTMLElement, btnEl?: HTMLElement) {
  const el: HTMLTextAreaElement | null = typeof target === 'string'
    ? (document.getElementById(target) as HTMLTextAreaElement)
    : (target as HTMLTextAreaElement);

  if (!el) return;

  const isExpanded = el.getAttribute('data-expanded') === 'true';
  const button = btnEl || (el.parentElement?.querySelector('.btn-expand-textarea') as HTMLElement);

  if (isExpanded) {
    // Recolher para o tamanho padrão
    const originalHeight = el.getAttribute('data-original-height') || '';
    el.style.height = originalHeight;
    el.setAttribute('data-expanded', 'false');
    if (button) {
      button.innerHTML = `
        <svg class="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
        <span>Expandir</span>
      `;
      button.classList.remove('bg-purple-900/60', 'text-white', 'border-purple-400');
      button.classList.add('text-purple-300');
    }
  } else {
    // Salvar altura original e expandir para acomodar todo o conteúdo
    if (!el.getAttribute('data-original-height')) {
      el.setAttribute('data-original-height', el.style.height || `${el.offsetHeight}px`);
    }
    el.style.height = 'auto';
    const contentHeight = Math.max(el.scrollHeight + 16, 120);
    el.style.height = `${contentHeight}px`;
    el.setAttribute('data-expanded', 'true');
    if (button) {
      button.innerHTML = `
        <svg class="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 14 10 14 10 20"></polyline>
          <polyline points="20 10 14 10 14 4"></polyline>
          <line x1="14" y1="10" x2="21" y2="3"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
        <span>Recolher</span>
      `;
      button.classList.remove('text-purple-300');
      button.classList.add('bg-purple-900/60', 'text-white', 'border-purple-400');
    }
  }
};

window.autoExpandTextarea = function(el: HTMLTextAreaElement) {
  if (!el) return;
  if (el.getAttribute('data-expanded') === 'true') {
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight + 16, 120)}px`;
  }
};

// Initial DOM bindings and render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.renderClasses) window.renderClasses();
    if (window.renderUploadedFilesUI) window.renderUploadedFilesUI();
  });
} else {
  if (window.renderClasses) window.renderClasses();
  if (window.renderUploadedFilesUI) window.renderUploadedFilesUI();
}

// ==========================================
// ARQUIVOS CARREGADOS (FIREBASE ENGINE)
// ==========================================

window.allUploadedFiles = [];
window.uploadedFilesFilterKeyword = '';
window.currentViewingFile = null;

// Subscribe in real-time to Firebase Firestore uploaded files
subscribeToUploadedFiles((files) => {
  window.allUploadedFiles = files;
  if (window.renderUploadedFilesUI) {
    window.renderUploadedFilesUI();
  }
});

window.copyToClipboard = function(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    window.showToast(`Copiado: "${text}"`, 'info');
  }).catch(() => {
    window.showToast('Falha ao copiar para a área de transferência', 'error');
  });
};

window.copyViewerContent = function() {
  if (!window.currentViewingFile) return;
  navigator.clipboard.writeText(window.currentViewingFile.content).then(() => {
    window.showToast('Conteúdo integral copiado com sucesso!', 'success');
  }).catch(() => {
    window.showToast('Erro ao copiar texto', 'error');
  });
};

window.closeFileViewerModal = function() {
  const modal = document.getElementById('file-viewer-modal');
  if (modal) modal.classList.add('hidden');
  window.currentViewingFile = null;
};

window.openArquivosModal = function() {
  const modal = document.getElementById('arquivos-modal');
  if (modal) {
    modal.classList.remove('hidden');
    window.renderUploadedFilesUI();
  } else {
    window.openModal('arquivos-modal');
  }
};

window.filterUploadedFilesUI = function(keyword: string) {
  window.uploadedFilesFilterKeyword = (keyword || '').toLowerCase().trim();
  window.renderUploadedFilesUI();
};

window.handleUploadFile = async function(category: FileCategory, fileList: FileList | null) {
  if (!fileList || fileList.length === 0) return;
  const file = fileList[0];

  // Restrict to .txt files
  if (!file.name.toLowerCase().endsWith('.txt') && file.type !== 'text/plain') {
    window.showToast('⚠️ Apenas arquivos com extensão .txt são permitidos!', 'error');
    return;
  }

  // Size limit check (Max 850KB to respect Firestore single document limits)
  if (file.size > 850 * 1024) {
    window.showToast('⚠️ O arquivo excede o limite máximo permitido de 850 KB para texto no Firestore.', 'error');
    return;
  }

  window.showToast(`Lendo e enviando "${file.name}" para ${category}...`, 'info');

  const reader = new FileReader();
  reader.onload = async (event) => {
    const textContent = event.target?.result;
    if (typeof textContent !== 'string') {
      window.showToast('Erro ao processar o conteúdo do arquivo .txt.', 'error');
      return;
    }

    try {
      const uploaderName = window.currentUserProfile?.username || auth.currentUser?.displayName || 'Aventureiro';
      const uploaderUid = auth.currentUser?.uid || 'guest';

      await uploadTextFile({
        category,
        fileName: file.name,
        content: textContent,
        fileSize: file.size,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName
      });

      // Clear input values
      const inputEl = document.getElementById(`upload-input-${category.toLowerCase().replace(/[^a-z]/g, '')}`) as HTMLInputElement;
      if (inputEl) inputEl.value = '';

      window.showToast(`✨ Arquivo "${category}:_${file.name}" salvo integralmente no Firebase!`, 'success');
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      window.showToast('Erro ao salvar o arquivo no Firestore. Verifique a conexão.', 'error');
    }
  };

  reader.onerror = () => {
    window.showToast('Falha ao ler o arquivo selecionado no seu dispositivo.', 'error');
  };

  reader.readAsText(file, 'UTF-8');
};

window.viewUploadedFile = async function(fileId: string) {
  let file = (window.allUploadedFiles || []).find((f) => f.id === fileId);
  if (!file) {
    file = (await getUploadedFileById(fileId)) || undefined;
  }
  if (!file) {
    window.showToast('Arquivo não encontrado no Firebase.', 'error');
    return;
  }

  window.currentViewingFile = file;
  const modal = document.getElementById('file-viewer-modal');
  const title = document.getElementById('viewer-file-title');
  const identifierEl = document.getElementById('viewer-file-identifier');
  const metaEl = document.getElementById('viewer-file-meta');
  const contentEl = document.getElementById('viewer-file-content');
  const lineCountEl = document.getElementById('viewer-file-lines');
  const charCountEl = document.getElementById('viewer-file-chars');
  const categoryBadge = document.getElementById('viewer-file-category-badge');

  if (title) title.innerText = file.fileName;
  if (identifierEl) identifierEl.innerText = file.identifier || `${file.category}:_${file.fileName}`;
  
  if (categoryBadge) {
    categoryBadge.innerText = file.category;
    if (file.category === 'Sistemas') {
      categoryBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold font-orbitron bg-purple-950 text-purple-300 border border-purple-500/50';
    } else if (file.category === 'Mundos') {
      categoryBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold font-orbitron bg-emerald-950 text-emerald-300 border border-emerald-500/50';
    } else {
      categoryBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold font-orbitron bg-amber-950 text-amber-300 border border-amber-500/50';
    }
  }

  if (metaEl) {
    const sizeKB = (file.fileSize / 1024).toFixed(1);
    let dateStr = 'Recentemente';
    if (file.createdAt?.toDate) {
      dateStr = file.createdAt.toDate().toLocaleString('pt-BR');
    } else if (file.createdAt?.seconds) {
      dateStr = new Date(file.createdAt.seconds * 1000).toLocaleString('pt-BR');
    }
    metaEl.innerText = `Tamanho: ${sizeKB} KB • Enviado por @${file.uploadedByName || 'Aventureiro'} em ${dateStr}`;
  }

  const lines = file.lineCount || file.content.split(/\r\n|\r|\n/).length;
  const chars = file.charCount || file.content.length;

  if (lineCountEl) lineCountEl.innerText = `${lines.toLocaleString('pt-BR')} linhas`;
  if (charCountEl) charCountEl.innerText = `${chars.toLocaleString('pt-BR')} caracteres`;

  if (contentEl) {
    contentEl.textContent = file.content;
  }

  if (modal) modal.classList.remove('hidden');
};

window.downloadUploadedFile = function(fileId: string) {
  const file = (window.allUploadedFiles || []).find((f) => f.id === fileId);
  if (!file) {
    window.showToast('Arquivo não localizado para download.', 'error');
    return;
  }

  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.fileName.endsWith('.txt') ? file.fileName : `${file.fileName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  window.showToast(`Download de "${file.fileName}" iniciado!`, 'info');
};

window.deleteUploadedFileUI = async function(fileId: string) {
  const file = (window.allUploadedFiles || []).find((f) => f.id === fileId);
  const identifier = file?.identifier || 'este arquivo';

  if (!confirm(`Deseja realmente remover o arquivo:\n"${identifier}"\ndo Firebase?`)) {
    return;
  }

  try {
    await deleteUploadedFile(fileId);
    window.showToast(`🗑️ Arquivo "${identifier}" removido com sucesso.`, 'info');
  } catch (error) {
    console.error('Error removing file:', error);
    window.showToast('Erro ao remover o arquivo do Firebase.', 'error');
  }
};

window.renderUploadedFilesUI = function() {
  const allFiles = window.allUploadedFiles || [];
  const keyword = window.uploadedFilesFilterKeyword || '';

  const filteredFiles = keyword
    ? allFiles.filter(
        (f) =>
          f.fileName.toLowerCase().includes(keyword) ||
          f.identifier.toLowerCase().includes(keyword) ||
          f.category.toLowerCase().includes(keyword) ||
          (f.uploadedByName && f.uploadedByName.toLowerCase().includes(keyword))
      )
    : allFiles;

  const sistemasFiles = filteredFiles.filter((f) => f.category === 'Sistemas');
  const mundosFiles = filteredFiles.filter((f) => f.category === 'Mundos');
  const contosFiles = filteredFiles.filter((f) => f.category === 'Contos&Personagens');

  // Update total and category badge counters
  const totalCountEl = document.getElementById('total-uploaded-files-count');
  if (totalCountEl) totalCountEl.innerText = `${allFiles.length} ${allFiles.length === 1 ? 'arquivo' : 'arquivos'}`;

  const countSistemasEl = document.getElementById('badge-count-sistemas');
  if (countSistemasEl) countSistemasEl.innerText = `${sistemasFiles.length}`;

  const countMundosEl = document.getElementById('badge-count-mundos');
  if (countMundosEl) countMundosEl.innerText = `${mundosFiles.length}`;

  const countContosEl = document.getElementById('badge-count-contos');
  if (countContosEl) countContosEl.innerText = `${contosFiles.length}`;

  // Render Category 1: Sistemas
  renderCategoryFileList('files-list-sistemas', sistemasFiles, 'Sistemas', 'purple');

  // Render Category 2: Mundos
  renderCategoryFileList('files-list-mundos', mundosFiles, 'Mundos', 'emerald');

  // Render Category 3: Contos&Personagens
  renderCategoryFileList('files-list-contos', contosFiles, 'Contos&Personagens', 'amber');

  // Refresh Lucide icons if present
  if (typeof (window as any).lucide !== 'undefined') {
    (window as any).lucide.createIcons();
  }
};

function renderCategoryFileList(
  containerId: string,
  files: UploadedFileData[],
  categoryName: FileCategory,
  themeColor: 'purple' | 'emerald' | 'amber'
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (files.length === 0) {
    const emptyIcon = categoryName === 'Sistemas' ? '⚡' : categoryName === 'Mundos' ? '🌍' : '📜';
    container.innerHTML = `
      <div class="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-purple-500/20 rounded-xl bg-cosmic-950/40 text-slate-400">
        <span class="text-2xl mb-1.5 opacity-60">${emptyIcon}</span>
        <p class="text-xs font-rajdhani font-semibold">Nenhum arquivo .txt carregado em ${categoryName}.</p>
        <p class="text-[10px] text-slate-500 mt-0.5">Clique em "Adicionar Arquivo" acima para enviar.</p>
      </div>
    `;
    return;
  }

  const borderAccent =
    themeColor === 'purple'
      ? 'border-purple-500/30 hover:border-purple-400/60'
      : themeColor === 'emerald'
      ? 'border-emerald-500/30 hover:border-emerald-400/60'
      : 'border-amber-500/30 hover:border-amber-400/60';

  const tagBg =
    themeColor === 'purple'
      ? 'bg-purple-950/80 text-purple-200 border-purple-500/40'
      : themeColor === 'emerald'
      ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40'
      : 'bg-amber-950/80 text-amber-200 border-amber-500/40';

  let html = `<div class="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">`;

  files.forEach((file) => {
    const sizeKB = (file.fileSize / 1024).toFixed(1);
    const lines = file.lineCount || file.content.split(/\r\n|\r|\n/).length;
    let dateStr = 'Hoje';
    if (file.createdAt?.toDate) {
      dateStr = file.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } else if (file.createdAt?.seconds) {
      dateStr = new Date(file.createdAt.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    html += `
      <div class="bg-cosmic-950/90 border ${borderAccent} rounded-xl p-3 shadow-md transition-all group flex flex-col space-y-2">
        
        <!-- Header Identification -->
        <div class="flex items-start justify-between space-x-2">
          <div class="flex-1 min-w-0">
            <div class="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-bold ${tagBg} max-w-full">
              <span class="truncate" title="${file.identifier}">${file.identifier}</span>
              <button type="button" onclick="event.stopPropagation(); window.copyToClipboard('${file.identifier.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-white transition-colors" title="Copiar identificador">
                📋
              </button>
            </div>
            <p class="text-xs font-bold text-white font-rajdhani truncate mt-1">${file.fileName}</p>
          </div>

          <span class="text-[10px] font-mono text-slate-400 bg-cosmic-900 px-1.5 py-0.5 rounded border border-purple-500/20 whitespace-nowrap">
            ${sizeKB} KB
          </span>
        </div>

        <!-- Meta Info -->
        <div class="flex items-center justify-between text-[10px] text-slate-400 font-rajdhani pt-1 border-t border-purple-500/10">
          <span class="flex items-center space-x-1">
            <span>📄</span>
            <span>${lines} linhas</span>
            <span class="text-purple-500/50">•</span>
            <span>@${file.uploadedByName || 'Aventureiro'}</span>
          </span>
          <span>${dateStr}</span>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-3 gap-1.5 pt-1">
          <button 
            type="button" 
            onclick="window.viewUploadedFile('${file.id}')" 
            class="w-full py-1.5 px-2 rounded-lg bg-purple-900/40 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 font-rajdhani font-bold text-xs flex items-center justify-center space-x-1 transition-all"
            title="Visualizar texto integral"
          >
            <span>👁️</span>
            <span>Ler</span>
          </button>

          <button 
            type="button" 
            onclick="window.downloadUploadedFile('${file.id}')" 
            class="w-full py-1.5 px-2 rounded-lg bg-cosmic-900 hover:bg-cosmic-850 border border-purple-500/30 text-slate-200 font-rajdhani font-bold text-xs flex items-center justify-center space-x-1 transition-all"
            title="Baixar arquivo .txt"
          >
            <span>💾</span>
            <span>Baixar</span>
          </button>

          <button 
            type="button" 
            onclick="window.deleteUploadedFileUI('${file.id}')" 
            class="w-full py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-950 border border-red-500/30 text-red-300 font-rajdhani font-bold text-xs flex items-center justify-center space-x-1 transition-all"
            title="Excluir do Firebase"
          >
            <span>🗑️</span>
            <span>Excluir</span>
          </button>
        </div>

      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}


/* ==========================================================================
   NOVA CAMPANHA & GESTÃO DE REGRAS NO FIREBASE
   ========================================================================== */

export const SYSTEM_VERSION_DEFAULTS: Record<string, string> = {
  'Tormenta20': 'Edição Jogo do Ano v1.2',
  'D&D 5e': '5th Edition (SRD 5.1 / Livro do Jogador)',
  'D&D 5.5e (2024)': '2024 Rules Revision (5.5e)',
  'Call of Cthulhu 7e': '7ª Edição Oficial (Chaosium)',
  'Pathfinder 2e': 'Remaster Edition (v2.0)',
  'Ordem Paranormal RPG': 'Livro de Regras Oficial v1.1',
  'Cyberpunk RED': 'Core Rulebook v1.3',
  'Vampiro: A Máscara v5': '5ª Edição Oficial',
  '3D&T Alpha': 'Edição Revisada & Atualizada',
  'Fate Core': 'Edição de Regras Básicas 4.0',
  'Outro / Personalizado': 'v1.0'
};

window.allCampaigns = [];
window.activeCampaign = null;
window.selectedCampaignCharacterId = '';
window.activeCampaignFilter = 'all';
window.campaignSearchQuery = '';

// Subscribe in real-time to Firebase campaigns
subscribeToCampaigns((campaigns) => {
  window.allCampaigns = campaigns;
  console.log("🔥 Sincronizadas campanhas do Firebase Firestore:", campaigns.length);
  
  // Keep active campaign in sync
  if (window.activeCampaign && window.activeCampaign.id) {
    const updated = campaigns.find(c => c.id === window.activeCampaign?.id);
    if (updated) {
      window.activeCampaign = updated;
    }
  }

  updateCampaignsCountUI();

  // If Carregar Campanha modal is open, refresh its list
  const carregarModal = document.getElementById('carregar-campanha-modal');
  if (carregarModal && !carregarModal.classList.contains('hidden')) {
    window.renderCampaignsListUI();
  }

  // Also refresh Global Campaigns modal list if present
  window.renderGlobalCampaignsListUI();
});

function updateCampaignsCountUI() {
  const globalCountEl = document.getElementById('campanhas-globais-count');
  if (globalCountEl) {
    globalCountEl.innerText = `${window.allCampaigns.length} ${window.allCampaigns.length === 1 ? 'campanha ativa' : 'campanhas ativas'}`;
  }
  const badgeEl = document.getElementById('total-campaigns-badge');
  if (badgeEl) {
    badgeEl.innerText = `${window.allCampaigns.length} ${window.allCampaigns.length === 1 ? 'campanha salva' : 'campanhas salvas'}`;
  }
}

/**
 * Opens the Carregar Campanha Modal and populates the saved campaigns list
 */
window.openCarregarCampanhaModal = async function() {
  const modal = document.getElementById('carregar-campanha-modal');
  if (!modal) return;

  // Refresh characters from Firestore if user is authenticated
  if (currentGoogleUser) {
    try {
      const chars = await getUserCharacters(currentGoogleUser.uid);
      window.loadedCharacters = chars;
    } catch (e) {
      console.warn("Could not reload characters:", e);
    }
  }

  // Reset search input
  const searchInput = document.getElementById('search-campaigns-input') as HTMLInputElement | null;
  if (searchInput) searchInput.value = window.campaignSearchQuery || '';

  // Render the list of campaigns
  window.renderCampaignsListUI();

  modal.classList.remove('hidden');
  if ((window as any).lucide) (window as any).lucide.createIcons();
};

/**
 * Closes the Carregar Campanha Modal
 */
window.closeCarregarCampanhaModal = function() {
  const modal = document.getElementById('carregar-campanha-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

/**
 * Sets campaign filter category ('all' | 'mine' | system name)
 */
window.setCampaignFilter = function(filterType: string) {
  window.activeCampaignFilter = filterType;

  // Update UI active buttons
  const buttons = document.querySelectorAll('.campaign-filter-btn');
  buttons.forEach((btn) => {
    btn.classList.remove('active', 'bg-cyan-600', 'text-white', 'shadow-sm');
    btn.classList.add('bg-cyan-950/60', 'text-cyan-200');
  });

  const activeBtn = document.getElementById(`campaign-filter-${filterType}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-cyan-950/60', 'text-cyan-200');
    activeBtn.classList.add('active', 'bg-cyan-600', 'text-white', 'shadow-sm');
  }

  window.renderCampaignsListUI();
};

/**
 * Filters campaigns list by keyword query
 */
window.filterCampaignsList = function(query: string) {
  window.campaignSearchQuery = (query || '').toLowerCase().trim();
  window.renderCampaignsListUI();
};

/**
 * Renders the saved campaigns list into #campaigns-saved-list
 */
window.renderCampaignsListUI = function() {
  const container = document.getElementById('campaigns-saved-list');
  if (!container) return;

  const all = window.allCampaigns || [];
  const filter = window.activeCampaignFilter || 'all';
  const query = (window.campaignSearchQuery || '').toLowerCase();

  // Apply filters
  let filtered = all.filter((camp) => {
    // Category filter
    if (filter === 'mine') {
      const myUid = currentGoogleUser?.uid;
      if (myUid && camp.createdBy !== myUid) return false;
    } else if (filter !== 'all') {
      if (!doesCharacterMatchSystem(camp.system, filter)) return false;
    }

    // Search query filter
    if (query) {
      const matchName = camp.name.toLowerCase().includes(query);
      const matchSystem = camp.system.toLowerCase().includes(query);
      const matchChar = camp.characterName?.toLowerCase().includes(query) || false;
      const matchCreator = camp.createdByName?.toLowerCase().includes(query) || false;
      const matchVersion = camp.systemVersion?.toLowerCase().includes(query) || false;
      const matchSysFile = camp.systemFileName?.toLowerCase().includes(query) || false;
      const matchWorldFile = camp.worldFileName?.toLowerCase().includes(query) || false;
      const matchLoreFile = camp.loreFileName?.toLowerCase().includes(query) || false;

      if (!matchName && !matchSystem && !matchChar && !matchCreator && !matchVersion && !matchSysFile && !matchWorldFile && !matchLoreFile) {
        return false;
      }
    }

    return true;
  });

  // Update badge count
  const badgeEl = document.getElementById('total-campaigns-badge');
  if (badgeEl) {
    badgeEl.innerText = `${filtered.length} ${filtered.length === 1 ? 'campanha' : 'campanhas'}${query || filter !== 'all' ? ` (de ${all.length})` : ''}`;
  }

  // If no campaigns
  if (filtered.length === 0) {
    if (all.length === 0) {
      container.innerHTML = `
        <div class="h-80 flex flex-col items-center justify-center text-center p-6 border border-dashed border-cyan-500/30 rounded-2xl bg-cosmic-950/60 text-slate-300">
          <div class="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-cyan-950/50">
            📂
          </div>
          <h4 class="font-orbitron font-bold text-base text-white">Nenhuma campanha criada ainda</h4>
          <p class="text-xs text-slate-400 font-rajdhani max-w-md mt-1 mb-5 leading-relaxed">
            Você ainda não possui campanhas salvas no Firebase Firestore. Crie sua primeira campanha vinculando um personagem e sistema de regras para começar!
          </p>
          <button 
            type="button"
            onclick="window.closeCarregarCampanhaModal(); window.openNovaCampanhaModal()" 
            class="btn-purple-neon px-6 py-2.5 rounded-xl text-xs font-bold font-orbitron text-white flex items-center space-x-2 shadow-neon-purple hover:scale-105 transition-transform"
          >
            <span>✨</span>
            <span>CRIAR PRIMEIRA CAMPANHA</span>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-cyan-500/20 rounded-2xl bg-cosmic-950/40 text-slate-400">
          <span class="text-3xl mb-2">🔍</span>
          <h4 class="font-orbitron font-bold text-sm text-slate-200">Nenhuma campanha encontrada</h4>
          <p class="text-xs text-slate-400 font-rajdhani mt-1 max-w-sm">
            Nenhum resultado corresponde aos filtros selecionados. Tente buscar por outro termo ou limpar os filtros.
          </p>
          <button 
            type="button"
            onclick="window.setCampaignFilter('all'); const input = document.getElementById('search-campaigns-input'); if (input) input.value = ''; window.filterCampaignsList('');" 
            class="mt-3 text-xs text-cyan-300 hover:text-white bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            Limpar Filtros de Busca
          </button>
        </div>
      `;
    }
    return;
  }

  // Render grid of campaign cards
  let html = `<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">`;

  filtered.forEach((camp) => {
    const isCurrentActive = window.activeCampaign?.id === camp.id;
    const initial = camp.characterName ? camp.characterName.charAt(0).toUpperCase() : (camp.name ? camp.name.charAt(0).toUpperCase() : 'C');
    
    let dateFormatted = 'Hoje';
    if (camp.createdAt?.toDate) {
      dateFormatted = camp.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else if (camp.createdAt?.seconds) {
      dateFormatted = new Date(camp.createdAt.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Character summary
    const charName = camp.characterName || 'Personagem Vinculado';
    const charClass = camp.characterData?.class1 || 'Aventureiro';
    const charLevel = camp.characterData?.totalLevel || 1;
    const charRace = camp.characterData?.race || '';

    html += `
      <div class="bg-gradient-to-b from-[#0b1022] to-[#070b18] border ${
        isCurrentActive ? 'border-cyan-400 shadow-neon-cyan ring-1 ring-cyan-400/40' : 'border-purple-500/25 hover:border-cyan-500/50'
      } rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-200 flex flex-col justify-between group">
        
        <!-- Header -->
        <div class="space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                <span class="bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-orbitron px-2 py-0.5 rounded-md inline-flex items-center space-x-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                  <span>ATIVA</span>
                </span>

                <span class="bg-purple-950/80 text-purple-200 border border-purple-500/30 text-[10px] font-bold font-rajdhani px-2 py-0.5 rounded-md">
                  ⚡ ${camp.system} ${camp.systemVersion ? `(${camp.systemVersion})` : ''}
                </span>

                ${isCurrentActive ? `
                  <span class="bg-cyan-950 text-cyan-300 border border-cyan-400/60 text-[10px] font-bold font-orbitron px-2 py-0.5 rounded-md animate-pulse">
                    ★ EM SESSÃO
                  </span>
                ` : ''}
              </div>

              <h4 class="font-orbitron font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-200 transition-colors truncate" title="${camp.name}">
                ${camp.name}
              </h4>
            </div>

            <div class="text-right flex-shrink-0">
              <span class="text-[10px] text-slate-400 font-rajdhani block">
                @${camp.createdByName || 'Aventureiro'}
              </span>
              <span class="text-[9px] text-slate-500 font-mono block">
                ${dateFormatted}
              </span>
            </div>
          </div>

          <!-- Linked Character Box -->
          <div class="bg-cosmic-950/90 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-purple-950/90 border border-purple-500/50 flex items-center justify-center font-orbitron font-bold text-sm text-purple-200 flex-shrink-0 shadow-md">
                ${initial}
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold text-purple-300 uppercase tracking-wider block font-rajdhani">Personagem Vinculado</span>
                <h5 class="font-rajdhani font-bold text-sm text-white truncate group-hover:text-purple-100">
                  ${charName}
                </h5>
                <p class="text-[11px] text-slate-400 font-rajdhani truncate">
                  ${charClass} • Nível ${charLevel} ${charRace ? `• ${charRace}` : ''}
                </p>
              </div>
            </div>

            <div class="flex-shrink-0 text-right">
              <span class="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <span>✓</span>
                <span>${camp.characterSystem || camp.system}</span>
              </span>
            </div>
          </div>

          <!-- Attached Files & Lore Badges -->
          <div class="space-y-1.5 pt-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-rajdhani">Material e Ambientação:</span>
            <div class="flex flex-wrap gap-1.5 text-[11px] font-rajdhani">
              ${camp.systemFileName || camp.systemFileIdentifier ? `
                <span class="inline-flex items-center space-x-1 bg-purple-950/50 text-purple-200 border border-purple-500/30 px-2 py-0.5 rounded-md max-w-full truncate" title="${camp.systemFileIdentifier || camp.systemFileName}">
                  <span>⚡</span>
                  <span class="truncate">${camp.systemFileIdentifier || camp.systemFileName}</span>
                </span>
              ` : `
                <span class="inline-flex items-center space-x-1 bg-cosmic-950 text-slate-400 border border-purple-500/10 px-2 py-0.5 rounded-md">
                  <span>⚡</span>
                  <span>Regras Nativas</span>
                </span>
              `}

              ${camp.worldFileName || camp.worldFileIdentifier ? `
                <span class="inline-flex items-center space-x-1 bg-emerald-950/50 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded-md max-w-full truncate" title="${camp.worldFileIdentifier || camp.worldFileName}">
                  <span>🌍</span>
                  <span class="truncate">${camp.worldFileIdentifier || camp.worldFileName}</span>
                </span>
              ` : ''}

              ${camp.loreFileName || camp.loreFileIdentifier ? `
                <span class="inline-flex items-center space-x-1 bg-amber-950/50 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-md max-w-full truncate" title="${camp.loreFileIdentifier || camp.loreFileName}">
                  <span>📜</span>
                  <span class="truncate">${camp.loreFileIdentifier || camp.loreFileName}</span>
                </span>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 mt-3 border-t border-purple-500/20 flex items-center justify-between gap-2">
          <button 
            type="button" 
            onclick="window.deleteCampaignUI('${camp.id}', '${(camp.name || '').replace(/'/g, "\\'")}')" 
            class="px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-950 border border-red-500/30 hover:border-red-500 text-red-300 text-xs font-rajdhani font-bold flex items-center space-x-1 transition-all"
            title="Excluir campanha do Firestore"
          >
            <span>🗑️</span>
            <span class="hidden sm:inline">Excluir</span>
          </button>

          <button 
            type="button" 
            onclick="window.loadAndContinueCampaign('${camp.id}')" 
            class="flex-1 sm:flex-initial btn-cyan-neon px-5 py-2 rounded-xl text-xs font-bold font-orbitron text-white flex items-center justify-center space-x-2 shadow-neon-cyan hover:scale-[1.02] transition-all"
          >
            <span>🚀</span>
            <span>CONTINUAR CAMPANHA</span>
          </button>
        </div>

      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  if ((window as any).lucide) (window as any).lucide.createIcons();
};

/**
 * Loads a campaign and transitions directly to the Game Screen view
 */
window.loadAndContinueCampaign = async function(campaignId: string) {
  const toastFn = (window as any).showToast;
  const targetCampaign = (window.allCampaigns || []).find(c => c.id === campaignId);

  if (!targetCampaign) {
    if (toastFn) toastFn("⚠️ Campanha não encontrada no Firebase!");
    return;
  }

  // Set as active campaign
  window.activeCampaign = targetCampaign;

  // Close modal
  window.closeCarregarCampanhaModal();
  const globaisModal = document.getElementById('campanhas-globais-modal');
  if (globaisModal) globaisModal.classList.add('hidden');

  if (toastFn) {
    toastFn(`🚀 Carregando campanha "${targetCampaign.name}"...`);
  }

  // Transition to game screen
  setTimeout(() => {
    if (window.enterGameSession) {
      window.enterGameSession(campaignId);
    }
  }, 200);
};

/**
 * Deletes a campaign from Firestore with user confirmation
 */
window.deleteCampaignUI = async function(campaignId: string, campaignName: string) {
  const toastFn = (window as any).showToast;
  const confirmed = window.confirm(`Tem certeza que deseja excluir a campanha "${campaignName}" do Firebase Firestore? Esta ação não pode ser desfeita.`);
  
  if (!confirmed) return;

  try {
    await deleteCampaign(campaignId);
    if (toastFn) {
      toastFn(`🗑️ Campanha "${campaignName}" excluída com sucesso.`);
    }
  } catch (error: any) {
    console.error("Erro ao excluir campanha:", error);
    if (toastFn) {
      toastFn(`❌ Erro ao excluir campanha: ${error?.message || 'Falha no Firestore'}`);
    }
  }
};

/**
 * Renders the global campaigns list in #campanhas-globais-modal
 */
window.renderGlobalCampaignsListUI = function() {
  const container = document.getElementById('global-campaigns-list');
  if (!container) return;

  const campaigns = window.allCampaigns || [];

  if (campaigns.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-xs font-rajdhani space-y-2">
        <p>Nenhuma campanha global ativa no momento.</p>
        <button onclick="closeModal('campanhas-globais-modal'); window.openNovaCampanhaModal();" class="text-emerald-400 hover:underline font-bold">
          + Iniciar Primeira Campanha Global
        </button>
      </div>
    `;
    return;
  }

  let html = '';
  campaigns.forEach((camp) => {
    html += `
      <div class="bg-cosmic-950 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between group hover:border-emerald-400 transition-all">
        <div class="min-w-0 flex-1 mr-3">
          <div class="flex items-center space-x-2">
            <h4 class="font-rajdhani font-bold text-base text-white truncate">${camp.name}</h4>
            <span class="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
              ${camp.system}
            </span>
          </div>
          <p class="text-xs text-slate-400 truncate mt-0.5">
            Personagem: <strong class="text-emerald-300">${camp.characterName || 'N/A'}</strong> &bull; Criador: @${camp.createdByName || 'Aventureiro'}
          </p>
        </div>
        <button onclick="window.loadAndContinueCampaign('${camp.id}')" class="text-xs btn-green-neon px-3.5 py-1.5 rounded-lg text-emerald-100 font-bold shrink-0 shadow-sm">
          Entrar
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
};

/**
 * Normalizes system names to match characters and campaigns reliably
 */
function normalizeSystemName(sys: string | undefined): string {
  if (!sys) return '';
  return sys
    .toLowerCase()
    .replace(/\s*\(nativo\)\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a character's system matches the selected campaign system
 */
function doesCharacterMatchSystem(charSystem: string | undefined, campaignSystem: string | undefined): boolean {
  if (!charSystem || !campaignSystem) return false;
  const c = normalizeSystemName(charSystem);
  const s = normalizeSystemName(campaignSystem);
  if (c === s) return true;
  if (c.includes(s) || s.includes(c)) return true;
  // Common aliases
  if ((s.includes('tormenta') || s.includes('t20')) && (c.includes('tormenta') || c.includes('t20'))) return true;
  if ((s.includes('d&d') || s.includes('dnd')) && (c.includes('d&d') || c.includes('dnd'))) {
    if (s.includes('2024') || s.includes('5.5')) {
      return c.includes('2024') || c.includes('5.5');
    }
    return !c.includes('2024') && !c.includes('5.5');
  }
  if (s.includes('cthulhu') && c.includes('cthulhu')) return true;
  if (s.includes('pathfinder') && c.includes('pathfinder')) return true;
  if (s.includes('ordem') && c.includes('ordem')) return true;
  if (s.includes('cyberpunk') && c.includes('cyberpunk')) return true;
  if (s.includes('vampiro') && c.includes('vampiro')) return true;
  return false;
}

/**
 * Opens the Nova Campanha modal with updated files, characters, and system settings
 */
window.openNovaCampanhaModal = async function() {
  const modal = document.getElementById('nova-campanha-modal');
  if (!modal) return;

  // Refresh characters from Firestore if user is authenticated
  if (currentGoogleUser) {
    try {
      const chars = await getUserCharacters(currentGoogleUser.uid);
      window.loadedCharacters = chars;
    } catch (e) {
      console.warn("Could not reload characters for campaign modal:", e);
    }
  }

  // Populate file selects
  window.populateNovaCampanhaSelects();

  // Set default system and version if empty
  const systemSelect = document.getElementById('campaign-system') as HTMLSelectElement | null;
  const versionInput = document.getElementById('campaign-system-version') as HTMLInputElement | null;
  
  if (systemSelect && !systemSelect.value) {
    systemSelect.value = 'Tormenta20';
  }
  if (versionInput && (!versionInput.value || versionInput.value.trim() === '')) {
    const currentSys = systemSelect ? systemSelect.value : 'Tormenta20';
    versionInput.value = SYSTEM_VERSION_DEFAULTS[currentSys] || 'v1.0';
  }

  // Render character selector for currently selected system
  window.renderCampaignCharacterSelector();

  modal.classList.remove('hidden');
  if ((window as any).lucide) (window as any).lucide.createIcons();
};

window.closeNovaCampanhaModal = function() {
  const modal = document.getElementById('nova-campanha-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

/**
 * Populates file selects for Sistema, Mundo, and Contos&Personagens
 */
window.populateNovaCampanhaSelects = function() {
  const allFiles = window.allUploadedFiles || [];

  const sistemasFiles = allFiles.filter(f => f.category === 'Sistemas');
  const mundosFiles = allFiles.filter(f => f.category === 'Mundos');
  const contosFiles = allFiles.filter(f => f.category === 'Contos&Personagens');

  // 1. Sistema File Select
  const sysSelect = document.getElementById('campaign-system-file') as HTMLSelectElement | null;
  if (sysSelect) {
    let opts = `<option value="">Nenhum arquivo de sistema adicional (Regras Padrão)</option>`;
    sistemasFiles.forEach(f => {
      opts += `<option value="${f.id}">⚡ ${f.displayIdentifier || f.identifier} (${(f.fileSize / 1024).toFixed(1)} KB • ${f.lineCount} lin)</option>`;
    });
    sysSelect.innerHTML = opts;
  }

  // 2. Mundo File Select
  const worldSelect = document.getElementById('campaign-world-file') as HTMLSelectElement | null;
  if (worldSelect) {
    let opts = `<option value="">Nenhum arquivo de mundo (Ambientação Padrão)</option>`;
    mundosFiles.forEach(f => {
      opts += `<option value="${f.id}">🌍 ${f.displayIdentifier || f.identifier} (${(f.fileSize / 1024).toFixed(1)} KB • ${f.lineCount} lin)</option>`;
    });
    worldSelect.innerHTML = opts;
  }

  // 3. Contos&Personagens File Select
  const loreSelect = document.getElementById('campaign-lore-file') as HTMLSelectElement | null;
  if (loreSelect) {
    let opts = `<option value="">Nenhum arquivo de contos/NPCs (Livre)</option>`;
    contosFiles.forEach(f => {
      opts += `<option value="${f.id}">📜 ${f.displayIdentifier || f.identifier} (${(f.fileSize / 1024).toFixed(1)} KB • ${f.lineCount} lin)</option>`;
    });
    loreSelect.innerHTML = opts;
  }
};

/**
 * Handles system dropdown changes in Nova Campanha form
 */
window.onCampaignSystemChange = function() {
  const systemSelect = document.getElementById('campaign-system') as HTMLSelectElement | null;
  const versionInput = document.getElementById('campaign-system-version') as HTMLInputElement | null;
  
  if (!systemSelect) return;
  const selectedSys = systemSelect.value;

  // Auto-fill suggested version for this system
  if (versionInput) {
    versionInput.value = SYSTEM_VERSION_DEFAULTS[selectedSys] || 'v1.0';
  }

  // Re-render character selector matching this new system
  window.renderCampaignCharacterSelector();
};

/**
 * Renders the character selection list, filtered strictly by the chosen campaign system
 */
window.renderCampaignCharacterSelector = function() {
  const container = document.getElementById('campaign-character-list');
  const systemSelect = document.getElementById('campaign-system') as HTMLSelectElement | null;
  if (!container || !systemSelect) return;

  const currentSys = systemSelect.value;
  const allCharacters = window.loadedCharacters || [];

  // Filter characters by the selected system
  const matchingCharacters = allCharacters.filter(c => doesCharacterMatchSystem(c.system, currentSys));

  if (matchingCharacters.length === 0) {
    window.selectedCampaignCharacterId = '';
    container.innerHTML = `
      <div class="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-start space-x-3">
          <span class="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h5 class="font-bold text-amber-100 font-rajdhani text-sm">Nenhum personagem compatível encontrado</h5>
            <p class="text-amber-300/80 font-rajdhani mt-0.5">
              Para jogar neste sistema (<strong class="text-amber-100">${currentSys}</strong>), você precisa vincular um personagem criado especificamente para ele.
            </p>
          </div>
        </div>
        <button 
          type="button" 
          onclick="window.createNewCharacterForSystem('${currentSys.replace(/'/g, "\\'")}')" 
          class="btn-purple-neon px-3.5 py-2 rounded-lg text-xs font-bold text-white whitespace-nowrap flex items-center space-x-1.5 shadow-md flex-shrink-0"
        >
          <span>➕</span>
          <span>Criar Ficha em ${currentSys}</span>
        </button>
      </div>
    `;
    return;
  }

  // If previous selection is not among matching characters, select first match
  const isPreviousValid = matchingCharacters.some(c => c.id === window.selectedCampaignCharacterId);
  if (!isPreviousValid) {
    window.selectedCampaignCharacterId = matchingCharacters[0].id || '';
  }

  // Render selection cards
  let html = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">`;
  
  matchingCharacters.forEach(char => {
    const isSelected = char.id === window.selectedCampaignCharacterId;
    const initial = char.name ? char.name.charAt(0).toUpperCase() : '?';
    const level = char.totalLevel || 1;
    let charClass = 'Aventureiro';
    if (char.classes && Array.isArray(char.classes) && char.classes.length > 0) {
      const valids = char.classes.filter(c => c.name && c.name.trim());
      if (valids.length > 0) charClass = valids.map(c => `${c.name} ${c.level || 1}`).join('/');
    } else if (char.class1) {
      charClass = char.class2 ? `${char.class1}/${char.class2}` : char.class1;
    }

    html += `
      <div 
        onclick="window.selectCampaignCharacter('${char.id}')"
        class="cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between group ${
          isSelected 
            ? 'bg-purple-950/70 border-purple-400 shadow-neon-purple ring-1 ring-purple-400/50' 
            : 'bg-cosmic-950/70 border-purple-500/20 hover:border-purple-500/50 hover:bg-cosmic-900/60'
        }"
      >
        <div class="flex items-center space-x-3 min-w-0">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center font-orbitron font-bold text-sm ${
            isSelected ? 'bg-purple-800 text-white' : 'bg-cosmic-900 text-purple-300 group-hover:bg-purple-900/50'
          } border border-purple-500/40 flex-shrink-0">
            ${initial}
          </div>
          <div class="min-w-0">
            <h5 class="font-rajdhani font-bold text-sm text-white truncate group-hover:text-purple-200">
              ${char.name}
            </h5>
            <p class="text-[11px] text-purple-300/80 font-rajdhani truncate">
              ${charClass} • Nv. ${level} • <span class="text-emerald-300 font-semibold">${char.system}</span>
            </p>
          </div>
        </div>

        <div class="flex-shrink-0 ml-2">
          ${isSelected 
            ? `<span class="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold shadow-md">✓</span>` 
            : `<span class="w-5 h-5 rounded-full border border-slate-600 group-hover:border-purple-400 flex items-center justify-center text-[10px] text-slate-500 group-hover:text-purple-300">○</span>`
          }
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
};

/**
 * Selects a character for the campaign
 */
window.selectCampaignCharacter = function(charId: string) {
  window.selectedCampaignCharacterId = charId;
  window.renderCampaignCharacterSelector();
};

/**
 * Direct shortcut to create a new character sheet with the chosen system pre-selected
 */
window.createNewCharacterForSystem = function(systemName: string) {
  window.closeNovaCampanhaModal();
  
  // Open character sheet
  const sheetModal = document.getElementById('novo-personagem-modal');
  if (sheetModal) {
    sheetModal.classList.remove('hidden');
    const charSystemSelect = document.getElementById('char-system') as HTMLSelectElement | null;
    if (charSystemSelect) {
      // Find matching option or set value
      let found = false;
      for (let i = 0; i < charSystemSelect.options.length; i++) {
        if (doesCharacterMatchSystem(charSystemSelect.options[i].value, systemName)) {
          charSystemSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        // Add new option and select it
        const newOpt = document.createElement('option');
        newOpt.value = systemName;
        newOpt.innerText = systemName;
        charSystemSelect.appendChild(newOpt);
        charSystemSelect.value = systemName;
      }
    }
  }

  const toastFn = (window as any).showToast;
  if (toastFn) {
    toastFn(`Ficha aberta para o sistema "${systemName}". Preencha e salve para vincular à campanha.`);
  }
};

/**
 * Submits the Nova Campanha form, saving to Firebase Firestore
 */
window.handleNovaCampanhaSubmit = async function(e: Event) {
  e.preventDefault();

  const nameInput = document.getElementById('campaign-name') as HTMLInputElement | null;
  const systemSelect = document.getElementById('campaign-system') as HTMLSelectElement | null;
  const versionInput = document.getElementById('campaign-system-version') as HTMLInputElement | null;
  const sysFileInput = document.getElementById('campaign-system-file') as HTMLSelectElement | null;
  const worldFileInput = document.getElementById('campaign-world-file') as HTMLSelectElement | null;
  const loreFileInput = document.getElementById('campaign-lore-file') as HTMLSelectElement | null;
  const submitBtn = document.getElementById('btn-submit-campaign') as HTMLButtonElement | null;

  const campaignName = nameInput ? nameInput.value.trim() : '';
  const system = systemSelect ? systemSelect.value.trim() : '';
  const systemVersion = versionInput ? versionInput.value.trim() : 'v1.0';
  const characterId = window.selectedCampaignCharacterId;

  const toastFn = (window as any).showToast;

  if (!campaignName) {
    if (toastFn) toastFn("⚠️ Informe o Nome da Campanha!");
    if (nameInput) nameInput.focus();
    return;
  }

  if (!system) {
    if (toastFn) toastFn("⚠️ Selecione o Sistema Utilizado!");
    return;
  }

  if (!systemVersion) {
    if (toastFn) toastFn("⚠️ Informe a Versão das Regras do Sistema!");
    return;
  }

  if (!characterId) {
    if (toastFn) toastFn(`⚠️ É OBRIGATÓRIO vincular um Personagem compatível com o sistema "${system}"!`);
    return;
  }

  // Find linked character
  const linkedChar = (window.loadedCharacters || []).find(c => c.id === characterId);
  if (!linkedChar) {
    if (toastFn) toastFn("⚠️ Personagem selecionado não foi encontrado!");
    return;
  }

  // Verify system compatibility
  if (!doesCharacterMatchSystem(linkedChar.system, system)) {
    if (toastFn) toastFn(`⚠️ O personagem "${linkedChar.name}" pertence ao sistema "${linkedChar.system}", que é incompatível com "${system}"!`);
    return;
  }

  // Get attached files metadata
  const allFiles = window.allUploadedFiles || [];
  
  let systemFileId = '';
  let systemFileName = '';
  let systemFileIdentifier = '';
  if (sysFileInput && sysFileInput.value) {
    const sFile = allFiles.find(f => f.id === sysFileInput.value);
    if (sFile) {
      systemFileId = sFile.id;
      systemFileName = sFile.fileName;
      systemFileIdentifier = sFile.identifier;
    }
  }

  let worldFileId = '';
  let worldFileName = '';
  let worldFileIdentifier = '';
  if (worldFileInput && worldFileInput.value) {
    const wFile = allFiles.find(f => f.id === worldFileInput.value);
    if (wFile) {
      worldFileId = wFile.id;
      worldFileName = wFile.fileName;
      worldFileIdentifier = wFile.identifier;
    }
  }

  let loreFileId = '';
  let loreFileName = '';
  let loreFileIdentifier = '';
  if (loreFileInput && loreFileInput.value) {
    const lFile = allFiles.find(f => f.id === loreFileInput.value);
    if (lFile) {
      loreFileId = lFile.id;
      loreFileName = lFile.fileName;
      loreFileIdentifier = lFile.identifier;
    }
  }

  // Button loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
      <span>Criando no Firebase...</span>
    `;
  }

  try {
    const creatorUid = currentGoogleUser?.uid || 'anonymous_player';
    const creatorName = currentUserProfile?.username || currentGoogleUser?.displayName || 'Aventureiro';

    const campaignPayload: Omit<CampaignData, 'id'> = {
      name: campaignName,
      system: system,
      systemVersion: systemVersion,
      systemFileId: systemFileId || '',
      systemFileName: systemFileName || '',
      systemFileIdentifier: systemFileIdentifier || '',
      worldFileId: worldFileId || '',
      worldFileName: worldFileName || '',
      worldFileIdentifier: worldFileIdentifier || '',
      loreFileId: loreFileId || '',
      loreFileName: loreFileName || '',
      loreFileIdentifier: loreFileIdentifier || '',
      characterId: linkedChar.id,
      characterName: linkedChar.name,
      characterSystem: linkedChar.system,
      characterData: {
        id: linkedChar.id,
        name: linkedChar.name,
        system: linkedChar.system,
        totalLevel: linkedChar.totalLevel || 1,
        class1: linkedChar.class1 || '',
        race: linkedChar.race || '',
        origin: linkedChar.origin || ''
      },
      createdBy: creatorUid,
      createdByName: creatorName,
      status: 'active',
      narratorRulesMemory: []
    };

    const campaignId = await createCampaign(campaignPayload);
    
    // Set as active campaign
    window.activeCampaign = {
      id: campaignId,
      ...campaignPayload
    };

    if (toastFn) {
      toastFn(`🚀 Campanha "${campaignName}" criada com sucesso no Firebase Firestore!`);
    }

    // Reset and close modal
    if (nameInput) nameInput.value = '';
    window.closeNovaCampanhaModal();

    // Directly enter the game session
    if (window.enterGameSession) {
      setTimeout(() => {
        window.enterGameSession(campaignId);
      }, 300);
    }

  } catch (error: any) {
    console.error("Erro ao criar campanha no Firebase:", error);
    if (toastFn) {
      toastFn(`❌ Erro ao salvar campanha: ${error?.message || 'Falha na conexão com Firebase'}`);
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>🚀 Iniciar Campanha</span>
      `;
    }
  }
};

/* =============================================================================
   GAME SCREEN / SESSÃO DE JOGO ENGINE & SIDEBARS
   ============================================================================= */

// State for active game session
let activeGameCampaign: CampaignData | null = null;
let activeGameCharacter: any = null;
let activeSessionMessagesUnsub: (() => void) | null = null;
let currentGameSheetTab: string = 'cabecalho';
let currentActionMode: 'speech' | 'action' | 'thought' | 'narrator' = 'speech';
let selectedDiceModalDie: string = 'd20';
let sessionNotesAutoSaveTimer: any = null;

/**
 * Enters the Game Screen view for a specific campaign or the current active campaign
 */
window.enterGameSession = async function(campaignId?: string) {
  const toastFn = (window as any).showToast;
  
  // 1. Locate Campaign Data
  let campaign: CampaignData | null = null;
  const allCampaigns: CampaignData[] = (window as any).allCampaigns || [];

  if (campaignId) {
    campaign = allCampaigns.find(c => c.id === campaignId) || null;
    if (!campaign) {
      try {
        campaign = await getCampaignById(campaignId);
      } catch (err) {
        console.warn("Could not fetch campaign by id, using active campaign:", err);
      }
    }
  }

  if (!campaign && window.activeCampaign) {
    campaign = window.activeCampaign;
  }

  if (!campaign && allCampaigns.length > 0) {
    campaign = allCampaigns[0];
  }

  // Fallback default campaign if none exists
  if (!campaign) {
    campaign = {
      id: 'default-session',
      name: 'As Crônicas de Arton',
      system: 'Tormenta20',
      systemVersion: 'Jogo do Ano v1.2',
      characterId: 'char-default',
      characterName: 'Aventureiro Destemido',
      characterSystem: 'Tormenta20',
      characterData: {
        id: 'char-default',
        name: 'Sir Lorian de Valkaria',
        system: 'Tormenta20',
        totalLevel: 3,
        class1: 'Guerreiro',
        race: 'Humano',
        origin: 'Guarda'
      },
      createdBy: 'system',
      createdByName: 'Mestre da Masmorra',
      status: 'active'
    };
  }

  activeGameCampaign = campaign;
  window.activeGameCampaign = campaign;

  // 2. Locate Character Data
  let char: any = null;
  const loadedChars: any[] = (window as any).loadedCharacters || (window as any).cachedCharacters || [];
  
  if (campaign.characterId) {
    char = loadedChars.find(c => c.id === campaign.characterId);
  }

  if (!char && campaign.characterData) {
    char = campaign.characterData;
  }

  if (!char && loadedChars.length > 0) {
    char = loadedChars[0];
  }

  // If no character at all, create a default rich character for the session
  if (!char) {
    char = {
      id: 'char-demo',
      name: 'Sir Lorian de Valkaria',
      player: (window.currentUserProfile?.username || 'testador'),
      race: 'Humano',
      origin: 'Guarda Urbano',
      divinity: 'Valkaria',
      alignment: 'Leal e Bom',
      size: 'Médio',
      speed: '9m',
      age: 24,
      totalLevel: 3,
      classes: [{ name: 'Guerreiro', level: 3 }],
      system: campaign.system || 'Tormenta20',
      pvAtual: 28,
      pvMax: 28,
      pmAtual: 9,
      pmMax: 9,
      defense: 18,
      attributes: [
        { id: 'FOR', name: 'Força', value: 3, mod: 3 },
        { id: 'DES', name: 'Destreza', value: 2, mod: 2 },
        { id: 'CON', name: 'Constituição', value: 2, mod: 2 },
        { id: 'INT', name: 'Inteligência', value: 0, mod: 0 },
        { id: 'SAB', name: 'Sabedoria', value: 1, mod: 1 },
        { id: 'CAR', name: 'Carisma', value: 0, mod: 0 }
      ],
      attacks: [
        { weapon: 'Espada Longa Magistral', atkBonus: 6, damage: '1d8+4', crit: '19-20/x2', type: 'Corte', range: 'Corpo a corpo' },
        { weapon: 'Arco Curto Reforçado', atkBonus: 5, damage: '1d6+2', crit: 'x3', type: 'Perfuração', range: 'Médio (30m)' },
        { weapon: 'Adaga Oculta', atkBonus: 5, damage: '1d4+3', crit: '19-20/x2', type: 'Perfuração', range: 'Curto (9m)' }
      ],
      armors: [
        { name: 'Brunea de Aço', defense: 5, penalty: 2, type: 'Pesada', equipped: true },
        { name: 'Escudo Leve Reforçado', defense: 1, penalty: 1, type: 'Escudo', equipped: true }
      ],
      inventory: [
        { name: 'Poção de Cura Menor (1d8+2 PV)', quantity: 3, weight: 0.5, category: 'Consumível', notes: 'Restaura 1d8+2 pontos de vida' },
        { name: 'Elixir de Mana Concentrado (3 PM)', quantity: 2, weight: 0.5, category: 'Consumível', notes: 'Recupera 3 pontos de mana' },
        { name: 'Bálsamo Restaurador', quantity: 2, weight: 0.5, category: 'Consumível', notes: 'Cura ferimentos e estanca sangramentos' },
        { name: 'Rações de Viagem (7 dias)', quantity: 7, weight: 3.5, category: 'Consumível', notes: 'Alimento nutritivo' },
        { name: 'Tochas de Piche', quantity: 4, weight: 2.0, category: 'Consumível', notes: 'Ilumina 6m por 1 hora' },
        { name: 'Corda de Seda (15m)', quantity: 1, weight: 1.5, category: 'Geral', notes: 'Resistente e leve' },
        { name: 'Mochila de Aventureiro', quantity: 1, weight: 1.0, category: 'Geral', notes: 'Compartimentos reforçados' }
      ],
      tibares: 145,
      background: 'Nascido nos bairros periféricos de Valkaria, Lorian serviu na Guarda Urbana por 5 anos antes de atender ao chamado dos deuses para defender o continente contra as ameaças de além-mar.',
      appearance: 'Alto, cabelos castanhos curtos, olhos castanhos atentos, cicatriz na bochecha esquerda proveniente de um confronto com bandidos nos esgotos.'
    };
  }

  // Ensure PV/PM defaults exist
  if (char.pvAtual === undefined) char.pvAtual = 24;
  if (char.pvMax === undefined) char.pvMax = 24;
  if (char.pmAtual === undefined) char.pmAtual = 8;
  if (char.pmMax === undefined) char.pmMax = 8;
  if (!char.inventory || !Array.isArray(char.inventory)) {
    char.inventory = [
      { name: 'Poção de Cura Menor', quantity: 3, weight: 0.5, category: 'Consumível', notes: 'Restaura PV' },
      { name: 'Elixir de Mana', quantity: 2, weight: 0.5, category: 'Consumível', notes: 'Restaura PM' },
      { name: 'Ração de Viagem', quantity: 5, weight: 2.5, category: 'Consumível', notes: '1 dia de alimento' }
    ];
  }

  activeGameCharacter = char;
  window.activeGameCharacter = char;

  // 3. Switch Views (Hub -> Game Screen)
  const mainHub = document.getElementById('main-hub-view');
  const mainFooter = document.getElementById('main-footer');
  const gameScreen = document.getElementById('game-screen-view');

  if (mainHub) mainHub.classList.add('hidden');
  if (mainFooter) mainFooter.classList.add('hidden');
  if (gameScreen) gameScreen.classList.remove('hidden');

  // 4. Update Header Badges
  const titleEl = document.getElementById('game-session-title');
  const sysEl = document.getElementById('game-session-system');
  const charBadge = document.getElementById('game-char-name-badge');

  if (titleEl) titleEl.innerText = campaign.name || 'Sessão Ativa';
  if (sysEl) sysEl.innerText = `${campaign.system || 'Tormenta20'} ${campaign.systemVersion ? `(${campaign.systemVersion})` : ''}`;
  if (charBadge) charBadge.innerText = char.name || 'Personagem';

  // 5. Render Left Character Sheet Tab (Default to 'cabecalho')
  window.setGameSheetTab('cabecalho');

  // 6. Update Right HUD (PV/PM, Weapons, Armor, Consumables)
  window.updateGameHUD();
  window.renderEquippedWeapons();
  window.renderEquippedArmor();
  window.renderConsumableItems();

  // 7. Subscribe to Real-time Session Messages
  if (activeSessionMessagesUnsub) {
    activeSessionMessagesUnsub();
    activeSessionMessagesUnsub = null;
  }

  const campaignFeedId = campaign.id || 'default-session';
  activeSessionMessagesUnsub = subscribeToSessionMessages(campaignFeedId, (messages: SessionMessage[]) => {
    window.renderSessionMessages(messages);
  });

  // 8. Load Local Session Notes
  const notesTextarea = document.getElementById('session-notes-textarea') as HTMLTextAreaElement | null;
  if (notesTextarea) {
    const savedNotes = localStorage.getItem(`session_notes_${campaignFeedId}`) || '';
    notesTextarea.value = savedNotes;
  }

  // 9. Trigger Icons Update
  if ((window as any).lucide) {
    (window as any).lucide.createIcons();
  }

  if (toastFn) {
    toastFn(`🎲 Entrou na Sessão: "${campaign.name}"!`);
  }
};

/**
 * Exits the Game Screen view and returns to the main hub
 */
window.exitGameSession = function() {
  if (activeSessionMessagesUnsub) {
    activeSessionMessagesUnsub();
    activeSessionMessagesUnsub = null;
  }

  const mainHub = document.getElementById('main-hub-view');
  const mainFooter = document.getElementById('main-footer');
  const gameScreen = document.getElementById('game-screen-view');

  if (gameScreen) gameScreen.classList.add('hidden');
  if (mainHub) mainHub.classList.remove('hidden');
  if (mainFooter) mainFooter.classList.remove('hidden');

  if ((window as any).lucide) {
    (window as any).lucide.createIcons();
  }
};

/* =============================================================================
   LEFT SIDEBAR: READ-ONLY CHARACTER SHEET (FICHA EM TEXTO NÃO EDITÁVEL)
   ============================================================================= */

window.toggleGameLeftSidebar = function() {
  const sidebar = document.getElementById('game-left-sidebar');
  const backdrop = document.getElementById('game-left-backdrop');
  if (!sidebar) return;

  const isHidden = sidebar.classList.contains('-translate-x-full');
  if (isHidden) {
    sidebar.classList.remove('-translate-x-full');
    if (backdrop) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100');
    }
  } else {
    sidebar.classList.add('-translate-x-full');
    if (backdrop) {
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      backdrop.classList.remove('opacity-100');
    }
  }
};

window.closeGameLeftSidebarMobile = function() {
  const sidebar = document.getElementById('game-left-sidebar');
  const backdrop = document.getElementById('game-left-backdrop');
  if (sidebar) sidebar.classList.add('-translate-x-full');
  if (backdrop) {
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    backdrop.classList.remove('opacity-100');
  }
};

/**
 * Switches character sheet tab in the left sidebar and renders strictly read-only, beautifully formatted text blocks
 */
window.setGameSheetTab = function(tabId: string) {
  currentGameSheetTab = tabId;

  // Update tab button active states
  const tabButtons = document.querySelectorAll('.game-sheet-tab-btn');
  tabButtons.forEach(btn => {
    const btnTab = btn.getAttribute('data-tab');
    if (btnTab === tabId) {
      btn.className = 'game-sheet-tab-btn px-2.5 py-1 rounded-lg text-xs font-bold font-rajdhani whitespace-nowrap transition-all shadow-sm bg-indigo-900/80 text-white border border-indigo-400/60 ring-1 ring-indigo-400/30';
    } else {
      btn.className = 'game-sheet-tab-btn px-2.5 py-1 rounded-lg text-xs font-bold font-rajdhani whitespace-nowrap transition-all shadow-sm bg-[#121629] text-indigo-200/70 hover:text-white hover:bg-indigo-950/70 border border-indigo-500/20';
    }
  });

  const tabTitleEl = document.getElementById('game-sheet-tab-title');
  const contentEl = document.getElementById('game-sheet-content');
  if (!contentEl) return;

  const char = activeGameCharacter || {};
  let title = 'Ficha do Personagem';
  let html = '';

  switch (tabId) {
    case 'cabecalho':
      title = 'Identificação & Dados Básicos';
      html = renderSheetTabCabecalho(char);
      break;
    case 'atributos':
      title = 'Atributos & Modificadores';
      html = renderSheetTabAtributos(char);
      break;
    case 'pericias':
      title = 'Tabela de Perícias';
      html = renderSheetTabPericias(char);
      break;
    case 'defesas':
      title = 'Defesas, PV, PM & Resistências';
      html = renderSheetTabDefesas(char);
      break;
    case 'ataques':
      title = 'Ataques & Armas Cadastradas';
      html = renderSheetTabAtaques(char);
      break;
    case 'habilidades':
      title = 'Habilidades, Poderes & Magias';
      html = renderSheetTabHabilidades(char);
      break;
    case 'inventario':
      title = 'Inventário, Itens & Moedas';
      html = renderSheetTabInventario(char);
      break;
    case 'lore':
      title = 'Lore, Background & Diário';
      html = renderSheetTabLore(char);
      break;
    case 'tudo':
      title = 'Ficha Completa (Visão Geral)';
      html = `
        <div class="space-y-6">
          <div class="border-b border-indigo-500/30 pb-4">${renderSheetTabCabecalho(char)}</div>
          <div class="border-b border-indigo-500/30 pb-4">${renderSheetTabAtributos(char)}</div>
          <div class="border-b border-indigo-500/30 pb-4">${renderSheetTabDefesas(char)}</div>
          <div class="border-b border-indigo-500/30 pb-4">${renderSheetTabAtaques(char)}</div>
          <div class="border-b border-indigo-500/30 pb-4">${renderSheetTabPericias(char)}</div>
          <div class="border-b border-indigo-500/30 pb-4">${renderSheetTabHabilidades(char)}</div>
          <div class="border-b border-indigo-500/30 pb-4">${renderSheetTabInventario(char)}</div>
          <div>${renderSheetTabLore(char)}</div>
        </div>
      `;
      break;
  }

  if (tabTitleEl) tabTitleEl.innerText = title;
  contentEl.innerHTML = html;

  if ((window as any).lucide) {
    (window as any).lucide.createIcons();
  }
};

/**
 * Renders Read-Only Cabeçalho
 */
function renderSheetTabCabecalho(char: any): string {
  let classesText = 'Aventureiro 1';
  if (char.classes && Array.isArray(char.classes) && char.classes.length > 0) {
    classesText = char.classes.map((c: any) => `${c.name || 'Classe'} ${c.level || 1}`).join(' / ');
  } else if (char.class1) {
    classesText = char.class2 ? `${char.class1} / ${char.class2}` : `${char.class1} ${char.totalLevel || 1}`;
  }

  return `
    <div class="space-y-3 font-rajdhani text-xs select-text">
      <!-- Main Bio Banner -->
      <div class="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/80 via-[#0e1222] to-purple-950/80 border border-indigo-500/30 shadow-md">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-orbitron font-bold text-base text-white tracking-wide">${escapeHtml(char.name || 'Sem Nome')}</h4>
            <p class="text-indigo-300 font-semibold text-xs mt-0.5">
              <span>${escapeHtml(char.race || 'Humano')}</span> &bull; 
              <span class="text-amber-300 font-bold">${escapeHtml(classesText)}</span>
            </p>
          </div>
          <span class="bg-indigo-950 text-indigo-300 border border-indigo-400/50 font-orbitron font-bold text-xs px-2.5 py-1 rounded-lg">
            Nível ${char.totalLevel || 1}
          </span>
        </div>
      </div>

      <!-- Key Details Grid -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-[#0b0e1a] p-2.5 rounded-lg border border-indigo-500/20">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Origem</span>
          <span class="font-bold text-slate-200">${escapeHtml(char.origin || 'Nenhuma')}</span>
        </div>
        <div class="bg-[#0b0e1a] p-2.5 rounded-lg border border-indigo-500/20">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Divindade</span>
          <span class="font-bold text-slate-200">${escapeHtml(char.divinity || 'Nenhuma')}</span>
        </div>
        <div class="bg-[#0b0e1a] p-2.5 rounded-lg border border-indigo-500/20">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Alinhamento</span>
          <span class="font-bold text-slate-200">${escapeHtml(char.alignment || 'Neutro')}</span>
        </div>
        <div class="bg-[#0b0e1a] p-2.5 rounded-lg border border-indigo-500/20">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tamanho / Deslocamento</span>
          <span class="font-bold text-slate-200">${escapeHtml(char.size || 'Médio')} &bull; ${escapeHtml(char.speed || '9m')}</span>
        </div>
        <div class="bg-[#0b0e1a] p-2.5 rounded-lg border border-indigo-500/20">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Idade</span>
          <span class="font-bold text-slate-200">${char.age ? `${char.age} anos` : 'Jovem'}</span>
        </div>
        <div class="bg-[#0b0e1a] p-2.5 rounded-lg border border-indigo-500/20">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jogador / Criador</span>
          <span class="font-bold text-indigo-300">${escapeHtml(char.player || 'testador')}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders Read-Only Atributos with clickable test buttons
 */
function renderSheetTabAtributos(char: any): string {
  const attrs = char.attributes || [
    { id: 'FOR', name: 'Força', value: 3, mod: 3 },
    { id: 'DES', name: 'Destreza', value: 2, mod: 2 },
    { id: 'CON', name: 'Constituição', value: 2, mod: 2 },
    { id: 'INT', name: 'Inteligência', value: 0, mod: 0 },
    { id: 'SAB', name: 'Sabedoria', value: 1, mod: 1 },
    { id: 'CAR', name: 'Carisma', value: 0, mod: 0 }
  ];

  let html = `
    <div class="space-y-2.5 font-rajdhani text-xs select-text">
      <div class="flex items-center justify-between pb-1 border-b border-indigo-500/20 text-slate-400 text-[10px] uppercase font-bold">
        <span>Atributo</span>
        <span>Valor & Modificador</span>
        <span>Ação Rápida</span>
      </div>
      <div class="grid grid-cols-1 gap-2">
  `;

  attrs.forEach((a: any) => {
    const mod = a.mod !== undefined ? a.mod : (a.value !== undefined ? a.value : 0);
    const modFormatted = mod >= 0 ? `+${mod}` : `${mod}`;
    const name = a.name || a.id;

    html += `
      <div class="bg-[#0b0e1a] p-2.5 rounded-xl border border-indigo-500/20 flex items-center justify-between hover:border-indigo-500/50 transition-colors">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center font-orbitron font-bold text-indigo-300 text-xs">
            ${a.id}
          </div>
          <div>
            <h5 class="font-bold text-white text-xs">${name}</h5>
            <span class="text-[10px] text-slate-400">Modificador: <strong class="text-amber-300 font-mono font-bold">${modFormatted}</strong></span>
          </div>
        </div>
        <button 
          type="button" 
          onclick="window.quickRollDice('1d20${mod >= 0 ? `+${mod}` : `${mod}`}', 'Teste de ${name}')" 
          class="px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
          title="Rolar Teste de ${name} (1d20 ${modFormatted})"
        >
          <span>🎲</span>
          <span>1d20${modFormatted}</span>
        </button>
      </div>
    `;
  });

  html += `</div></div>`;
  return html;
}

/**
 * Standard T20 Perícias Table with Clickable Rolls
 */
const T20_STANDARD_PERICIAS = [
  { name: 'Acrobacia', attr: 'DES', trainedBonus: 2 },
  { name: 'Adestramento', attr: 'CAR', trainedBonus: 0 },
  { name: 'Atletismo', attr: 'FOR', trainedBonus: 2 },
  { name: 'Atuação', attr: 'CAR', trainedBonus: 0 },
  { name: 'Cavalgar', attr: 'DES', trainedBonus: 0 },
  { name: 'Conhecimento', attr: 'INT', trainedBonus: 0 },
  { name: 'Cura', attr: 'SAB', trainedBonus: 0 },
  { name: 'Diplomacia', attr: 'CAR', trainedBonus: 2 },
  { name: 'Enganação', attr: 'CAR', trainedBonus: 0 },
  { name: 'Fortitude', attr: 'CON', trainedBonus: 2 },
  { name: 'Furtividade', attr: 'DES', trainedBonus: 0 },
  { name: 'Guerra', attr: 'INT', trainedBonus: 0 },
  { name: 'Iniciativa', attr: 'DES', trainedBonus: 2 },
  { name: 'Intimidação', attr: 'CAR', trainedBonus: 2 },
  { name: 'Intuição', attr: 'SAB', trainedBonus: 0 },
  { name: 'Investigação', attr: 'INT', trainedBonus: 0 },
  { name: 'Jogatina', attr: 'CAR', trainedBonus: 0 },
  { name: 'Ladinagem', attr: 'DES', trainedBonus: 0 },
  { name: 'Luta', attr: 'FOR', trainedBonus: 2 },
  { name: 'Misticismo', attr: 'INT', trainedBonus: 0 },
  { name: 'Nobreza', attr: 'INT', trainedBonus: 0 },
  { name: 'Ofício (Armeiro)', attr: 'INT', trainedBonus: 0 },
  { name: 'Percepção', attr: 'SAB', trainedBonus: 2 },
  { name: 'Pilotagem', attr: 'DES', trainedBonus: 0 },
  { name: 'Pontaria', attr: 'DES', trainedBonus: 2 },
  { name: 'Reflexos', attr: 'DES', trainedBonus: 2 },
  { name: 'Religião', attr: 'SAB', trainedBonus: 0 },
  { name: 'Sobrevivência', attr: 'SAB', trainedBonus: 0 },
  { name: 'Vontade', attr: 'SAB', trainedBonus: 2 }
];

function renderSheetTabPericias(char: any): string {
  const halfLevel = Math.floor((char.totalLevel || 1) / 2);
  const attrs = char.attributes || [];
  const getAttrMod = (id: string) => {
    const a = attrs.find((x: any) => x.id === id);
    return a ? (a.mod !== undefined ? a.mod : (a.value || 0)) : 0;
  };

  let html = `
    <div class="space-y-2 font-rajdhani text-xs select-text">
      <div class="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-slate-300 flex justify-between items-center">
        <span>Metade do Nível (1/2 Lvl): <strong class="text-amber-300 font-mono">+${halfLevel}</strong></span>
        <span class="text-indigo-300 font-bold">Clique em "Rolar" para enviar ao chat</span>
      </div>
      <div class="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
  `;

  T20_STANDARD_PERICIAS.forEach(p => {
    const attrMod = getAttrMod(p.attr);
    const trained = p.trainedBonus > 0;
    const totalBonus = halfLevel + attrMod + p.trainedBonus;
    const bonusFormatted = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

    html += `
      <div class="bg-[#0b0e1a] p-2 rounded-lg border border-indigo-500/15 flex items-center justify-between hover:border-indigo-500/40 transition-colors">
        <div>
          <div class="flex items-center space-x-2">
            <span class="font-bold text-white text-xs">${p.name}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${trained ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-500'}">
              ${trained ? 'TREINADA' : 'DESTREINADA'}
            </span>
          </div>
          <p class="text-[10px] text-slate-400">
            ${p.attr} (${attrMod >= 0 ? `+${attrMod}` : attrMod}) &bull; Treino: +${p.trainedBonus} &bull; Total: <strong class="text-amber-300 font-mono font-bold">${bonusFormatted}</strong>
          </p>
        </div>
        <button 
          type="button" 
          onclick="window.quickRollDice('1d20${bonusFormatted}', 'Perícia: ${p.name}')" 
          class="px-2 py-1 rounded bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-[11px] flex items-center space-x-1 shadow-sm"
          title="Rolar ${p.name} (1d20 ${bonusFormatted})"
        >
          <span>🎲</span>
          <span>${bonusFormatted}</span>
        </button>
      </div>
    `;
  });

  html += `</div></div>`;
  return html;
}

/**
 * Renders Read-Only Defesas & Recursos
 */
function renderSheetTabDefesas(char: any): string {
  const pvAtual = char.pvAtual !== undefined ? char.pvAtual : 24;
  const pvMax = char.pvMax !== undefined ? char.pvMax : 24;
  const pmAtual = char.pmAtual !== undefined ? char.pmAtual : 8;
  const pmMax = char.pmMax !== undefined ? char.pmMax : 8;
  const defense = char.defense || 18;

  return `
    <div class="space-y-3 font-rajdhani text-xs select-text">
      <!-- PV & PM Cards -->
      <div class="grid grid-cols-2 gap-2.5">
        <div class="bg-red-950/30 p-3 rounded-xl border border-red-500/30">
          <div class="flex items-center justify-between mb-1">
            <span class="font-orbitron font-bold text-red-300 text-xs uppercase">Pontos de Vida (PV)</span>
            <span class="font-mono font-bold text-red-200 text-sm">${pvAtual} / ${pvMax}</span>
          </div>
          <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div class="bg-red-500 h-full rounded-full" style="width: ${Math.min(100, Math.max(0, (pvAtual / pvMax) * 100))}%"></div>
          </div>
        </div>

        <div class="bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/30">
          <div class="flex items-center justify-between mb-1">
            <span class="font-orbitron font-bold text-indigo-300 text-xs uppercase">Pontos de Mana (PM)</span>
            <span class="font-mono font-bold text-indigo-200 text-sm">${pmAtual} / ${pmMax}</span>
          </div>
          <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div class="bg-indigo-500 h-full rounded-full" style="width: ${Math.min(100, Math.max(0, (pmAtual / pmMax) * 100))}%"></div>
          </div>
        </div>
      </div>

      <!-- Defesa breakdown -->
      <div class="bg-[#0b0e1a] p-3 rounded-xl border border-indigo-500/20 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-orbitron font-bold text-white text-xs">Classe de Armadura / Defesa</span>
          <span class="font-orbitron font-bold text-lg text-amber-300">${defense}</span>
        </div>
        <p class="text-[10px] text-slate-400 leading-relaxed">
          Composição estimada: 10 Base + 2 Destreza + 5 Armadura Pesada (Brunea) + 1 Escudo Leve = <strong>${defense} Defesa</strong>
        </p>
      </div>

      <!-- Resistências -->
      <div class="bg-[#0b0e1a] p-3 rounded-xl border border-indigo-500/20 space-y-1.5">
        <span class="font-orbitron font-bold text-indigo-300 text-xs block">Resistências & Reduções de Dano</span>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-slate-900/60 p-2 rounded border border-slate-800">
            <span class="text-slate-400 block text-[10px]">Redução de Dano (RD)</span>
            <span class="font-bold text-white">0</span>
          </div>
          <div class="bg-slate-900/60 p-2 rounded border border-slate-800">
            <span class="text-slate-400 block text-[10px]">Resistência à Magia</span>
            <span class="font-bold text-white">+0 em testes</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders Read-Only Ataques with attack roll trigger
 */
function renderSheetTabAtaques(char: any): string {
  const attacks = char.attacks || [
    { weapon: 'Espada Longa', atkBonus: 6, damage: '1d8+4', crit: '19-20/x2', type: 'Corte', range: 'Corpo a corpo' },
    { weapon: 'Arco Curto', atkBonus: 5, damage: '1d6+2', crit: 'x3', type: 'Perfuração', range: '30m' }
  ];

  let html = `
    <div class="space-y-2.5 font-rajdhani text-xs select-text">
      <div class="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-slate-300">
        Armas prontas para combate. Clique no botão de ataque para rolar no chat.
      </div>
  `;

  attacks.forEach((atk: any) => {
    const bonus = atk.atkBonus >= 0 ? `+${atk.atkBonus}` : `${atk.atkBonus}`;
    html += `
      <div class="bg-[#0b0e1a] p-3 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-colors space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-red-400 text-sm">⚔️</span>
            <h5 class="font-orbitron font-bold text-white text-xs">${escapeHtml(atk.weapon || 'Arma')}</h5>
          </div>
          <span class="bg-red-950 text-red-300 border border-red-500/40 font-mono font-bold text-[11px] px-2 py-0.5 rounded">
            Ataque: ${bonus}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-1.5 text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg">
          <div>Dano: <strong class="text-amber-300 font-mono font-bold">${atk.damage || '1d8'}</strong></div>
          <div>Crítico: <strong class="text-white font-mono">${atk.crit || 'x2'}</strong></div>
          <div>Alcance: <strong class="text-white">${atk.range || 'Corpo a corpo'}</strong></div>
        </div>

        <button 
          type="button" 
          onclick="window.rollCharacterAttack('${escapeHtml(atk.weapon || 'Arma')}', ${atk.atkBonus || 0}, '${atk.damage || '1d8'}', '${atk.crit || '20/x2'}')" 
          class="w-full py-1.5 rounded-lg bg-gradient-to-r from-red-900 to-amber-900 hover:from-red-800 hover:to-amber-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
        >
          <span>🎲</span>
          <span>Rolar Ataque & Dano (${bonus} &bull; ${atk.damage})</span>
        </button>
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

/**
 * Renders Read-Only Habilidades & Magias
 */
function renderSheetTabHabilidades(char: any): string {
  return `
    <div class="space-y-3 font-rajdhani text-xs select-text">
      <!-- Poderes de Classe -->
      <div class="bg-[#0b0e1a] p-3 rounded-xl border border-indigo-500/20 space-y-2">
        <h5 class="font-orbitron font-bold text-purple-300 text-xs uppercase flex items-center space-x-1.5">
          <span>🛡️</span>
          <span>Habilidades de Classe (Guerreiro)</span>
        </h5>
        <div class="space-y-2 text-xs">
          <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <strong class="text-white block">Ataque Especial (1 PM):</strong>
            <p class="text-slate-300 text-[11px] mt-0.5 leading-relaxed">Você pode gastar 1 PM para receber +4 no teste de ataque ou +4 na rolagem de dano deste ataque.</p>
          </div>
          <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <strong class="text-white block">Durabilidade de Aço:</strong>
            <p class="text-slate-300 text-[11px] mt-0.5 leading-relaxed">Você recebe +2 em testes de Fortitude e ignora a penalidade de armadura em Atletismo.</p>
          </div>
        </div>
      </div>

      <!-- Poderes de Origem & Raça -->
      <div class="bg-[#0b0e1a] p-3 rounded-xl border border-indigo-500/20 space-y-2">
        <h5 class="font-orbitron font-bold text-indigo-300 text-xs uppercase flex items-center space-x-1.5">
          <span>👑</span>
          <span>Poderes de Raça & Origem (Guarda)</span>
        </h5>
        <div class="space-y-2 text-xs">
          <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <strong class="text-white block">Detetive Urbano:</strong>
            <p class="text-slate-300 text-[11px] mt-0.5 leading-relaxed">+2 em testes de Investigação e Percepção dentro de cidades.</p>
          </div>
          <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <strong class="text-white block">Versatilidade Humana:</strong>
            <p class="text-slate-300 text-[11px] mt-0.5 leading-relaxed">+1 perícia treinada extra e +1 poder geral à escolha.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders Read-Only Inventário
 */
function renderSheetTabInventario(char: any): string {
  const inv = char.inventory || [];
  const tibares = char.tibares !== undefined ? char.tibares : 145;
  const currentWeight = inv.reduce((sum: number, item: any) => sum + ((item.weight || 0) * (item.quantity || 1)), 0);
  const maxWeight = 15;

  let html = `
    <div class="space-y-3 font-rajdhani text-xs select-text">
      <!-- Currency & Carry Load Header -->
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-amber-300 uppercase font-bold block">Moedas / Tibares</span>
            <span class="font-mono font-bold text-amber-200 text-sm">T$ ${tibares}</span>
          </div>
          <span class="text-xl">💰</span>
        </div>
        <div class="bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-500/30 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-indigo-300 uppercase font-bold block">Carga / Capacidade</span>
            <span class="font-mono font-bold text-white text-xs">${currentWeight.toFixed(1)} / ${maxWeight} kg</span>
          </div>
          <span class="text-xl">🎒</span>
        </div>
      </div>

      <!-- Items Table -->
      <div class="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
  `;

  if (inv.length === 0) {
    html += `<div class="p-4 text-center text-slate-500 italic">Mochila vazia.</div>`;
  } else {
    inv.forEach((item: any) => {
      html += `
        <div class="bg-[#0b0e1a] p-2.5 rounded-xl border border-indigo-500/20 flex items-center justify-between">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-white text-xs">${escapeHtml(item.name || 'Item')}</span>
              <span class="bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono px-1.5 rounded">
                x${item.quantity || 1}
              </span>
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5">
              ${item.weight ? `${item.weight} kg cada` : '0 kg'} ${item.notes ? `&bull; ${escapeHtml(item.notes)}` : ''}
            </p>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">${((item.weight || 0) * (item.quantity || 1)).toFixed(1)} kg</span>
        </div>
      `;
    });
  }

  html += `</div></div>`;
  return html;
}

/**
 * Renders Read-Only Lore & Diário
 */
function renderSheetTabLore(char: any): string {
  return `
    <div class="space-y-3 font-rajdhani text-xs select-text">
      <!-- Background -->
      <div class="bg-[#0b0e1a] p-3 rounded-xl border border-indigo-500/20 space-y-1.5">
        <h5 class="font-orbitron font-bold text-indigo-300 text-xs uppercase">Histórico / Background</h5>
        <p class="text-slate-300 leading-relaxed text-xs">
          ${escapeHtml(char.background || 'Histórico não preenchido.')}
        </p>
      </div>

      <!-- Appearance -->
      <div class="bg-[#0b0e1a] p-3 rounded-xl border border-indigo-500/20 space-y-1.5">
        <h5 class="font-orbitron font-bold text-indigo-300 text-xs uppercase">Descrição Física & Aparência</h5>
        <p class="text-slate-300 leading-relaxed text-xs">
          ${escapeHtml(char.appearance || 'Aparência não preenchida.')}
        </p>
      </div>
    </div>
  `;
}

/**
 * Copies the current sheet tab text to clipboard
 */
window.copyCurrentTabContent = function() {
  const contentEl = document.getElementById('game-sheet-content');
  if (!contentEl) return;

  const text = contentEl.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const toastFn = (window as any).showToast;
    if (toastFn) toastFn("📋 Ficha copiada para a área de transferência!");
  }).catch(() => {
    const toastFn = (window as any).showToast;
    if (toastFn) toastFn("Erro ao copiar texto.");
  });
};

/* =============================================================================
   RIGHT SIDEBAR: MINI CABEÇALHO, ARMAS, ARMADURAS, CONSUMÍVEIS
   ============================================================================= */

window.toggleGameRightSidebar = function() {
  const sidebar = document.getElementById('game-right-sidebar');
  const backdrop = document.getElementById('game-right-backdrop');
  if (!sidebar) return;

  const isHidden = sidebar.classList.contains('translate-x-full');
  if (isHidden) {
    sidebar.classList.remove('translate-x-full');
    if (backdrop) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100');
    }
  } else {
    sidebar.classList.add('translate-x-full');
    if (backdrop) {
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      backdrop.classList.remove('opacity-100');
    }
  }
};

window.closeGameRightSidebarMobile = function() {
  const sidebar = document.getElementById('game-right-sidebar');
  const backdrop = document.getElementById('game-right-backdrop');
  if (sidebar) sidebar.classList.add('translate-x-full');
  if (backdrop) {
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    backdrop.classList.remove('opacity-100');
  }
};

/**
 * Updates the Right Sidebar Mini Cabeçalho PV and PM bars, text values and color states
 */
window.updateGameHUD = function() {
  const char = activeGameCharacter || {};
  const pvAtual = char.pvAtual !== undefined ? char.pvAtual : 24;
  const pvMax = char.pvMax !== undefined ? char.pvMax : 24;
  const pmAtual = char.pmAtual !== undefined ? char.pmAtual : 8;
  const pmMax = char.pmMax !== undefined ? char.pmMax : 8;
  const defense = char.defense || 18;

  // Header Details
  const nameEl = document.getElementById('hud-char-name');
  const detailsEl = document.getElementById('hud-char-details');
  const defEl = document.getElementById('hud-defense-val');

  if (nameEl) nameEl.innerText = char.name || 'Herói';
  if (detailsEl) detailsEl.innerText = `${char.race || 'Humano'} &bull; ${char.class1 || 'Guerreiro'} (Nvl ${char.totalLevel || 1})`;
  if (defEl) defEl.innerText = defense.toString();

  // PV Elements
  const pvAtualEl = document.getElementById('hud-pv-atual');
  const pvMaxEl = document.getElementById('hud-pv-max');
  const pvBar = document.getElementById('hud-pv-bar');
  const pvTopBtn = document.getElementById('game-btn-pv');

  if (pvAtualEl) pvAtualEl.innerText = pvAtual.toString();
  if (pvMaxEl) pvMaxEl.innerText = pvMax.toString();
  
  const pvPercent = Math.min(100, Math.max(0, (pvAtual / (pvMax || 1)) * 100));
  if (pvBar) {
    pvBar.style.width = `${pvPercent}%`;
    if (pvPercent > 50) {
      pvBar.className = 'h-full rounded-full transition-all duration-300 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    } else if (pvPercent > 25) {
      pvBar.className = 'h-full rounded-full transition-all duration-300 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    } else {
      pvBar.className = 'h-full rounded-full transition-all duration-300 bg-red-600 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]';
    }
  }
  if (pvTopBtn) {
    pvTopBtn.innerText = `❤️ ${pvAtual}/${pvMax} PV`;
  }

  // PM Elements
  const pmAtualEl = document.getElementById('hud-pm-atual');
  const pmMaxEl = document.getElementById('hud-pm-max');
  const pmBar = document.getElementById('hud-pm-bar');
  const pmTopBtn = document.getElementById('game-btn-pm');

  if (pmAtualEl) pmAtualEl.innerText = pmAtual.toString();
  if (pmMaxEl) pmMaxEl.innerText = pmMax.toString();

  const pmPercent = Math.min(100, Math.max(0, (pmAtual / (pmMax || 1)) * 100));
  if (pmBar) {
    pmBar.style.width = `${pmPercent}%`;
  }
  if (pmTopBtn) {
    pmTopBtn.innerText = `⚡ ${pmAtual}/${pmMax} PM`;
  }
};

/**
 * Modifies PV or PM by a positive or negative delta and syncs to Firestore
 */
window.modifyCharacterStat = async function(stat: 'pv' | 'pm', delta: number) {
  if (!activeGameCharacter) return;

  const char = activeGameCharacter;
  let currentVal = stat === 'pv' ? (char.pvAtual ?? 24) : (char.pmAtual ?? 8);
  const maxVal = stat === 'pv' ? (char.pvMax ?? 24) : (char.pmMax ?? 8);

  const newVal = Math.min(maxVal, Math.max(0, currentVal + delta));
  
  if (stat === 'pv') {
    char.pvAtual = newVal;
  } else {
    char.pmAtual = newVal;
  }

  window.updateGameHUD();

  // Broadcast system message to session chat
  const charName = char.name || 'Personagem';
  let messageText = '';
  if (stat === 'pv') {
    if (delta > 0) {
      messageText = `💚 **${charName}** recuperou **${delta} PV**! (Atual: ${newVal}/${maxVal} PV)`;
    } else {
      messageText = `💔 **${charName}** sofreu **${Math.abs(delta)} de Dano**! (Atual: ${newVal}/${maxVal} PV)`;
    }
  } else {
    if (delta > 0) {
      messageText = `✨ **${charName}** recuperou **${delta} PM**! (Atual: ${newVal}/${maxVal} PM)`;
    } else {
      messageText = `⚡ **${charName}** gastou **${Math.abs(delta)} PM**! (Atual: ${newVal}/${maxVal} PM)`;
    }
  }

  if (activeGameCampaign && activeGameCampaign.id) {
    try {
      if (char.id && char.id !== 'char-demo') {
        await updateCharacterPVPM(char.id, char.pvAtual, char.pmAtual);
      }
      await sendSessionMessage({
        campaignId: activeGameCampaign.id,
        senderUid: 'system',
        senderName: 'SISTEMA',
        senderRole: 'system',
        characterName: charName,
        type: 'action',
        content: messageText
      });
    } catch (err) {
      console.warn("Could not sync stat to Firebase:", err);
    }
  }
};

/**
 * Custom prompt for stat change
 */
window.promptCustomStatChange = function(stat: 'pv' | 'pm') {
  const isPV = stat === 'pv';
  const label = isPV ? 'Dano (negativo) ou Cura (positivo) de PV' : 'Gasto (negativo) ou Ganho (positivo) de PM';
  const input = window.prompt(`Informe o valor de alteração de ${isPV ? 'PV' : 'PM'} (Ex: -5 para dano, +10 para cura):`, '');
  
  if (input !== null && input.trim()) {
    const val = parseInt(input.trim(), 10);
    if (!isNaN(val) && val !== 0) {
      window.modifyCharacterStat(stat, val);
    }
  }
};

/**
 * Renders Equipped Weapons in the Right Sidebar
 */
window.renderEquippedWeapons = function() {
  const container = document.getElementById('game-equipped-weapons-list');
  if (!container) return;

  const char = activeGameCharacter || {};
  const attacks = char.attacks || [
    { weapon: 'Espada Longa', atkBonus: 6, damage: '1d8+4', crit: '19-20/x2', type: 'Corte', range: 'Corpo a corpo' },
    { weapon: 'Arco Curto', atkBonus: 5, damage: '1d6+2', crit: 'x3', type: 'Perfuração', range: '30m' }
  ];

  let html = '';
  attacks.forEach((atk: any) => {
    const bonus = atk.atkBonus >= 0 ? `+${atk.atkBonus}` : `${atk.atkBonus}`;
    html += `
      <div class="bg-[#0b0e1a] p-2.5 rounded-xl border border-red-500/25 hover:border-red-500/50 transition-all flex items-center justify-between group">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-red-400">⚔️</span>
            <h5 class="font-orbitron font-bold text-white text-xs">${escapeHtml(atk.weapon || 'Arma')}</h5>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">
            Dano: <strong class="text-amber-300 font-mono">${atk.damage || '1d8'}</strong> &bull; Crítico: <span class="font-mono text-slate-300">${atk.crit || 'x2'}</span>
          </p>
        </div>
        <button 
          type="button" 
          onclick="window.rollCharacterAttack('${escapeHtml(atk.weapon || 'Arma')}', ${atk.atkBonus || 0}, '${atk.damage || '1d8'}', '${atk.crit || '20/x2'}')" 
          class="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 hover:text-white font-bold text-xs flex items-center space-x-1 transition-all shadow-sm"
          title="Rolar Ataque (${bonus})"
        >
          <span>🎲</span>
          <span>${bonus}</span>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
};

/**
 * Renders Equipped Armor & Shields in the Right Sidebar
 */
window.renderEquippedArmor = function() {
  const container = document.getElementById('game-equipped-armor-list');
  if (!container) return;

  const char = activeGameCharacter || {};
  const armors = char.armors || [
    { name: 'Brunea de Aço', defense: 5, penalty: 2, type: 'Pesada', equipped: true },
    { name: 'Escudo Leve', defense: 1, penalty: 1, type: 'Escudo', equipped: true }
  ];

  let html = '';
  armors.forEach((arm: any) => {
    html += `
      <div class="bg-[#0b0e1a] p-2.5 rounded-xl border border-indigo-500/25 flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-indigo-400">🛡️</span>
            <h5 class="font-bold text-white text-xs">${escapeHtml(arm.name || 'Armadura')}</h5>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">
            Tipo: ${escapeHtml(arm.type || 'Leve')} &bull; Penalidade: -${arm.penalty || 0}
          </p>
        </div>
        <span class="bg-indigo-950 text-indigo-300 border border-indigo-400/40 font-mono font-bold text-xs px-2 py-0.5 rounded">
          +${arm.defense || 0} Def
        </span>
      </div>
    `;
  });

  container.innerHTML = html;
};

/**
 * Renders Consumable Items in the Right Sidebar
 */
window.renderConsumableItems = function() {
  const container = document.getElementById('game-consumables-list');
  if (!container) return;

  const char = activeGameCharacter || {};
  const inventory = char.inventory || [];
  
  // Filter for consumable items
  const consumables: { item: any; index: number }[] = [];
  inventory.forEach((item: any, idx: number) => {
    const nameLower = (item.name || '').toLowerCase();
    const catLower = (item.category || '').toLowerCase();
    if (
      catLower.includes('consum') ||
      catLower.includes('poção') ||
      catLower.includes('alquimia') ||
      nameLower.includes('poção') ||
      nameLower.includes('pocao') ||
      nameLower.includes('elixir') ||
      nameLower.includes('pergaminho') ||
      nameLower.includes('bálsamo') ||
      nameLower.includes('balsamo') ||
      nameLower.includes('ração') ||
      nameLower.includes('racao') ||
      nameLower.includes('tocha') ||
      nameLower.includes('flecha')
    ) {
      consumables.push({ item, index: idx });
    }
  });

  if (consumables.length === 0) {
    container.innerHTML = `
      <div class="p-3 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-dashed border-purple-500/20">
        Nenhum item consumível no inventário.
      </div>
    `;
    return;
  }

  let html = '';
  consumables.forEach(({ item, index }) => {
    const qty = item.quantity !== undefined ? item.quantity : 1;
    html += `
      <div class="bg-[#0b0e1a] p-2.5 rounded-xl border border-purple-500/25 hover:border-purple-500/40 transition-colors flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs">🧪</span>
            <h5 class="font-bold text-white text-xs">${escapeHtml(item.name || 'Consumível')}</h5>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">
            Quantidade: <strong class="text-amber-300 font-mono font-bold">x${qty}</strong> ${item.notes ? `&bull; ${escapeHtml(item.notes)}` : ''}
          </p>
        </div>
        <button 
          type="button" 
          onclick="window.useConsumableItem(${index})" 
          class="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 hover:text-white font-bold text-xs flex items-center space-x-1 transition-all shadow-sm flex-shrink-0"
          title="Usar 1 unidade de ${escapeHtml(item.name)}"
        >
          <span>✨</span>
          <span>Usar</span>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
};

/**
 * Uses a consumable item from the inventory, decrements count and triggers chat notification
 */
window.useConsumableItem = async function(itemIndex: number) {
  if (!activeGameCharacter) return;
  const char = activeGameCharacter;
  const inventory = char.inventory || [];

  if (!inventory[itemIndex]) return;
  const item = inventory[itemIndex];
  const itemName = item.name || 'Item';

  // Decrement quantity
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    // Remove if 0 or keep as x0
    inventory.splice(itemIndex, 1);
  }

  window.renderConsumableItems();
  window.setGameSheetTab(currentGameSheetTab);

  // Check if item auto-heals or recovers mana
  const nameLower = itemName.toLowerCase();
  let effectText = '';
  if (nameLower.includes('cura') || nameLower.includes('vida') || nameLower.includes('bálsamo')) {
    const healRoll = Math.floor(Math.random() * 8) + 1 + 2; // 1d8+2
    window.modifyCharacterStat('pv', healRoll);
    effectText = ` e recuperou **+${healRoll} PV**`;
  } else if (nameLower.includes('mana') || nameLower.includes('elixir')) {
    const manaRoll = 3;
    window.modifyCharacterStat('pm', manaRoll);
    effectText = ` e recuperou **+${manaRoll} PM**`;
  }

  const toastFn = (window as any).showToast;
  if (toastFn) {
    toastFn(`🧪 Usou "${itemName}"!`);
  }

  // Broadcast to Firebase Chat
  if (activeGameCampaign && activeGameCampaign.id) {
    try {
      if (char.id && char.id !== 'char-demo') {
        await updateCharacterInventory(char.id, inventory);
      }
      await sendSessionMessage({
        campaignId: activeGameCampaign.id,
        senderUid: char.id || 'player',
        senderName: char.name || 'Personagem',
        senderRole: 'player',
        characterName: char.name || 'Personagem',
        type: 'action',
        content: `🧪 **${char.name || 'Personagem'}** utilizou **1x ${itemName}**${effectText}!`
      });
    } catch (err) {
      console.warn("Could not sync consumable to Firebase:", err);
    }
  }
};

/**
 * Prompt to add a new consumable item
 */
window.promptAddConsumableItem = function() {
  const name = window.prompt("Nome do novo item consumível (Ex: Poção de Cura Maior, Elixir de Concentração):");
  if (!name || !name.trim()) return;

  const qtyStr = window.prompt("Quantidade inicial:", "1");
  const qty = parseInt(qtyStr || '1', 10) || 1;

  const char = activeGameCharacter;
  if (!char) return;
  if (!char.inventory) char.inventory = [];

  char.inventory.push({
    name: name.trim(),
    quantity: qty,
    weight: 0.5,
    category: 'Consumível',
    notes: 'Adicionado durante a sessão de jogo'
  });

  window.renderConsumableItems();
  window.setGameSheetTab(currentGameSheetTab);

  if (activeGameCampaign && activeGameCampaign.id && char.id && char.id !== 'char-demo') {
    updateCharacterInventory(char.id, char.inventory).catch(console.warn);
  }

  const toastFn = (window as any).showToast;
  if (toastFn) toastFn(`Item "${name.trim()}" adicionado!`);
};

/* =============================================================================
   CHAT, MESSAGING & DICE ROLLER ENGINE
   ============================================================================= */

/**
 * Sets session action mode (Speech, Action, Thought, Narrator)
 */
window.setSessionActionMode = function(mode: 'speech' | 'action' | 'thought' | 'narrator') {
  currentActionMode = mode;
  const buttons = document.querySelectorAll('.action-mode-btn');
  buttons.forEach(btn => {
    const btnMode = btn.getAttribute('data-mode');
    if (btnMode === mode) {
      btn.className = 'action-mode-btn px-2.5 py-1 rounded-lg text-xs font-bold font-rajdhani whitespace-nowrap transition-all shadow-sm bg-purple-900 text-white border border-purple-400/60 ring-1 ring-purple-400/40';
    } else {
      btn.className = 'action-mode-btn px-2.5 py-1 rounded-lg text-xs font-bold font-rajdhani whitespace-nowrap transition-all shadow-sm bg-cosmic-950 text-slate-400 hover:text-slate-200 border border-purple-500/20';
    }
  });

  const input = document.getElementById('game-chat-input') as HTMLInputElement | null;
  if (input) {
    if (mode === 'speech') input.placeholder = 'Digite a fala do seu personagem (Ex: "Não tememos essa escuridão!")...';
    else if (mode === 'action') input.placeholder = 'Descreva a ação que você está realizando (Ex: Desembainho a espada e avanço)...';
    else if (mode === 'thought') input.placeholder = 'Pensamento interno (Ex: *Será que este culto venera a Tormenta?*)...';
    else if (mode === 'narrator') input.placeholder = 'Falar como Mestre / Narrador...';
    input.focus();
  }
};

/**
 * Handles Enter key on game chat input
 */
window.handleChatInputKeydown = function(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const form = document.getElementById('game-chat-form') as HTMLFormElement | null;
    if (form) {
      window.handleSendSessionMessage(e);
    }
  }
};

/**
 * Sends a player message into the real-time session chat on Firebase
 */
window.handleSendSessionMessage = async function(e: Event) {
  e.preventDefault();
  const input = document.getElementById('game-chat-input') as HTMLInputElement | null;
  if (!input || !input.value.trim()) return;

  const content = input.value.trim();
  input.value = '';

  const campaign = activeGameCampaign;
  const char = activeGameCharacter;
  const campaignId = campaign?.id || 'default-session';
  const charName = char?.name || 'Aventureiro';
  const senderName = currentActionMode === 'narrator' ? 'IA Narradora' : charName;
  const senderRole = currentActionMode === 'narrator' ? 'narrator' : 'player';

  try {
    await sendSessionMessage({
      campaignId,
      senderUid: (window.currentUserProfile?.uid || 'guest'),
      senderName,
      senderRole,
      characterName: charName,
      type: currentActionMode === 'narrator' ? 'narrative' : currentActionMode,
      content
    });
  } catch (err: any) {
    console.error("Erro ao enviar mensagem na sessão:", err);
    const toastFn = (window as any).showToast;
    if (toastFn) toastFn("Erro de conexão ao enviar mensagem.");
  }
};

/**
 * Quick dice roll evaluator with critical threat detection
 */
window.quickRollDice = async function(formula: string, label: string) {
  const campaign = activeGameCampaign;
  const campaignId = campaign?.id || 'default-session';
  const char = activeGameCharacter;
  const charName = char?.name || 'Aventureiro';

  // Parse dice formula like "1d20+5", "2d6+2", "1d8"
  const cleanFormula = formula.replace(/\s+/g, '');
  const match = cleanFormula.match(/(\d+)d(\d+)([+-]\d+)?/i);

  let numDice = 1;
  let dieSides = 20;
  let modifier = 0;

  if (match) {
    numDice = parseInt(match[1], 10);
    dieSides = parseInt(match[2], 10);
    if (match[3]) {
      modifier = parseInt(match[3], 10);
    }
  }

  const individualRolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * dieSides) + 1;
    individualRolls.push(roll);
    sum += roll;
  }

  const total = sum + modifier;
  const modText = modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : '';
  const breakdown = `[${individualRolls.join(', ')}]${modText}`;

  // Check criticals on d20
  let isNat20 = false;
  let isNat1 = false;
  if (dieSides === 20 && numDice === 1) {
    if (individualRolls[0] === 20) isNat20 = true;
    if (individualRolls[0] === 1) isNat1 = true;
  }

  let rollContent = `🎲 **${charName}** rolou **${label}** (${formula}):\n**Resultado: ${total}** *(Rolagens: ${breakdown})*`;
  if (isNat20) rollContent += ` 🔥 **SUCESSO CRÍTICO / 20 NATURAL!**`;
  if (isNat1) rollContent += ` 💀 **FALHA CRÍTICA / 1 NATURAL!**`;

  try {
    await sendSessionMessage({
      campaignId,
      senderUid: (window.currentUserProfile?.uid || 'guest'),
      senderName: charName,
      senderRole: 'player',
      characterName: charName,
      type: 'roll',
      content: rollContent,
      metadata: {
        rollFormula: formula,
        rollResult: total,
        rollDetails: breakdown,
        isCrit: isNat20,
        isFumble: isNat1
      }
    });
  } catch (err) {
    console.error("Erro ao enviar rolagem:", err);
  }
};

/**
 * Rolls an attack with d20 check + damage calculation
 */
window.rollCharacterAttack = async function(weaponName: string, atkBonus: number, dmgFormula: string, critRange: string) {
  const campaign = activeGameCampaign;
  const campaignId = campaign?.id || 'default-session';
  const char = activeGameCharacter;
  const charName = char?.name || 'Aventureiro';

  // 1. Attack Roll
  const d20 = Math.floor(Math.random() * 20) + 1;
  const atkTotal = d20 + atkBonus;
  const atkBonusFormatted = atkBonus >= 0 ? `+${atkBonus}` : `${atkBonus}`;

  // 2. Damage Roll (e.g. 1d8+4)
  const dmgMatch = dmgFormula.replace(/\s+/g, '').match(/(\d+)d(\d+)([+-]\d+)?/i);
  let dmgDiceCount = 1;
  let dmgDieSides = 8;
  let dmgMod = 0;
  if (dmgMatch) {
    dmgDiceCount = parseInt(dmgMatch[1], 10);
    dmgDieSides = parseInt(dmgMatch[2], 10);
    if (dmgMatch[3]) dmgMod = parseInt(dmgMatch[3], 10);
  }

  const dmgRolls: number[] = [];
  let dmgSum = 0;
  for (let i = 0; i < dmgDiceCount; i++) {
    const r = Math.floor(Math.random() * dmgDieSides) + 1;
    dmgRolls.push(r);
    dmgSum += r;
  }
  const dmgTotal = Math.max(1, dmgSum + dmgMod);

  const isNat20 = d20 === 20;
  const isNat1 = d20 === 1;

  let msg = `⚔️ **${charName}** desferiu um ataque com **${weaponName}**!\n`;
  msg += `🎯 **Ataque:** **${atkTotal}** *(d20: [${d20}] ${atkBonusFormatted})*\n`;
  msg += `💥 **Dano Potencial:** **${dmgTotal}** *(Rolagem: [${dmgRolls.join(', ')}] ${dmgMod >= 0 ? `+${dmgMod}` : dmgMod})*`;

  if (isNat20) msg += `\n🔥 **AMEAÇA CRÍTICA CONFIRMADA! (20 Natural)**`;
  if (isNat1) msg += `\n💀 **ERRO CRÍTICO / DESLIZE EM COMBATE! (1 Natural)**`;

  try {
    await sendSessionMessage({
      campaignId,
      senderUid: (window.currentUserProfile?.uid || 'guest'),
      senderName: charName,
      senderRole: 'player',
      characterName: charName,
      type: 'roll',
      content: msg,
      metadata: {
        rollFormula: `Ataque (${atkBonusFormatted}) & Dano (${dmgFormula})`,
        rollResult: atkTotal,
        rollDetails: `Atk: ${atkTotal} | Dano: ${dmgTotal}`,
        isCrit: isNat20,
        isFumble: isNat1
      }
    });
  } catch (err) {
    console.error("Erro ao enviar ataque:", err);
  }
};

/**
 * Executes a roll from the dedicated session dice modal
 */
window.executeDiceModalRoll = function() {
  const qtyInput = document.getElementById('dice-modal-qty') as HTMLInputElement | null;
  const modInput = document.getElementById('dice-modal-mod') as HTMLInputElement | null;
  const labelInput = document.getElementById('dice-modal-label') as HTMLInputElement | null;
  const advSelect = document.getElementById('dice-modal-advantage') as HTMLSelectElement | null;

  const qty = Math.max(1, parseInt(qtyInput?.value || '1', 10));
  const mod = parseInt(modInput?.value || '0', 10);
  const label = labelInput?.value.trim() || `Rolagem de ${selectedDiceModalDie}`;
  const sides = parseInt(selectedDiceModalDie.replace('d', ''), 10) || 20;

  const modStr = mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : '';
  const formula = `${qty}d${sides}${modStr}`;

  window.quickRollDice(formula, label);

  // Close modal
  const modal = document.getElementById('session-dice-modal');
  if (modal) modal.classList.add('hidden');
};

window.setDiceModalDie = function(dieName: string) {
  selectedDiceModalDie = dieName;
  const buttons = document.querySelectorAll('.dice-selector-btn');
  buttons.forEach(btn => {
    const die = btn.getAttribute('data-die');
    if (die === dieName) {
      btn.className = 'dice-selector-btn p-3 rounded-xl border flex flex-col items-center justify-center transition-all bg-purple-950 border-purple-400 text-white shadow-neon-purple';
    } else {
      btn.className = 'dice-selector-btn p-3 rounded-xl border flex flex-col items-center justify-center transition-all bg-cosmic-950 border-purple-500/20 text-slate-400 hover:text-white hover:border-purple-500/40';
    }
  });
};

/**
 * Quick Attack shortcut modal or execution
 */
window.triggerQuickAttackModal = function() {
  const char = activeGameCharacter;
  const attacks = char?.attacks || [];
  if (attacks.length > 0) {
    const primary = attacks[0];
    window.rollCharacterAttack(primary.weapon || 'Arma Principal', primary.atkBonus || 0, primary.damage || '1d8', primary.crit || '20/x2');
  } else {
    window.rollCharacterAttack('Espada Longa', 5, '1d8+3', '19-20/x2');
  }
};

/**
 * Executes a short or long rest for the active character
 */
window.executeCharacterRest = async function(type: 'curto' | 'longo') {
  if (!activeGameCharacter) return;
  const char = activeGameCharacter;
  const pvMax = char.pvMax || 24;
  const pmMax = char.pmMax || 8;
  const level = char.totalLevel || 1;

  if (type === 'curto') {
    // Short rest: recovers level in PV and level in PM
    const recoverPV = Math.max(1, Math.min(pvMax - (char.pvAtual || 0), level * 2));
    const recoverPM = Math.max(1, Math.min(pmMax - (char.pmAtual || 0), level));
    char.pvAtual = Math.min(pvMax, (char.pvAtual || 0) + recoverPV);
    char.pmAtual = Math.min(pmMax, (char.pmAtual || 0) + recoverPM);
  } else {
    // Long rest: fully restores PV and PM
    char.pvAtual = pvMax;
    char.pmAtual = pmMax;
  }

  window.updateGameHUD();

  // Close Rest Modal
  const modal = document.getElementById('session-rest-modal');
  if (modal) modal.classList.add('hidden');

  const toastFn = (window as any).showToast;
  if (toastFn) {
    toastFn(`⛺ Descanso ${type === 'curto' ? 'Curto' : 'Longo'} concluído! PV e PM restaurados.`);
  }

  if (activeGameCampaign && activeGameCampaign.id) {
    try {
      if (char.id && char.id !== 'char-demo') {
        await updateCharacterPVPM(char.id, char.pvAtual, char.pmAtual);
      }
      await sendSessionMessage({
        campaignId: activeGameCampaign.id,
        senderUid: 'system',
        senderName: 'SISTEMA',
        senderRole: 'system',
        characterName: char.name || 'Personagem',
        type: 'action',
        content: `⛺ **${char.name || 'Personagem'}** realizou um **Descanso ${type === 'curto' ? 'Curto (1 hora)' : 'Longo (8 horas completo)'}**!\nPV restaurados para **${char.pvAtual}/${pvMax}** &bull; PM restaurados para **${char.pmAtual}/${pmMax}**.`
      });
    } catch (err) {
      console.warn("Error syncing rest to Firebase:", err);
    }
  }
};

/**
 * Session Notes Autosave and Copy
 */
window.saveSessionNotesLocal = function(text: string) {
  const campaignId = activeGameCampaign?.id || 'default-session';
  if (sessionNotesAutoSaveTimer) clearTimeout(sessionNotesAutoSaveTimer);
  sessionNotesAutoSaveTimer = setTimeout(() => {
    localStorage.setItem(`session_notes_${campaignId}`, text);
  }, 500);
};

window.copySessionNotes = function() {
  const textarea = document.getElementById('session-notes-textarea') as HTMLTextAreaElement | null;
  if (textarea) {
    navigator.clipboard.writeText(textarea.value).then(() => {
      const toastFn = (window as any).showToast;
      if (toastFn) toastFn("📋 Anotações copiadas para a área de transferência!");
    });
  }
};

/**
 * Filter Rules Search inside rules modal
 */
window.filterRulesSearch = function(query: string) {
  const q = query.toLowerCase().trim();
  const ruleCards = document.querySelectorAll('.rule-item-card');
  ruleCards.forEach((card: any) => {
    const text = (card.innerText || '').toLowerCase();
    if (!q || text.includes(q)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
};

/**
 * Clears local session chat feed
 */
window.clearSessionChatFeed = function() {
  if (window.confirm("Deseja limpar as mensagens exibidas na tela de jogo?")) {
    const feed = document.getElementById('game-messages-feed');
    if (feed) {
      feed.innerHTML = `
        <div class="text-center py-8 text-slate-500 text-xs">
          Feed de mensagens limpo para esta visualização.
        </div>
      `;
    }
  }
};

/**
 * Renders real-time messages array into the chat feed
 */
window.renderSessionMessages = function(messages: SessionMessage[]) {
  const feed = document.getElementById('game-messages-feed');
  if (!feed) return;

  if (!messages || messages.length === 0) {
    // Seed initial scene if empty
    feed.innerHTML = `
      <div class="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-cosmic-950 to-purple-950/40 border border-purple-500/30 text-center space-y-2 animate-fade-in">
        <span class="text-2xl">🌌</span>
        <h4 class="font-orbitron font-bold text-white text-sm">Sessão Iniciada</h4>
        <p class="text-xs text-purple-300/80 font-rajdhani max-w-md mx-auto leading-relaxed">
          A IA Narradora e seus companheiros estão prontos. Digite sua ação, faça uma pergunta ou role um teste de perícia para começar!
        </p>
      </div>
    `;
    return;
  }

  let html = '';
  messages.forEach(msg => {
    const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const isNarrator = msg.senderRole === 'narrator';
    const isSystem = msg.senderRole === 'system';
    const isRoll = msg.type === 'roll';
    const isAction = msg.type === 'action';
    const isThought = msg.type === 'thought';

    let cardBg = 'bg-[#0b0f1d] border-purple-500/25';
    let roleBadge = `<span class="bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">JOGADOR</span>`;

    if (isNarrator) {
      cardBg = 'bg-gradient-to-r from-[#170a2c] via-[#100720] to-[#170a2c] border-purple-500/50 shadow-neon-purple';
      roleBadge = `<span class="bg-purple-950 text-purple-300 border border-purple-400/60 text-[9px] font-orbitron px-2 py-0.5 rounded font-bold">IA NARRADORA</span>`;
    } else if (isSystem) {
      cardBg = 'bg-[#0a101d] border-cyan-500/30';
      roleBadge = `<span class="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">SISTEMA</span>`;
    } else if (isRoll) {
      cardBg = 'bg-[#150a12] border-amber-500/40';
      roleBadge = `<span class="bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">DADOS</span>`;
    }

    let formattedContent = escapeHtml(msg.content)
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-indigo-200 italic">$1</em>')
      .replace(/\n/g, '<br>');

    if (isThought) {
      formattedContent = `<div class="italic text-purple-300/90 pl-2 border-l-2 border-purple-500/50 font-serif text-xs">"${formattedContent}"</div>`;
    } else if (isAction) {
      formattedContent = `<div class="text-slate-200 font-rajdhani font-semibold text-xs leading-relaxed">${formattedContent}</div>`;
    }

    html += `
      <div class="p-3.5 rounded-xl border ${cardBg} space-y-1.5 shadow-md select-text animate-fade-in">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            ${roleBadge}
            <span class="font-orbitron font-bold text-xs text-white">${escapeHtml(msg.senderName || 'Desconhecido')}</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono">${timeStr}</span>
        </div>
        <div class="text-xs text-slate-200 font-rajdhani leading-relaxed">
          ${formattedContent}
        </div>
      </div>
    `;
  });

  feed.innerHTML = html;
  feed.scrollTop = feed.scrollHeight;
};


