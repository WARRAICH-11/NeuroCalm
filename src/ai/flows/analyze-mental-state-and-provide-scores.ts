'use server';
/**
 * @fileOverview Analyzes user's daily check-in data to estimate 'Calm Index' and 'Productivity Index'.
 *
 * - analyzeMentalStateAndProvideScores - A function that handles the analysis of mental state and provides scores.
 * - MentalStateInput - The input type for the analyzeMentalStateAndProvideScores function.
 * - MentalStateOutput - The return type for the analyzeMentalStateAndProvideScores function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MentalStateInputSchema = z.object({
  mood: z.number().describe('Daily mood rating (1-10).'),
  sleep: z.number().describe('Hours of sleep last night.'),
  diet: z.string().describe('Description of daily diet.'),
  exercise: z.string().describe('Description of daily exercise.'),
  stressors: z.string().describe('Description of daily stressors.'),
});
export type MentalStateInput = z.infer<typeof MentalStateInputSchema>;

const MentalStateOutputSchema = z.object({
  calmIndex: z.number().describe('Calm Index score (0-100).'),
  productivityIndex: z.number().describe('Productivity Index score (0-100).'),
});
export type MentalStateOutput = z.infer<typeof MentalStateOutputSchema>;

export async function analyzeMentalStateAndProvideScores(input: MentalStateInput): Promise<MentalStateOutput> {
  return analyzeMentalStateAndProvideScoresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMentalStatePrompt',
  input: {schema: MentalStateInputSchema},
  output: {schema: MentalStateOutputSchema},
  prompt: `Analyze the user's daily check-in data and provide a Calm Index and Productivity Index score.

Data:
Mood: {{{mood}}}
Sleep: {{{sleep}}} hours
Diet: {{{diet}}}
Exercise: {{{exercise}}}
Stressors: {{{stressors}}}

Instructions:
1.  Consider all factors to determine the Calm Index and Productivity Index.
2.  Calm Index reflects the user's overall calmness and peace of mind.
3.  Productivity Index reflects the user's ability to focus and be productive.
4.  Both indices should be on a scale of 0-100.
5. Provide scores that are reasonable and reflect the data provided.
`,
});

const analyzeMentalStateAndProvideScoresFlow = ai.defineFlow(
  {
    name: 'analyzeMentalStateAndProvideScoresFlow',
    inputSchema: MentalStateInputSchema,
    outputSchema: MentalStateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
