import { z } from 'zod';

export const SpeechToTextInputSchema = z.object({
  audio: z.string().describe("A base64 encoded audio string, with a data URI prefix e.g. 'data:audio/wav;base64,<encoded_data>'."),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

export const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
  emotion: z.enum(['sad', 'angry', 'happy', 'scared', 'confused', 'neutral']).describe('The detected emotion from the user\'s tone.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export const processUserMessageInputSchema = z.object({
    query: z.string(),
    domain: z.string(),
});

export const processUserAudioInputSchema = z.object({
    audio: z.string(),
    domain: z.string(),
});
