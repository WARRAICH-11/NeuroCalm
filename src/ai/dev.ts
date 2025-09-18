import { config } from 'dotenv';
config();

import '@/ai/flows/answer-questions-and-provide-guidance.ts';
import '@/ai/flows/analyze-mental-state-and-provide-scores.ts';
import '@/ai/flows/recommend-habit-tools.ts';
import '@/ai/flows/provide-personalized-recommendations.ts';