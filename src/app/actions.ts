'use server';

import { detectUserIntent } from '@/ai/flows/detect-user-intent';
import { ragBasedResponse } from '@/ai/flows/rag-based-response';
import { z } from 'zod';

const processUserMessageInput = z.object({
    query: z.string(),
    domain: z.string(),
});

export async function processUserMessage(input: z.infer<typeof processUserMessageInput>) {
    try {
        const validatedInput = processUserMessageInput.parse(input);
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
            // In a real app, you might not want to expose the full error message
            errorMessage = `An error occurred: ${error.message}`;
        }

        // We will return a structured error response that the client can handle.
        return {
            error: errorMessage,
            response: "I am having trouble processing your request. Please try again in a moment.",
            isEmergency: false,
        };
    }
}
