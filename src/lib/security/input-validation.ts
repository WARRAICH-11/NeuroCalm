import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const userIdSchema = z.string().min(1, 'User ID is required')

// Check-in validation
export const checkInSchema = z.object({
  mood: z.coerce.number().min(1, 'Mood must be at least 1').max(10, 'Mood must be at most 10'),
  sleep: z.coerce.number().min(0, 'Sleep cannot be negative').max(24, 'Sleep cannot exceed 24 hours'),
  diet: z.string().min(1, 'Diet description is required').max(500, 'Diet description too long'),
  exercise: z.string().min(1, 'Exercise description is required').max(500, 'Exercise description too long'),
  stressors: z.string().min(1, 'Stressors description is required').max(500, 'Stressors description too long'),
  userGoals: z.string().max(1000, 'User goals too long'),
})

// Chat message validation
export const chatMessageSchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000, 'Question too long'),
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
})

// Support ticket validation
export const supportTicketSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
})

// Profile update validation
export const profileUpdateSchema = z.object({
  displayName: z.string().max(100, 'Display name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  }).optional(),
})

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function sanitizeNumber(input: any): number {
  const num = Number(input)
  return isNaN(num) ? 0 : Math.max(0, Math.min(100, num)) // Clamp between 0-100
}

// Validation helper
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message),
      }
    }
    return {
      success: false,
      errors: ['Validation failed'],
    }
  }
}

// Rate limiting validation
export function validateRateLimit(
  request: NextRequest,
  limit: number,
  windowMs: number
): boolean {
  // This would integrate with your rate limiting system
  // For now, return true (implement based on your rate limiter)
  return true
}
