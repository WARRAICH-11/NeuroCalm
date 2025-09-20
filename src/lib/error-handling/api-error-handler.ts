import { NextResponse } from 'next/server'
import { errorTracker } from '@/lib/monitoring/error-tracker'

export interface ApiError {
  code: string
  message: string
  statusCode: number
  details?: any
  timestamp: string
}

export class ApiErrorHandler {
  static createError(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any
  ): ApiError {
    return {
      code,
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
    }
  }

  static handleError(error: unknown, context?: string): NextResponse {
    let apiError: ApiError

    if (error instanceof Error) {
      // Log the error for monitoring
      errorTracker.captureError(error, {
        tags: {
          component: context || 'API',
        },
        severity: 'high',
      })

      // Map common errors to API errors
      if (error.message.includes('validation')) {
        apiError = this.createError(
          'VALIDATION_ERROR',
          'Invalid input data provided',
          400,
          { originalError: error.message }
        )
      } else if (error.message.includes('unauthorized')) {
        apiError = this.createError(
          'UNAUTHORIZED',
          'Authentication required',
          401,
          { originalError: error.message }
        )
      } else if (error.message.includes('forbidden')) {
        apiError = this.createError(
          'FORBIDDEN',
          'Insufficient permissions',
          403,
          { originalError: error.message }
        )
      } else if (error.message.includes('not found')) {
        apiError = this.createError(
          'NOT_FOUND',
          'Resource not found',
          404,
          { originalError: error.message }
        )
      } else if (error.message.includes('rate limit')) {
        apiError = this.createError(
          'RATE_LIMIT_EXCEEDED',
          'Too many requests',
          429,
          { originalError: error.message }
        )
      } else {
        apiError = this.createError(
          'INTERNAL_ERROR',
          'An internal error occurred',
          500,
          { originalError: error.message }
        )
      }
    } else {
      // Handle non-Error objects
      apiError = this.createError(
        'UNKNOWN_ERROR',
        'An unknown error occurred',
        500,
        { originalError: String(error) }
      )
    }

    return NextResponse.json(
      {
        error: apiError,
        success: false,
      },
      { status: apiError.statusCode }
    )
  }

  static handleValidationError(validationErrors: string[]): NextResponse {
    const apiError = this.createError(
      'VALIDATION_ERROR',
      'Validation failed',
      400,
      { validationErrors }
    )

    return NextResponse.json(
      {
        error: apiError,
        success: false,
      },
      { status: 400 }
    )
  }

  static handleAuthError(message: string = 'Authentication failed'): NextResponse {
    const apiError = this.createError(
      'AUTH_ERROR',
      message,
      401
    )

    return NextResponse.json(
      {
        error: apiError,
        success: false,
      },
      { status: 401 }
    )
  }

  static handleNotFoundError(resource: string = 'Resource'): NextResponse {
    const apiError = this.createError(
      'NOT_FOUND',
      `${resource} not found`,
      404
    )

    return NextResponse.json(
      {
        error: apiError,
        success: false,
      },
      { status: 404 }
    )
  }

  static handleRateLimitError(retryAfter?: number): NextResponse {
    const apiError = this.createError(
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded',
      429,
      { retryAfter }
    )

    const response = NextResponse.json(
      {
        error: apiError,
        success: false,
      },
      { status: 429 }
    )

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }

    return response
  }

  static handleFirebaseError(error: any): NextResponse {
    let apiError: ApiError

    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        apiError = this.createError(
          'INVALID_CREDENTIALS',
          'Invalid email or password',
          401
        )
        break
      case 'auth/email-already-in-use':
        apiError = this.createError(
          'EMAIL_IN_USE',
          'Email address is already in use',
          409
        )
        break
      case 'auth/weak-password':
        apiError = this.createError(
          'WEAK_PASSWORD',
          'Password is too weak',
          400
        )
        break
      case 'auth/invalid-email':
        apiError = this.createError(
          'INVALID_EMAIL',
          'Invalid email address',
          400
        )
        break
      case 'auth/too-many-requests':
        apiError = this.createError(
          'TOO_MANY_REQUESTS',
          'Too many failed attempts. Please try again later.',
          429
        )
        break
      case 'auth/user-disabled':
        apiError = this.createError(
          'USER_DISABLED',
          'This account has been disabled',
          403
        )
        break
      case 'auth/network-request-failed':
        apiError = this.createError(
          'NETWORK_ERROR',
          'Network error. Please check your connection.',
          503
        )
        break
      default:
        apiError = this.createError(
          'AUTH_ERROR',
          'Authentication error occurred',
          500,
          { firebaseError: error.code }
        )
    }

    return NextResponse.json(
      {
        error: apiError,
        success: false,
      },
      { status: apiError.statusCode }
    )
  }

  static handleAIError(error: any): NextResponse {
    let apiError: ApiError

    if (error.message?.includes('rate limit')) {
      apiError = this.createError(
        'AI_RATE_LIMIT',
        'AI service rate limit exceeded. Please try again later.',
        429
      )
    } else if (error.message?.includes('quota')) {
      apiError = this.createError(
        'AI_QUOTA_EXCEEDED',
        'AI service quota exceeded. Please try again later.',
        429
      )
    } else if (error.message?.includes('timeout')) {
      apiError = this.createError(
        'AI_TIMEOUT',
        'AI service timeout. Please try again.',
        504
      )
    } else {
      apiError = this.createError(
        'AI_ERROR',
        'AI service error occurred',
        500,
        { originalError: error.message }
      )
    }

    return NextResponse.json(
      {
        error: apiError,
        success: false,
      },
      { status: apiError.statusCode }
    )
  }
}

// Utility function for wrapping API routes with error handling
export function withErrorHandling(
  handler: (request: Request) => Promise<Response>,
  context?: string
) {
  return async (request: Request): Promise<Response> => {
    try {
      return await handler(request)
    } catch (error) {
      return ApiErrorHandler.handleError(error, context)
    }
  }
}

// Utility function for handling async operations
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  context?: string
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    errorTracker.captureError(error as Error, {
      tags: {
        component: context || 'safeAsync',
      },
      severity: 'medium',
    })
    
    if (fallback !== undefined) {
      return fallback
    }
    
    return undefined
  }
}
