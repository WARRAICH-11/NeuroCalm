import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = '__session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days in seconds

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // Create the session cookie. This will also verify the ID token.
    const sessionCookie = await auth.createSessionCookie(idToken, { 
      expiresIn 
    });

    // Create response with session cookie
    const response = new NextResponse(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${SESSION_COOKIE_NAME}=${sessionCookie}; Max-Age=${SESSION_MAX_AGE}; Path=/; ${
          process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
        }HttpOnly; SameSite=Lax`
      },
    });

    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create session' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE() {
  try {
    // Clear the session cookie
    const response = new NextResponse(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${
          process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
        }HttpOnly; SameSite=Lax`
      },
    });

    return response;
  } catch (error) {
    console.error('Error deleting session:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ authenticated: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the session cookie
    await auth.verifySessionCookie(session, true);
    
    return new NextResponse(
      JSON.stringify({ authenticated: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Clear invalid session
    const response = new NextResponse(
      JSON.stringify({ authenticated: false }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${
            process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
          }HttpOnly; SameSite=Lax`
        },
      }
    );
    
    return response;
  }
}
