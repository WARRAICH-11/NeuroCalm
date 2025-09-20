import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// This module is not compatible with Edge Runtime
// We'll use a singleton pattern to ensure it's only loaded in Node.js environment

let app: App | undefined;
let auth: Auth | undefined;

// Only run this code server-side
if (typeof window === 'undefined') {
  try {
    // Check for required environment variables
    const requiredVars = [
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing Firebase environment variables:', missingVars);
    } else {
      const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle private key formatting for Vercel
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || process.env.FIREBASE_PRIVATE_KEY,
      };

      const firebaseAdminConfig = {
        credential: cert(serviceAccount),
      };
      
      app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
      auth = getAuth(app);
      
      console.log('Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export { auth };
