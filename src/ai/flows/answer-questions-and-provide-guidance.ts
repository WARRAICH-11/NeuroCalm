'use server';

/**
 * @fileOverview An AI Brain Coach Chatbot that answers questions about mental wellness and provides personalized guidance based on user data.
 *
 * - answerQuestionsAndProvideGuidance - A function that handles user questions and provides guidance.
 * - AnswerQuestionsAndProvideGuidanceInput - The input type for the answerQuestionsAndProvideGuidance function.
 * - AnswerQuestionsAndProvideGuidanceOutput - The return type for the answerQuestionsAndProvideGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAndProvideGuidanceInputSchema = z.object({
  question: z.string().describe('The user question about mental wellness.'),
  calmIndex: z.number().describe('The user\'s current Calm Index (0-100).'),
  productivityIndex: z.number().describe('The user\'s current Productivity Index (0-100).'),
  mood: z.string().describe('The user current mood'),
  sleep: z.string().describe('The user sleep data'),
  diet: z.string().describe('The user diet data'),
  exercise: z.string().describe('The user exercise data'),
  stressors: z.string().describe('The user stressors data'),
});
export type AnswerQuestionsAndProvideGuidanceInput = z.infer<typeof AnswerQuestionsAndProvideGuidanceInputSchema>;

const AnswerQuestionsAndProvideGuidanceOutputSchema = z.object({
  answer: z.string().describe('The AI Brain Coach\'s answer to the user question, providing personalized guidance.'),
});
export type AnswerQuestionsAndProvideGuidanceOutput = z.infer<typeof AnswerQuestionsAndProvideGuidanceOutputSchema>;

export async function answerQuestionsAndProvideGuidance(input: AnswerQuestionsAndProvideGuidanceInput): Promise<AnswerQuestionsAndProvideGuidanceOutput> {
  return answerQuestionsAndProvideGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAndProvideGuidancePrompt',
  input: {schema: AnswerQuestionsAndProvideGuidanceInputSchema},
  output: {schema: AnswerQuestionsAndProvideGuidanceOutputSchema},
  prompt: `You are an AI Brain Coach designed to answer user questions about mental wellness and provide personalized guidance.

  You have access to the following information about the user:
  - Calm Index: {{{calmIndex}}}
  - Productivity Index: {{{productivityIndex}}}
  - Mood: {{{mood}}}
  - Sleep: {{{sleep}}}
  - Diet: {{{diet}}}
  - Exercise: {{{exercise}}}
  - Stressors: {{{stressors}}}

  Based on this information, answer the following question and provide personalized guidance:
  {{{question}}}
  Remember to not provide medical advice.
  Refer to rewire habits and not clinical intervention.`,
});

const answerQuestionsAndProvideGuidanceFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAndProvideGuidanceFlow',
    inputSchema: AnswerQuestionsAndProvideGuidanceInputSchema,
    outputSchema: AnswerQuestionsAndProvideGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
