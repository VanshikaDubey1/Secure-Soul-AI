'use server';

/**
 * @fileOverview Transcribes audio and detects the user's emotion.
 *
 * - speechToText - A function that transcribes audio and detects emotion.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SpeechToTextInputSchema = z.object({
  audio: z.string().describe("A base64 encoded audio string, with a data URI prefix e.g. 'data:audio/wav;base64,<encoded_data>'."),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

export const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
  emotion: z.enum(['sad', 'angry', 'happy', 'scared', 'confused', 'neutral']).describe('The detected emotion from the user\'s tone.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


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
