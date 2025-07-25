'use server';

import { detectUserIntent } from '@/ai/flows/detect-user-intent';
import { ragBasedResponse } from '@/ai/flows/rag-based-response';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { z } from 'zod';
import { processUserAudioInputSchema, processUserMessageInputSchema, SpeechToTextInputSchema, TranscribeAudioResponseSchema } from '@/app/schema';
import { detectEmotion } from '@/ai/flows/detect-emotion';


export async function processUserMessage(input: z.infer<typeof processUserMessageInputSchema>) {
    try {
        const validatedInput = processUserMessageInputSchema.parse(input);
        const { query, domain } = validatedInput;

        const intentResult = await detectUserIntent({ query });

        // If intent is Panic, we override the domain selection to Safety
        const finalIntent = intentResult.intent === 'Panic' ? 'Safety' : domain;
        
        const ragResult = await ragBasedResponse({
            query,
            intent: finalIntent,
            context: `User has shown interest in the ${finalIntent} domain. Reasoning for intent detection: ${intentResult.reasoning}`
        });

        return {
            response: ragResult.response,
            isEmergency: intentResult.intent === 'Panic' || !!intentResult.emergency,
        };
    } catch (error) {
        console.error("Error processing user message:", error);
        
        let errorMessage = "I'm sorry, I encountered an error and can't respond right now. Please try again later.";
        if (error instanceof z.ZodError) {
            errorMessage = "There was an issue with the data format. Please check your input.";
        } else if (error instanceof Error) {
            errorMessage = `An error occurred: ${error.message}`;
        }

        return {
            error: errorMessage,
            response: "I am having trouble processing your request. Please try again in a moment.",
            isEmergency: false,
        };
    }
}


export async function transcribeAudio(input: z.infer<typeof SpeechToTextInputSchema>) {
    try {
        const validatedInput = SpeechToTextInputSchema.parse(input);
        const sttResult = await speechToText(validatedInput);
        return TranscribeAudioResponseSchema.parse({ text: sttResult.text });
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return {
            error: "Failed to transcribe audio."
        }
    }
}


export async function processUserAudio(input: z.infer<typeof processUserAudioInputSchema>) {
    try {
        const validatedInput = processUserAudioInputSchema.parse(input);
        const { query, domain } = validatedInput;

        // 1. Intent Detection and Emotion Detection (in parallel)
        const [intentResult, emotionResult] = await Promise.all([
            detectUserIntent({ query }),
            detectEmotion({ query })
        ]);

        const { emotion } = emotionResult;

        // 2. Domain Selection
        const finalIntent = intentResult.intent === 'Panic' ? 'Safety' : domain;
        
        // 3. RAG Response (with emotion context)
        const ragResult = await ragBasedResponse({
            query,
            intent: finalIntent,
            emotion: emotion,
            context: `User has shown interest in the ${finalIntent} domain. Emotion detected: ${emotion}. Reasoning for intent detection: ${intentResult.reasoning}`
        });

        // 4. Text to Speech for the response
        const ttsResult = await textToSpeech(ragResult.response);

        return {
            response: ragResult.response,
            responseAudio: ttsResult.media, // Send audio response back to UI
            isEmergency: intentResult.intent === 'Panic' || !!intentResult.emergency,
        };

    } catch (error) {
        console.error("Error processing user audio:", error);
        let errorMessage = "I'm sorry, I couldn't process the audio. Please try again.";
        if (error instanceof Error) {
            errorMessage = `An error occurred: ${error.message}`;
        }
        return {
            error: errorMessage,
            response: "I am having trouble processing your request. Please try again in a moment.",
            isEmergency: false,
        };
    }
}
