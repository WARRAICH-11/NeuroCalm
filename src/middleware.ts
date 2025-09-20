import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authRateLimiter, apiRateLimiter } from '@/lib/security/rate-limiter';

// Middleware runs on Edge Runtime, so we can't use Firebase Admin SDK here directly
// Instead, we'll rely on API routes for authentication

// List of public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/session',
  '/api/debug/config',
];

const PUBLIC_PATHS = ['/login', '/signup', '/', '/support', '/privacy', '/terms', '/debug'];
const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings'];

// Security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('__session')?.value;
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimiter = pathname.includes('/auth/') ? authRateLimiter : apiRateLimiter;
    const rateLimitResult = await rateLimiter.check(request);
    
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '60');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
  }
  
  // Skip middleware for public paths
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return response;
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
    return response;
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Skip auth check for public API routes
    if (PUBLIC_API_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
      return response;
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
    return response;
  }

  // For all other routes, continue to the next middleware
  return response;
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
