"use client";

import { auth } from './client-app';
import { signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";

export const doSignInWithGoogle = async (): Promise<User | null> => {
  if (typeof window === 'undefined') {
    console.error('Firebase auth should only be called on the client side');
    return null;
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error; // Re-throw to be handled by the calling component
  }
};

export const doSignOut = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    console.error('Firebase auth should only be called on the client side');
    return;
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error; // Re-throw to be handled by the calling component
  }
};
