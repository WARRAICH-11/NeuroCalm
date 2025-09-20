import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export class CSRFProtection {
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static async generateCSRFToken(): Promise<string> {
    const token = this.generateToken()
    
    // Set the token in a secure cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: CSRF_TOKEN_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return token
  }

  static async validateCSRFToken(request: NextRequest): Promise<boolean> {
    try {
      const cookieStore = await cookies()
      const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value
      const headerToken = request.headers.get(CSRF_HEADER_NAME)

      if (!cookieToken || !headerToken) {
        return false
      }

      // Use timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(cookieToken, 'hex'),
        Buffer.from(headerToken, 'hex')
      )
    } catch (error) {
      console.error('CSRF validation error:', error)
      return false
    }
  }

  static async getCSRFToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies()
      return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
    } catch (error) {
      console.error('Error getting CSRF token:', error)
      return null
    }
  }
}

// Middleware helper for CSRF protection
export async function withCSRFProtection(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  // Skip CSRF for GET requests and public endpoints
  if (request.method === 'GET') {
    return handler(request)
  }

  const publicEndpoints = ['/api/auth/session', '/api/debug/config']
  if (publicEndpoints.some(endpoint => request.nextUrl.pathname.startsWith(endpoint))) {
    return handler(request)
  }

  const isValid = await CSRFProtection.validateCSRFToken(request)
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: 'CSRF token validation failed' }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }

  return handler(request)
}
