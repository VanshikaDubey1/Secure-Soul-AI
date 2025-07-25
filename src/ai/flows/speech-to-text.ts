'use server';

/**
 * @fileOverview Transcribes audio and detects the user's emotion.
 *
 * - speechToText - A function that transcribes audio and detects emotion.
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
    You are an expert at analyzing audio and determining the user's emotion from their tone of voice.
    1. Transcribe the user's words into text.
    2. Analyze the user's tone of voice to determine their emotion. The emotion must be one of: "sad", "angry", "happy", "scared", "confused", or "neutral".
    
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
    return output!;
  }
);
