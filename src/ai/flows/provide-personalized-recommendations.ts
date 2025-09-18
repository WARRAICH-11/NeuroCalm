'use server';
/**
 * @fileOverview Flow for generating personalized recommendations based on Calm Index and Productivity Index.
 *
 * - providePersonalizedRecommendations - A function that generates personalized recommendations.
 * - PersonalizedRecommendationsInput - The input type for the providePersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the providePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  calmIndex: z
    .number()
    .describe('The Calm Index score (0-100).'),
  productivityIndex: z
    .number()
    .describe('The Productivity Index score (0-100).'),
  userGoals: z.string().describe('The stated goals of the user.'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of personalized recommendations.'),
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function providePersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return providePersonalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are a personal brain coach. Generate personalized recommendations based on the user's Calm Index, Productivity Index, and stated goals.

Calm Index: {{{calmIndex}}}
Productivity Index: {{{productivityIndex}}}
User Goals: {{{userGoals}}}

Provide 3-5 actionable recommendations to help the user rewire habits, reduce stress, and improve focus. Return the recommendations as a list of strings.
`,
});

const providePersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'providePersonalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
