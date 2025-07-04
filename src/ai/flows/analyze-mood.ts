'use server';

/**
 * @fileOverview Analyzes journal entries to track user mood over time.
 *
 * - analyzeMood - A function that analyzes mood from journal entries.
 * - AnalyzeMoodInput - The input type for the analyzeMood function.
 * - AnalyzeMoodOutput - The return type for the analyzeMood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMoodInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The text content of the journal entry to analyze.'),
});
export type AnalyzeMoodInput = z.infer<typeof AnalyzeMoodInputSchema>;

const AnalyzeMoodOutputSchema = z.object({
  moodRating: z
    .number()
    .describe("An overall rating of the user's mood on a scale of 1 to 10."),
  moodKeywords: z
    .string()
    .describe(
      'A comma-separated list of keywords that reflect the mood expressed in the journal entry.'
    ),
  suggestedSolutions: z
    .string()
    .describe(
      'Personalized suggestions to improve the user\'s mood, tailored to the content of the journal entry.'
    ),
});
export type AnalyzeMoodOutput = z.infer<typeof AnalyzeMoodOutputSchema>;

export async function analyzeMood(input: AnalyzeMoodInput): Promise<AnalyzeMoodOutput> {
  return analyzeMoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMoodPrompt',
  input: {schema: AnalyzeMoodInputSchema},
  output: {schema: AnalyzeMoodOutputSchema},
  prompt: `Analyze the following journal entry and provide a mood rating from 1 to 10, mood keywords, and personalized suggestions for improvement.

Journal Entry: {{{journalEntry}}}

Output:
- Mood Rating (1-10):
- Mood Keywords (comma-separated):
- Suggested Solutions:`,
});

const analyzeMoodFlow = ai.defineFlow(
  {
    name: 'analyzeMoodFlow',
    inputSchema: AnalyzeMoodInputSchema,
    outputSchema: AnalyzeMoodOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
