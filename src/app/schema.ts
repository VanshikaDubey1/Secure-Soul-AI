import { z } from 'zod';

export const SpeechToTextInputSchema = z.object({
  audio: z.string().describe("A base64 encoded audio string, with a data URI prefix e.g. 'data:audio/wav;base64,<encoded_data>'."),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

export const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export const TranscribeAudioResponseSchema = z.object({
    text: z.string().optional(),
    error: z.string().optional(),
});

export const processUserMessageInputSchema = z.object({
    query: z.string(),
    domain: z.string(),
});

export const processUserAudioInputSchema = z.object({
    query: z.string(),
    domain: z.string(),
});

export const DetectEmotionInputSchema = z.object({
  query: z.string().describe('The user query to analyze for emotion.'),
});
export type DetectEmotionInput = z.infer<typeof DetectEmotionInputSchema>;

export const DetectEmotionOutputSchema = z.object({
  emotion: z.enum(['sad', 'angry', 'happy', 'scared', 'confused', 'neutral']).describe('The detected emotion from the user\'s text.'),
});
export type DetectEmotionOutput = z.infer<typeof DetectEmotionOutputSchema>;
