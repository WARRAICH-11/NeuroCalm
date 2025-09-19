import { z } from 'zod';

export const userProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  photoURL: z.string().url().optional(),
  bio: z.string().optional(),
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    theme: z.enum(['light', 'dark', 'system']).default('system'),
  }).optional().default({}),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const dailyCheckInSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  mood: z.number().min(1).max(5),
  energy: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  sleepQuality: z.number().min(1).max(5).optional(),
  stressLevel: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  completedTasks: z.number().optional(),
  totalTasks: z.number().optional(),
  createdAt: z.date().default(() => new Date()),
});

export type DailyCheckIn = z.infer<typeof dailyCheckInSchema>;

export const chatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.date().default(() => new Date()),
  })),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ChatSession = z.infer<typeof chatSessionSchema>;

export const supportTicketSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
  attachments: z.array(z.string()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type SupportTicket = z.infer<typeof supportTicketSchema>;
