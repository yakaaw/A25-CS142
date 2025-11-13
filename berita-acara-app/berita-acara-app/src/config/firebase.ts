import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Load Firebase config from env variables (recommended) or fall back to placeholders.
// Set these in a `.env` file at the project root (not committed):
// REACT_APP_FIREBASE_API_KEY=...
// REACT_APP_FIREBASE_AUTH_DOMAIN=...
// REACT_APP_FIREBASE_PROJECT_ID=...
// REACT_APP_FIREBASE_STORAGE_BUCKET=...
// REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
// REACT_APP_FIREBASE_APP_ID=...
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'YOUR_APP_ID'
};

const missing = [] as string[];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') missing.push('apiKey');
if (!firebaseConfig.authDomain || firebaseConfig.authDomain === 'YOUR_AUTH_DOMAIN') missing.push('authDomain');
if (!firebaseConfig.projectId || firebaseConfig.projectId === 'YOUR_PROJECT_ID') missing.push('projectId');
if (!firebaseConfig.storageBucket || firebaseConfig.storageBucket === 'YOUR_STORAGE_BUCKET') missing.push('storageBucket');
if (!firebaseConfig.messagingSenderId || firebaseConfig.messagingSenderId === 'YOUR_MESSAGING_SENDER_ID') missing.push('messagingSenderId');
if (!firebaseConfig.appId || firebaseConfig.appId === 'YOUR_APP_ID') missing.push('appId');

if (missing.length > 0) {
  // Keep this as a console warning only so local dev can still boot — but remind the developer
  // to provide actual values for full Firebase functionality.
  // eslint-disable-next-line no-console
  console.warn('[firebase] Missing config keys:', missing.join(', '), ' — set REACT_APP_FIREBASE_* in .env');
}

const app = initializeApp(firebaseConfig as any);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
