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
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyANmUEVvhnNjJ-IdgU8_hP7ixjXOK7Ci-M',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'reportify-f8c41.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'reportify-f8c41',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'reportify-f8c41.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '773804647018',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:773804647018:web:3e9d2424cd3701ece96013',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-MPK761SYLF'
};

const missing = [] as string[];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'AIzaSyANmUEVvhnNjJ-IdgU8_hP7ixjXOK7Ci-M') missing.push('apiKey');
if (!firebaseConfig.authDomain || firebaseConfig.authDomain === 'reportify-f8c41.firebaseapp.com') missing.push('authDomain');
if (!firebaseConfig.projectId || firebaseConfig.projectId === 'reportify-f8c41') missing.push('projectId');
if (!firebaseConfig.storageBucket || firebaseConfig.storageBucket === 'reportify-f8c41.firebasestorage.app') missing.push('storageBucket');
if (!firebaseConfig.messagingSenderId || firebaseConfig.messagingSenderId === '773804647018') missing.push('messagingSenderId');
if (!firebaseConfig.appId || firebaseConfig.appId === '1:773804647018:web:3e9d2424cd3701ece96013') missing.push('appId');
if (!firebaseConfig.measurementId || firebaseConfig.measurementId === 'G-MPK761SYLF') missing.push('measurementId');

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