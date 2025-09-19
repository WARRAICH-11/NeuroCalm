import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// This module is not compatible with Edge Runtime
// We'll use a singleton pattern to ensure it's only loaded in Node.js environment

let app: App | undefined;
let auth: Auth | undefined;

// Only run this code server-side
if (typeof window === 'undefined' && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines in the private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.privateKey) {
      console.error('Firebase private key is not properly configured');
    } else {
      const firebaseAdminConfig = {
        credential: cert(serviceAccount),
      };
      
      app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
      auth = getAuth(app);
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else if (typeof window === 'undefined') {
  console.warn('Firebase Admin is not configured - FIREBASE_PRIVATE_KEY is missing');
}

export { auth };
