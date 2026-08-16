import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  updateDoc,
  runTransaction, 
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';

// Read config from firebase-applet-config.json
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

let isAuthInProgress = false;

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  usernameLower: string;
  photoURL: string;
  role: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Recursively cleans an object/array by removing all `undefined` fields and nested keys,
 * so Firestore setDoc/updateDoc never throws "Unsupported field value: undefined".
 */
export function cleanDataForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .map(item => cleanDataForFirestore(item))
      .filter(item => item !== undefined) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    // Keep Firestore special objects like FieldValue, Timestamp, etc.
    if ('_methodName' in (data as any) || typeof (data as any).toMillis === 'function') {
      return data;
    }
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleanObj[key] = cleanDataForFirestore(value);
      }
    }
    return cleanObj as T;
  }
  return data;
}

/**
 * Triggers Google Sign-In via Popup with mutex locking and friendly error handling
 */
export async function loginWithGoogle() {
  if (isAuthInProgress) {
    console.warn("Autenticação com Google já está em andamento. Aguardando...");
    throw new Error("Uma janela de login do Google já está aberta ou em andamento.");
  }

  isAuthInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    const code = error?.code || '';
    const msg = error?.message || '';

    // Handle known popup issues gracefully
    if (code === 'auth/cancelled-popup-request' || msg.includes('cancelled-popup-request')) {
      console.warn("Requisição de popup anterior cancelada.");
      throw new Error("A requisição de login anterior foi substituída.");
    }
    if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
      console.warn("Pop-up bloqueado pelo navegador.");
      throw new Error("POPUP_BLOCKED");
    }
    if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
      console.warn("Pop-up fechado pelo usuário.");
      throw new Error("POPUP_CLOSED");
    }
    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      console.error("Domínio não autorizado no Firebase Auth:", window.location.hostname);
      throw new Error(`O domínio '${window.location.hostname}' não está autorizado no Console do Firebase.`);
    }

    console.error("Google Sign In Error:", error);
    throw error;
  } finally {
    // Brief delay before releasing lock to ensure Firebase internal state resets
    setTimeout(() => {
      isAuthInProgress = false;
    }, 500);
  }
}

/**
 * Signs out current user
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Logout Error:", error);
    throw error;
  }
}

/**
 * Checks if a custom username is available in Firebase Firestore.
 * Returns true if available (not taken), false if taken.
 */
export async function checkUsernameAvailable(username: string, currentUid?: string): Promise<{ available: boolean; message: string }> {
  const clean = username.trim();
  if (!clean) {
    return { available: false, message: 'Digite um nome de usuário.' };
  }
  
  // Format validation
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(clean)) {
    return { 
      available: false, 
      message: 'O nome deve ter de 3 a 20 caracteres (apenas letras, números e _).' 
    };
  }

  const usernameLower = clean.toLowerCase();
  
  try {
    const usernameDocRef = doc(db, 'usernames', usernameLower);
    const docSnap = await getDoc(usernameDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // If it's already owned by the current user, it's allowed
      if (currentUid && data.uid === currentUid) {
        return { available: true, message: 'Este é o seu nome atual.' };
      }
      return { available: false, message: 'Este nome já está em uso na base de dados do Firebase.' };
    }

    return { available: true, message: 'Nome disponível nas estrelas!' };
  } catch (err: any) {
    console.error("Error checking username availability:", err);
    return { available: false, message: 'Erro ao verificar nome no servidor.' };
  }
}

/**
 * Registers or updates a unique custom username for the authenticated Google user.
 */
export async function registerCustomUsername(
  user: User, 
  newUsername: string, 
  oldUsername?: string
): Promise<UserProfileData> {
  const cleanUsername = newUsername.trim();
  const usernameLower = cleanUsername.toLowerCase();
  const uid = user.uid;

  // Run as a Firestore transaction for strict atomic uniqueness
  await runTransaction(db, async (transaction) => {
    const newUsernameRef = doc(db, 'usernames', usernameLower);
    const newUsernameSnap = await transaction.get(newUsernameRef);

    if (newUsernameSnap.exists() && newUsernameSnap.data().uid !== uid) {
      throw new Error("O nome de usuário acabou de ser reservado por outro jogador.");
    }

    // If changing username, remove old username mapping
    if (oldUsername && oldUsername.toLowerCase() !== usernameLower) {
      const oldUsernameRef = doc(db, 'usernames', oldUsername.toLowerCase());
      transaction.delete(oldUsernameRef);
    }

    // Reserve new username
    transaction.set(newUsernameRef, {
      uid: uid,
      username: cleanUsername,
      createdAt: serverTimestamp()
    });

    // Create / Update User Document
    const userRef = doc(db, 'users', uid);
    const profileData: Partial<UserProfileData> = {
      uid: uid,
      email: user.email || '',
      displayName: user.displayName || cleanUsername,
      username: cleanUsername,
      usernameLower: usernameLower,
      photoURL: user.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg',
      role: 'JOGADOR',
      updatedAt: serverTimestamp()
    };

    transaction.set(userRef, profileData, { merge: true });
  });

  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || cleanUsername,
    username: cleanUsername,
    usernameLower: usernameLower,
    photoURL: user.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg',
    role: 'JOGADOR'
  };
}

/**
 * Fetches user profile from Firebase Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export interface CharacterClass {
  id?: string;
  name: string;
  level: number;
}

export interface CharacterData {
  userId: string;
  system: string;
  name: string;
  playerName: string;
  profilePictureUrl?: string;
  race: string;
  origin: string;
  divinity: string;
  totalLevel: number;
  alignment: string;
  size: string;
  speed: string;
  age: number;
  class1: string;
  class1Level: number;
  class2?: string;
  class2Level?: number;
  classes?: CharacterClass[];
  attributes?: any[];
  skills?: any[];
  pvAtual?: number;
  pvMax?: number;
  pmAtual?: number;
  pmMax?: number;
  defenseBase?: number;
  defenseBoxes?: any[];
  inventory?: any[];
  money?: number;
  currencyName?: string;
  maxLoad?: number;
  attacks?: any[];
  customSections?: any[];
  background?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
  appearanceOther?: string;
  personality?: string;
  genderIdentity?: string;
  sexualOrientation?: string;
  activism?: string;
  prejudices?: string;
  likesOther?: string;
  episodes?: any[];
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Gets all characters for a specific user
 */
export async function getUserCharacters(uid: string): Promise<(CharacterData & { id: string })[]> {
  try {
    const q = query(collection(db, 'characters'), where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    const chars: (CharacterData & { id: string })[] = [];
    
    querySnapshot.forEach((doc) => {
      chars.push({ id: doc.id, ...doc.data() } as CharacterData & { id: string });
    });
    
    // Sort descending by createdAt
    return chars.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
    return [];
  }
}

/**
 * Gets a single character by ID from Firestore
 */
export async function getCharacterById(characterId: string): Promise<(CharacterData & { id: string }) | null> {
  try {
    const charRef = doc(db, 'characters', characterId);
    const snap = await getDoc(charRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as CharacterData & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching character by ID:", error);
    return null;
  }
}

/**
 * Deletes a character by ID
 */
export async function deleteCharacterDoc(characterId: string): Promise<void> {
  try {
    const charRef = doc(db, 'characters', characterId);
    await deleteDoc(charRef);
  } catch (error) {
    console.error("Error deleting character:", error);
    throw error;
  }
}

/**
 * Saves a new character or updates an existing one in Firebase Firestore
 */
export async function saveCharacter(characterData: Omit<CharacterData, 'userId' | 'createdAt' | 'updatedAt'>, uid: string, existingId?: string): Promise<string> {
  try {
    const charId = existingId || crypto.randomUUID();
    const charsCollectionRef = doc(db, 'characters', charId); 
    
    const payload: any = cleanDataForFirestore({
      ...characterData,
      userId: uid,
      updatedAt: serverTimestamp(),
      ...(existingId ? {} : { createdAt: serverTimestamp() })
    });
    
    await setDoc(charsCollectionRef, payload, { merge: true });
    return charId;
  } catch (error) {
    console.error("Error saving character:", error);
    throw error;
  }
}

export interface PresenceData {
  uid: string;
  username: string;
  photoURL?: string;
  role?: string;
  lastSeen?: any;
  isOnline: boolean;
  statusText?: string;
}

/**
 * Updates user presence heartbeat in Firestore
 */
export async function updateUserPresence(info: {
  uid: string;
  username: string;
  photoURL?: string;
  role?: string;
  isOnline?: boolean;
  statusText?: string;
}) {
  try {
    const presenceRef = doc(db, 'presence', info.uid);
    await setDoc(presenceRef, {
      uid: info.uid,
      username: info.username || 'Aventureiro',
      photoURL: info.photoURL || 'https://i.pinimg.com/736x/99/ea/30/99ea30f8ce9ea2ca99606755a8d56ef4.jpg',
      role: info.role || 'JOGADOR',
      lastSeen: serverTimestamp(),
      isOnline: info.isOnline !== undefined ? info.isOnline : true,
      statusText: info.statusText || 'No Menu Principal'
    }, { merge: true });
  } catch (error) {
    console.warn("Could not update presence:", error);
  }
}

/**
 * Listens in real-time to active online members in Firestore
 */
export function subscribeToOnlinePresence(callback: (users: PresenceData[]) => void) {
  try {
    const presenceCol = collection(db, 'presence');
    return onSnapshot(presenceCol, (snapshot) => {
      const users: PresenceData[] = [];
      const now = Date.now();
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as PresenceData;
        const lastSeenMs = data.lastSeen?.toMillis ? data.lastSeen.toMillis() : (data.lastSeen || 0);
        // Active within last 3 minutes or isOnline
        const isRecentlyActive = !lastSeenMs || (now - lastSeenMs) < 3 * 60 * 1000;
        if (data.isOnline && isRecentlyActive) {
          users.push({ ...data, isOnline: true });
        }
      });

      // Sort with logged user / alphabetical
      users.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
      callback(users);
    }, (error) => {
      console.warn("Presence snapshot warning:", error);
    });
  } catch (error) {
    console.warn("Error subscribing to presence:", error);
    return () => {};
  }
}

export type FileCategory = 'Sistemas' | 'Mundos' | 'Contos&Personagens';

export interface UploadedFileData {
  id: string;
  identifier: string; // e.g. "Sistemas:_Tormenta20_Regras.txt"
  displayIdentifier: string; // e.g. "Sistemas: Tormenta20_Regras.txt"
  category: FileCategory;
  fileName: string;
  content: string;
  fileSize: number;
  charCount: number;
  lineCount: number;
  uploadedBy: string;
  uploadedByName: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CampaignData {
  id?: string;
  name: string;
  system: string;
  systemVersion: string;
  systemFileId?: string;
  systemFileName?: string;
  systemFileIdentifier?: string;
  worldFileId?: string;
  worldFileName?: string;
  worldFileIdentifier?: string;
  loreFileId?: string;
  loreFileName?: string;
  loreFileIdentifier?: string;
  characterId: string;
  characterName: string;
  characterSystem: string;
  characterData?: any;
  createdBy: string;
  createdByName: string;
  status: 'active' | 'archived' | 'completed';
  narratorRulesMemory?: Array<{
    query: string;
    ruleSnippet: string;
    source: string;
    timestamp: any;
  }>;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Creates a new Campaign in Firebase Firestore
 */
export async function createCampaign(campaign: Omit<CampaignData, 'id'>): Promise<string> {
  try {
    const campaignDocRef = doc(collection(db, 'campaigns'));
    const payload: CampaignData = cleanDataForFirestore({
      ...campaign,
      id: campaignDocRef.id,
      status: campaign.status || 'active',
      narratorRulesMemory: campaign.narratorRulesMemory || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await setDoc(campaignDocRef, payload);
    return campaignDocRef.id;
  } catch (error) {
    console.error("Error creating campaign in Firebase:", error);
    throw error;
  }
}

/**
 * Subscribes in real-time to user's characters
 */
export function subscribeToUserCharacters(uid: string, callback: (characters: any[]) => void) {
  try {
    const charsCol = collection(db, 'characters');
    const q = query(charsCol, where('userId', '==', uid));
    return onSnapshot(q, (snapshot) => {
      const characters: any[] = [];
      snapshot.forEach((docSnap) => {
        characters.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(characters);
    }, (error) => {
      console.warn("Characters snapshot error:", error);
    });
  } catch (error) {
    console.warn("Error subscribing to characters:", error);
    return () => {};
  }
}

/**
 * Subscribes in real-time to user's campaigns or all global campaigns
 */
export function subscribeToCampaigns(callback: (campaigns: CampaignData[]) => void) {
  try {
    const campaignsCol = collection(db, 'campaigns');
    return onSnapshot(campaignsCol, (snapshot) => {
      const campaigns: CampaignData[] = [];
      snapshot.forEach((docSnap) => {
        campaigns.push({ id: docSnap.id, ...docSnap.data() } as CampaignData);
      });
      // Sort newest first
      campaigns.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return timeB - timeA;
      });
      callback(campaigns);
    }, (error) => {
      console.warn("Campaigns snapshot error:", error);
    });
  } catch (error) {
    console.warn("Error subscribing to campaigns:", error);
    return () => {};
  }
}

/**
 * Deletes a campaign from Firestore
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    await deleteDoc(campaignRef);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
}

/**
 * Gets a campaign by ID
 */
export async function getCampaignById(campaignId: string): Promise<CampaignData | null> {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    const snap = await getDoc(campaignRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as CampaignData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return null;
  }
}

/**
 * Gets all campaigns created by a specific user from Firestore
 */
export async function getUserCampaigns(uid: string): Promise<CampaignData[]> {
  try {
    const q = query(collection(db, 'campaigns'), where('createdBy', '==', uid));
    const querySnapshot = await getDocs(q);
    const campaigns: CampaignData[] = [];
    querySnapshot.forEach((docSnap) => {
      campaigns.push({ id: docSnap.id, ...docSnap.data() } as CampaignData);
    });
    return campaigns.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching user campaigns:", error);
    return [];
  }
}

/**
 * Uploads and stores a complete .txt file in Firebase Firestore with "Nome_do_Campo:_Nome_do_Arquivo" identification
 */
export async function uploadTextFile(params: {
  category: FileCategory;
  fileName: string;
  content: string;
  fileSize: number;
  uploadedBy?: string;
  uploadedByName?: string;
}): Promise<string> {
  try {
    const sanitizedFileName = params.fileName.trim();
    // Identification format required: "Nome_do_Campo:_Nome_do_Arquivo"
    const identifier = `${params.category}:_${sanitizedFileName}`;
    const displayIdentifier = `${params.category}: ${sanitizedFileName}`;
    
    const lines = params.content.split(/\r\n|\r|\n/);
    const charCount = params.content.length;
    const lineCount = lines.length;

    const fileDocId = `${params.category}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fileRef = doc(db, 'uploadedFiles', fileDocId);

    const payload = cleanDataForFirestore({
      id: fileDocId,
      identifier,
      displayIdentifier,
      category: params.category,
      fileName: sanitizedFileName,
      content: params.content,
      fileSize: params.fileSize,
      charCount,
      lineCount,
      uploadedBy: params.uploadedBy || auth.currentUser?.uid || 'guest',
      uploadedByName: params.uploadedByName || auth.currentUser?.displayName || 'Aventureiro',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await setDoc(fileRef, payload);
    return fileDocId;
  } catch (error) {
    console.error("Error uploading text file to Firebase:", error);
    throw error;
  }
}

/**
 * Subscribes in real-time to all uploaded files across Sistemas, Mundos, and Contos&Personagens
 */
export function subscribeToUploadedFiles(callback: (files: UploadedFileData[]) => void) {
  try {
    const filesCol = collection(db, 'uploadedFiles');
    return onSnapshot(filesCol, (snapshot) => {
      const files: UploadedFileData[] = [];
      snapshot.forEach((docSnap) => {
        files.push({ id: docSnap.id, ...docSnap.data() } as UploadedFileData);
      });
      // Sort newest first
      files.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return timeB - timeA;
      });
      callback(files);
    }, (error) => {
      console.warn("Uploaded files snapshot error:", error);
    });
  } catch (error) {
    console.warn("Error subscribing to uploaded files:", error);
    return () => {};
  }
}

/**
 * Deletes an uploaded file from Firestore
 */
export async function deleteUploadedFile(fileId: string): Promise<void> {
  try {
    const fileRef = doc(db, 'uploadedFiles', fileId);
    await deleteDoc(fileRef);
  } catch (error) {
    console.error("Error deleting uploaded file:", error);
    throw error;
  }
}

/**
 * Fetches a single uploaded file by its ID
 */
export async function getUploadedFileById(fileId: string): Promise<UploadedFileData | null> {
  try {
    const fileRef = doc(db, 'uploadedFiles', fileId);
    const snap = await getDoc(fileRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as UploadedFileData;
    }
    return null;
  } catch (error) {
    console.error("Error getting uploaded file:", error);
    return null;
  }
}

/* ==========================================================================
   GAME SESSION & REAL-TIME LOGS
   ========================================================================== */

export interface SessionMessage {
  id?: string;
  campaignId: string;
  senderUid: string;
  senderName: string;
  senderRole: 'narrator' | 'player' | 'system';
  characterName?: string;
  type: 'narrative' | 'speech' | 'action' | 'thought' | 'roll' | 'combat' | 'item' | 'system';
  content: string;
  metadata?: {
    rollFormula?: string;
    rollResult?: number;
    rollDetails?: string;
    isCrit?: boolean;
    isFumble?: boolean;
    hpChange?: number;
    mpChange?: number;
    itemUsed?: string;
    targetName?: string;
  };
  createdAt?: any;
}

/**
 * Sends a message in the active Game Session chat
 */
export async function sendSessionMessage(msg: Omit<SessionMessage, 'id'>): Promise<string> {
  try {
    const msgRef = doc(collection(db, 'campaign_messages'));
    const payload = cleanDataForFirestore({
      ...msg,
      id: msgRef.id,
      createdAt: serverTimestamp()
    });
    await setDoc(msgRef, payload);
    return msgRef.id;
  } catch (error) {
    console.error("Error sending session message:", error);
    throw error;
  }
}

/**
 * Subscribes to Game Session messages for a specific campaign in real-time
 */
export function subscribeToSessionMessages(campaignId: string, callback: (messages: SessionMessage[]) => void) {
  try {
    const q = query(
      collection(db, 'campaign_messages'),
      where('campaignId', '==', campaignId)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: SessionMessage[] = [];
      snapshot.forEach((docSnap) => {
        messages.push({ id: docSnap.id, ...docSnap.data() } as SessionMessage);
      });

      // Sort chronological (oldest first for chat feed)
      messages.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return timeA - timeB;
      });

      callback(messages);
    }, (error) => {
      console.warn("Session messages snapshot error:", error);
    });
  } catch (error) {
    console.warn("Error subscribing to session messages:", error);
    return () => {};
  }
}

/**
 * Updates character HP (PV) and MP (PM) in real time during game session
 */
export async function updateCharacterPVPM(charId: string, pvAtual: number, pmAtual: number): Promise<void> {
  try {
    const charRef = doc(db, 'characters', charId);
    await updateDoc(charRef, {
      pvAtual,
      pmAtual,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating character stats:", error);
  }
}

/**
 * Updates character inventory in real-time
 */
export async function updateCharacterInventory(charId: string, inventory: any[]): Promise<void> {
  try {
    const charRef = doc(db, 'characters', charId);
    await updateDoc(charRef, {
      inventory,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating character inventory:", error);
  }
}

export { onAuthStateChanged };
