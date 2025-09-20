import { z } from 'zod'
import { ApiErrorHandler } from '@/lib/error-handling/api-error-handler'

// Enhanced validation schemas with better error messages
export const enhancedSchemas = {
  // User authentication
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Daily check-in validation
  mood: z.coerce.number()
    .min(1, 'Mood must be at least 1')
    .max(10, 'Mood must be at most 10')
    .int('Mood must be a whole number'),

  sleep: z.coerce.number()
    .min(0, 'Sleep cannot be negative')
    .max(24, 'Sleep cannot exceed 24 hours')
    .multipleOf(0.5, 'Sleep must be in 30-minute increments'),

  textField: z.string()
    .min(1, 'This field is required')
    .max(500, 'Text is too long')
    .transform((val) => val.trim()),

  // Chat validation
  chatMessage: z.string()
    .min(1, 'Message is required')
    .max(1000, 'Message is too long')
    .transform((val) => val.trim()),

  // Profile validation
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name is too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Display name contains invalid characters')
    .transform((val) => val.trim()),

  bio: z.string()
    .max(500, 'Bio is too long')
    .transform((val) => val.trim())
    .optional(),

  // Support ticket validation
  supportSubject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject is too long')
    .transform((val) => val.trim()),

  supportMessage: z.string()
    .min(1, 'Message is required')
    .max(2000, 'Message is too long')
    .transform((val) => val.trim()),
}

// Composite schemas
export const schemas = {
  // Authentication
  signIn: z.object({
    email: enhancedSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  signUp: z.object({
    email: enhancedSchemas.email,
    password: enhancedSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  // Daily check-in
  dailyCheckIn: z.object({
    mood: enhancedSchemas.mood,
    sleep: enhancedSchemas.sleep,
    diet: enhancedSchemas.textField,
    exercise: enhancedSchemas.textField,
    stressors: enhancedSchemas.textField,
    userGoals: z.string().max(1000, 'Goals are too long').optional(),
  }),

  // Chat
  chatMessage: z.object({
    question: enhancedSchemas.chatMessage,
    checkInData: z.object({
      mood: z.number(),
      sleep: z.number(),
      diet: z.string(),
      exercise: z.string(),
      stressors: z.string(),
    }),
    scores: z.object({
      calmIndex: z.number(),
      productivityIndex: z.number(),
    }),
  }),

  // Profile
  profileUpdate: z.object({
    displayName: enhancedSchemas.displayName.optional(),
    bio: enhancedSchemas.bio,
    preferences: z.object({
      emailNotifications: z.boolean().optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
    }).optional(),
  }),

  // Support
  supportTicket: z.object({
    name: enhancedSchemas.displayName,
    email: enhancedSchemas.email,
    subject: enhancedSchemas.supportSubject,
    message: enhancedSchemas.supportMessage,
  }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1, 'Page must be at least 1').max(1000, 'Page number too high'),
    limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100'),
  }),
}

// Validation utility functions
export class SchemaValidator {
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.parse(data)
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => {
          const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
          return `${path}${err.message}`
        })
        
        // Log validation errors for monitoring
        if (context) {
          console.warn(`Validation failed for ${context}:`, errors)
        }
        
        return { success: false, errors }
      }
      
      return { success: false, errors: ['Validation failed'] }
    }
  }

  static validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): T {
    const result = this.validate(schema, data, context)
    
    if (!result.success) {
      throw new Error(`Validation failed: ${result.errors.join(', ')}`)
    }
    
    return result.data
  }

  static validateFormData<T>(
    schema: z.ZodSchema<T>,
    formData: FormData,
    context?: string
  ): T {
    const data = Object.fromEntries(formData.entries())
    return this.validateRequest(schema, data, context)
  }

  static validateJSON<T>(
    schema: z.ZodSchema<T>,
    json: string,
    context?: string
  ): T {
    try {
      const data = JSON.parse(json)
      return this.validateRequest(schema, data, context)
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  }
}

// Sanitization functions
export class DataSanitizer {
  static sanitizeString(input: string, maxLength: number = 1000): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, maxLength)
  }

  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase()
  }

  static sanitizeNumber(input: any, min: number = 0, max: number = 100): number {
    const num = Number(input)
    if (isNaN(num)) return min
    return Math.max(min, Math.min(max, num))
  }

  static sanitizeHTML(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = {} as T
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key as keyof T] = this.sanitizeString(value) as T[keyof T]
      } else if (typeof value === 'number') {
        sanitized[key as keyof T] = this.sanitizeNumber(value) as T[keyof T]
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key as keyof T] = this.sanitizeObject(value) as T[keyof T]
      } else {
        sanitized[key as keyof T] = value
      }
    }
    
    return sanitized
  }
}

// Rate limiting validation
export class RateLimitValidator {
  private static limits = new Map<string, { count: number; resetTime: number }>()

  static checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const limit = this.limits.get(key)

    if (!limit || limit.resetTime < now) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      }
    }

    if (limit.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: limit.resetTime,
      }
    }

    limit.count++
    return {
      allowed: true,
      remaining: maxRequests - limit.count,
      resetTime: limit.resetTime,
    }
  }

  static cleanup(): void {
    const now = Date.now()
    for (const [key, limit] of this.limits.entries()) {
      if (limit.resetTime < now) {
        this.limits.delete(key)
      }
    }
  }
}

// Cleanup expired rate limits every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    RateLimitValidator.cleanup()
  }, 5 * 60 * 1000)
}
