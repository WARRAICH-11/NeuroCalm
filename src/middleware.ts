import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware runs on Edge Runtime, so we can't use Firebase Admin SDK here directly
// Instead, we'll rely on API routes for authentication

// List of public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/session',
];

const PUBLIC_PATHS = ['/login', '/signup', '/', '/support', '/privacy', '/terms'];
const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('__session')?.value;
  
  // Skip middleware for public paths
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // Handle protected paths
  if (PROTECTED_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    if (!sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // In a real app, you would verify the session token here
    // Since we can't use Firebase Admin in Edge Runtime, we'll verify it in API routes
    // For now, we'll just check if the token exists
    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Skip auth check for public API routes
    if (PUBLIC_API_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
      return NextResponse.next();
    }
    
    // For protected API routes, we'll just check if a session token exists
    // The actual verification will happen in the API route handlers
    if (!sessionToken) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'No session token provided'
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Continue to the API route where the token will be verified
    return NextResponse.next();
  }

  // For all other routes, continue to the next middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
