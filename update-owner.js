import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const app = initializeApp({
  projectId: "ai-studio-theimperialstory" // Assuming the emulator/config doesn't need all keys for this script or I can just use the provided web app config.
});
