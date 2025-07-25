'use server';

/**
 * @fileOverview Transcribes audio.
 *
 * - speechToText - A function that transcribes audio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SpeechToTextInput, SpeechToTextOutput } from '@/app/schema';
import { SpeechToTextInputSchema, SpeechToTextOutputSchema } from '@/app/schema';


export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const sttPrompt = ai.definePrompt({
  name: 'sttPrompt',
  input: {
    schema: z.object({
        audio: z.string()
    })
  },
  output: {
    schema: SpeechToTextOutputSchema,
  },
  prompt: `
    You are an expert at analyzing audio.
    1. Transcribe the user's words into text.
    2. Set emotion to "neutral" as a placeholder. We will detect it later.
    
    Audio:
    {{media url=audio}}
  `
});


const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (input) => {
    const { output } = await sttPrompt(input);
    if (!output) {
      return { text: "Could not transcribe audio.", emotion: "neutral" };
    }
    // Ensure emotion is set, even if the model doesn't provide it.
    if (!output.emotion) {
      output.emotion = 'neutral';
    }
    return output;
  }
);
