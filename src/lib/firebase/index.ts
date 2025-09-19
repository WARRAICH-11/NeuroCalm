// Core Firebase services
export { app, auth, db, storage } from './config';

// Auth functions
export { doSignInWithGoogle, doSignOut } from './auth';

// Auth provider for React context
export { AuthProvider, useAuth } from './auth-provider';

export * from './admin';
