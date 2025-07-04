// src/ai/flows/personalized-wellbeing-tips.ts
'use server';

/**
 * @fileOverview Provides personalized well-being tips based on user's mood and journal entries.
 *
 * - getPersonalizedWellbeingTips - A function that takes mood and journal entries as input and returns personalized well-being tips.
 * - PersonalizedWellbeingTipsInput - The input type for the getPersonalizedWellbeingTips function.
 * - PersonalizedWellbeingTipsOutput - The return type for the getPersonalizedWellbeingTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWellbeingTipsInputSchema = z.object({
  mood: z
    .number()
    .describe('The user current mood on a scale of 1 to 10, with 10 being the best possible mood.'),
  journalEntry: z.string().describe('The user journal entry.'),
});
export type PersonalizedWellbeingTipsInput = z.infer<
  typeof PersonalizedWellbeingTipsInputSchema
>;

const PersonalizedWellbeingTipsOutputSchema = z.object({
  wellbeingTips: z
    .string()
    .describe('Personalized well-being tips based on the user mood and journal entry.'),
});
export type PersonalizedWellbeingTipsOutput = z.infer<
  typeof PersonalizedWellbeingTipsOutputSchema
>;

export async function getPersonalizedWellbeingTips(
  input: PersonalizedWellbeingTipsInput
): Promise<PersonalizedWellbeingTipsOutput> {
  return personalizedWellbeingTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedWellbeingTipsPrompt',
  input: {schema: PersonalizedWellbeingTipsInputSchema},
  output: {schema: PersonalizedWellbeingTipsOutputSchema},
  prompt: `You are a mental health expert providing personalized well-being tips.

  Based on the user's current mood and journal entry, provide tailored advice on meditation and how to improve their well-being.
  The mood is on a scale of 1 to 10, where 10 is the best possible mood. The journal entry provides context on their day and feelings.

  Mood: {{{mood}}}
  Journal Entry: {{{journalEntry}}}

  Provide specific and actionable tips that the user can implement immediately.
  Make the tips encouraging and supportive.
  `,
});

const personalizedWellbeingTipsFlow = ai.defineFlow(
  {
    name: 'personalizedWellbeingTipsFlow',
    inputSchema: PersonalizedWellbeingTipsInputSchema,
    outputSchema: PersonalizedWellbeingTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
