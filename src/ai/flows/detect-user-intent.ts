'use server';

/**
 * @fileOverview Detects the user's intent from their query.
 *
 * - detectUserIntent - A function that detects the user's intent.
 * - DetectUserIntentInput - The input type for the detectUserIntent function.
 * - DetectUserIntentOutput - The return type for the detectUserIntent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectUserIntentInputSchema = z.object({
  query: z.string().describe('The user query to analyze.'),
});
export type DetectUserIntentInput = z.infer<typeof DetectUserIntentInputSchema>;

const DetectUserIntentOutputSchema = z.object({
  intent: z
    .enum(['Mental Health', 'Legal', 'Government Schemes', 'Safety', 'Panic'])
    .describe('The identified intent of the user query.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the intent classification.'),
  emergency: z
    .boolean()
    .optional()
    .describe('True if the query indicates an emergency situation.'),
});
export type DetectUserIntentOutput = z.infer<typeof DetectUserIntentOutputSchema>;

export async function detectUserIntent(input: DetectUserIntentInput): Promise<DetectUserIntentOutput> {
  return detectUserIntentFlow(input);
}

const detectUserIntentPrompt = ai.definePrompt({
  name: 'detectUserIntentPrompt',
  input: {schema: DetectUserIntentInputSchema},
  output: {schema: DetectUserIntentOutputSchema},
  prompt: `You are an AI assistant that analyzes user queries to determine their intent.
  Your possible intents are: Mental Health, Legal, Government Schemes, Safety, and Panic.

  Analyze the following query and determine the user's intent. Provide a brief reasoning for your classification.

  Query: {{{query}}}

  {{#if (includes query "panic", "emergency", "urgent", "help")}}
  Also, detect if the user's query indicates an emergency situation (panic, immediate danger, etc.).  If so, set the 'emergency' field to true.
  {{/if}}

  Format your response as a JSON object with 'intent' and 'reasoning' fields.  If you detect an emergency, include the 'emergency' field as well.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const detectUserIntentFlow = ai.defineFlow(
  {
    name: 'detectUserIntentFlow',
    inputSchema: DetectUserIntentInputSchema,
    outputSchema: DetectUserIntentOutputSchema,
  },
  async input => {
    const {output} = await detectUserIntentPrompt(input);
    return output!;
  }
);
