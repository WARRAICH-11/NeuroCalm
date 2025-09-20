import { NextResponse } from 'next/server';

export async function GET() {
  // Check server-side environment variables (without exposing sensitive data)
  const serverVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? '***SET***' : 'MISSING',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '***SET***' : 'MISSING',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? '***SET***' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    serverEnvironment: serverVars,
    timestamp: new Date().toISOString(),
  });
}
