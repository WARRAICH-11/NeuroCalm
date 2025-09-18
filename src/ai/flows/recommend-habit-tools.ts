'use server';

/**
 * @fileOverview A habit tool recommendation AI agent.
 *
 * - recommendHabitTools - A function that recommends habit tools.
 * - RecommendHabitToolsInput - The input type for the recommendHabitTools function.
 * - RecommendHabitToolsOutput - The return type for the recommendHabitTools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendHabitToolsInputSchema = z.object({
  mood: z.string().describe('The user\'s current mood.'),
  sleep: z.string().describe('The user\'s sleep quality.'),
  diet: z.string().describe('The user\'s dietary habits.'),
  exercise: z.string().describe('The user\'s exercise habits.'),
  stressors: z.string().describe('The user\'s current stressors.'),
  calmIndex: z.number().describe('The user\'s current calm index (0-100).'),
  productivityIndex: z
    .number()
    .describe('The user\'s current productivity index (0-100).'),
});
export type RecommendHabitToolsInput = z.infer<
  typeof RecommendHabitToolsInputSchema
>;

const RecommendHabitToolsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe(
      'A list of specific, actionable recommendations to detoxify thinking and improve mental habits.'
    ),
});
export type RecommendHabitToolsOutput = z.infer<
  typeof RecommendHabitToolsOutputSchema
>;

export async function recommendHabitTools(
  input: RecommendHabitToolsInput
): Promise<RecommendHabitToolsOutput> {
  return recommendHabitToolsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendHabitToolsPrompt',
  input: {schema: RecommendHabitToolsInputSchema},
  output: {schema: RecommendHabitToolsOutputSchema},
  prompt: `You are an AI-powered habit coach that specializes in mental wellness and productivity.

  Based on the user's self-reported data, provide a list of specific, actionable recommendations to detoxify their thinking and improve their mental habits.

  Consider the following factors:
  - Mood: {{{mood}}}
  - Sleep: {{{sleep}}}
  - Diet: {{{diet}}}
  - Exercise: {{{exercise}}}
  - Stressors: {{{stressors}}}
  - Calm Index: {{{calmIndex}}}
  - Productivity Index: {{{productivityIndex}}}

  Format your response as a list of recommendations.

  Example:
  [
    "Practice mindfulness meditation for 10 minutes daily.",
    "Reduce caffeine intake after 2 PM.",
    "Go for a 30-minute walk in nature.",
    "Practice gratitude journaling before bed.",
  ]
  `,
});

const recommendHabitToolsFlow = ai.defineFlow(
  {
    name: 'recommendHabitToolsFlow',
    inputSchema: RecommendHabitToolsInputSchema,
    outputSchema: RecommendHabitToolsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
