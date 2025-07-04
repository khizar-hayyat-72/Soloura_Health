// src/ai/flows/analyze-mood-trend.ts
'use server';
/**
 * @fileOverview Analyzes mood trends over a short period.
 *
 * - analyzeMoodTrend - A function that analyzes mood trends from recent entries.
 * - AnalyzeMoodTrendInput - The input type for the analyzeMoodTrend function.
 * - AnalyzeMoodTrendOutput - The return type for the analyzeMoodTrend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodEntrySchema = z.object({
  date: z.string().describe("The date of the mood entry (e.g., 'MMM d, yyyy')"),
  moodRating: z.number().describe("The mood rating on a scale of 1 to 10"),
});

const AnalyzeMoodTrendInputSchema = z.object({
  recentMoods: z
    .array(MoodEntrySchema)
    .min(1)
    .describe('An array of recent mood entries, typically the last 5-7 days, sorted from oldest to newest.'),
});
export type AnalyzeMoodTrendInput = z.infer<typeof AnalyzeMoodTrendInputSchema>;

const AnalyzeMoodTrendOutputSchema = z.object({
  trendAnalysis: z
    .string()
    .describe(
      "A textual analysis of the user's mood trend based on the provided recent mood entries."
    ),
});
export type AnalyzeMoodTrendOutput = z.infer<typeof AnalyzeMoodTrendOutputSchema>;

export async function analyzeMoodTrend(input: AnalyzeMoodTrendInput): Promise<AnalyzeMoodTrendOutput> {
  return analyzeMoodTrendFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMoodTrendPrompt',
  input: {schema: AnalyzeMoodTrendInputSchema},
  output: {schema: AnalyzeMoodTrendOutputSchema},
  prompt: `You are a supportive AI assistant. Analyze the user's mood trend from the following list of mood ratings over the last few days.
The ratings are on a scale of 1 to 10, where 1 is very low and 10 is excellent.
The entries are sorted from oldest to newest.

Describe if the mood is generally improving, declining, stable, or fluctuating. Provide a brief, encouraging, and insightful summary (2-3 sentences).

Recent Mood Entries:
{{#each recentMoods}}
- Date: {{{date}}}, Mood: {{{moodRating}}}/10
{{/each}}

Trend Analysis:`,
});

const analyzeMoodTrendFlow = ai.defineFlow(
  {
    name: 'analyzeMoodTrendFlow',
    inputSchema: AnalyzeMoodTrendInputSchema,
    outputSchema: AnalyzeMoodTrendOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
