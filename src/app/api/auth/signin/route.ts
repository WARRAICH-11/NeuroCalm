import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/server';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase client config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize client auth
const clientApp = initializeApp(firebaseConfig, 'client-auth');
const clientAuth = getAuth(clientApp);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let userCredential;
    try {
      // Sign in with email and password using client auth
      userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Create session cookie using server auth
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      
      const response = new NextResponse(
        JSON.stringify({ 
          status: 'success',
          user: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            emailVerified: userCredential.user.emailVerified,
          }
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
      
      // Set the session cookie
      response.cookies.set({
        name: 'session',
        value: sessionCookie,
        maxAge: expiresIn / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      
      return response;
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }
      
      return new NextResponse(
        JSON.stringify({ error: errorMessage }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      // Sign out from the client auth to prevent memory leaks
      if (userCredential) {
        await clientAuth.signOut();
      }
    }
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    let errorMessage = 'Authentication failed';
    let statusCode = 500;

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No user found with this email address';
        statusCode = 401;
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        statusCode = 401;
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed login attempts. Please try again later.';
        statusCode = 429;
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        statusCode = 403;
        break;
      default:
        console.error('Unhandled auth error:', error);
    }

    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
