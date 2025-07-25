'use server';
/**
 * @fileOverview Detects the user's emotion from their query.
 *
 * - detectEmotion - A function that detects the user's emotion from text.
 */

import {ai} from '@/ai/genkit';
import { DetectEmotionInput, DetectEmotionInputSchema, DetectEmotionOutput, DetectEmotionOutputSchema } from '@/app/schema';


export async function detectEmotion(input: DetectEmotionInput): Promise<DetectEmotionOutput> {
    return detectEmotionFlow(input);
}

const detectEmotionPrompt = ai.definePrompt({
    name: 'detectEmotionPrompt',
    input: { schema: DetectEmotionInputSchema },
    output: { schema: DetectEmotionOutputSchema },
    prompt: `Analyze the user's text to determine their emotion. The emotion must be one of: "sad", "angry", "happy", "scared", "confused", or "neutral".
    
Query: {{{query}}}
`
});

const detectEmotionFlow = ai.defineFlow(
    {
        name: 'detectEmotionFlow',
        inputSchema: DetectEmotionInputSchema,
        outputSchema: DetectEmotionOutputSchema,
    },
    async (input) => {
        const { output } = await detectEmotionPrompt(input);
        // Ensure an emotion is always returned.
        if (!output) {
            return { emotion: 'neutral' };
        }
        return output;
    }
);
