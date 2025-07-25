'use server';

/**
 * @fileOverview RAG (Retrieval-Augmented Generation) flow for providing answers based on user intent and a knowledge base.
 *
 * - ragBasedResponse - A function that takes user query and intent to retrieve relevant information and generate a response.
 * - RagBasedResponseInput - The input type for the ragBasedResponse function.
 * - RagBasedResponseOutput - The return type for the ragBasedResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const knowledgeBase = {
  "Mental Health": `
    - NIMHANS (India): https://nimhans.ac.in/resources/ - Official mental health guides, therapy manuals, and self-help PDFs.
    - WHO Mental Health Resources: https://www.who.int/teams/mental-health-and-substance-use/mental-health-integration - Public guides, reports, and self-care documents.
    - Open Source CBT Guides: Search GitHub or open repositories for Cognitive Behavioral Therapy manuals.
    - PubMed Central: https://www.ncbi.nlm.nih.gov/pmc/ - Free medical articles related to psychology and therapy.
    - National Suicide Prevention Lifeline (US): https://suicidepreventionlifeline.org
    - Crisis Text Line (US): https://www.crisistextline.org (Text HOME to 741741)
  `,
  "Legal": `
    - India:
      - Indian Penal Code (IPC)
      - Ministry of Law and Justice: https://legislative.gov.in/
      - RTI Act documents: https://rti.gov.in/
      - Consumer Protection Act
    - United States:
      - Cornell Law School’s Legal Information Institute: https://www.law.cornell.edu/
      - USA.gov legal topics: https://www.usa.gov/legal
    - Open Data Portals:
      - India: https://data.gov.in/
      - US: https://www.data.gov/
  `,
  "Government Schemes": `
    - India:
      - Official Government Portals: https://india.gov.in/
      - PMO India schemes: https://pmindia.gov.in/en/
      - State government scheme portals
    - United States:
      - Benefits.gov — database of government benefits
      - Medicaid, Medicare official documents
      - Social Security Administration resources: https://www.ssa.gov/
  `,
  "Safety": `
    - India:
      - National Crime Records Bureau (NCRB) Reports
      - Ministry of Home Affairs advisories
      - Helpline numbers lists from govt portals
    - United States:
      - FEMA guides and public safety PDFs
      - Local police & emergency services documentation
      - National Domestic Violence Hotline resources
  `,
};


const RagBasedResponseInputSchema = z.object({
  query: z.string().describe('The user query.'),
  intent: z.string().describe('The detected user intent.'),
  emotion: z.string().optional().describe('The detected emotion from the user\'s voice (e.g., "sad", "angry", "happy").'),
  context: z.string().optional().describe('Additional context to refine the answer.'),
});
export type RagBasedResponseInput = z.infer<typeof RagBasedResponseInputSchema>;

const RagBasedResponseOutputSchema = z.object({
  response: z.string().describe('The AI generated response based on the user query, intent, and knowledge base.'),
});
export type RagBasedResponseOutput = z.infer<typeof RagBasedResponseOutputSchema>;

export async function ragBasedResponse(input: RagBasedResponseInput): Promise<RagBasedResponseOutput> {
  return ragBasedResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ragBasedResponsePrompt',
  input: {schema: RagBasedResponseInputSchema.extend({ knowledge: z.string() })},
  output: {schema: RagBasedResponseOutputSchema},
  prompt: `You are a compassionate, understanding, and friendly support assistant. Your goal is to provide supportive and easy-to-understand information to users, behaving like a caring friend.
  You MUST adapt your tone based on the user's detected emotion.

  - If user is **sad** -> be soft, comforting, and patient.
  - If user is **angry** -> be calm, validating, and solution-oriented.
  - If user is **happy** -> match their tone, be engaging and encouraging.
  - If user is **scared or confused** -> be clear, reassuring, and supportive.
  - If emotion is **neutral** or not provided -> maintain a standard friendly, supportive tone.

  When the user expresses feelings of distress, especially suicidal thoughts, your first priority is to **acknowledge their feelings with empathy** and **offer comfort**.

  After calming the user, gently provide **helpful, actionable suggestions**. Use the provided knowledge base to find relevant resources, but present them naturally within the conversation. **Do not just list resources.** Instead, weave them into your supportive message. Be creative and vary your responses.

  Key principles:
  - **Be a friend:** Use simple, kind, and non-judgmental language. Be warm and approachable. Use emojis to convey warmth and empathy. 😊
  - **Be concise:** Keep your responses clear and to the point. Avoid long paragraphs.
  - **Listen and Validate:** Acknowledge their feelings. Phrases like "I'm here for you," "That sounds really tough," or "It's okay to feel this way" can be very powerful.
  - **Offer Actionable Hope:** Gently suggest small, manageable steps. This could be talking to a trusted person, trying a calming exercise, or reaching out to a helpline if they feel ready.
  - **Do NOT give medical advice or diagnosis.**
  - **Prioritize Safety:** If the user is in immediate danger, strongly encourage them to contact emergency services or a crisis helpline immediately.

  ---
  Example reply when user says: “I am feeling suicidal” (Emotion: sad)

  Response:

  “I’m really sorry you’re feeling this way. It sounds incredibly difficult, and I want you to know I'm here to listen. You're not alone in this. Sometimes just talking to someone can make a difference. If you feel up to it, you could reach out to a professional who can support you. There are some really great people at the [National Suicide Prevention Lifeline](https://suicidepreventionlifeline.org) who are available to chat 24/7.

  No pressure at all, but would you like me to help you think of some calming exercises, or just talk for a bit? ❤️”
  ---

  Always end your messages by gently offering continued support. Your primary goal is to make the user feel heard, supported, and less alone.

  Your knowledge base for the current intent is:
  {{{knowledge}}}

  Intent: {{{intent}}}
  Emotion: {{{emotion}}}
  Query: {{{query}}}
  Context: {{{context}}}

  Please formulate a clear, conversational, and reassuring answer based on all the instructions above. Use simple, everyday language and break down complex topics. Always maintain a kind and supportive tone adapted to the user's emotion.

  When you include links, make sure they are valid URLs from the knowledge base and format them using markdown, like [Link Text](https://example.com).

  If the knowledge base doesn't have the information to answer the query, say something like "I'm not too sure about that, but I'm here to listen. We could try to find some information together from a reliable source if you'd like."

  Response:`,
});

const ragBasedResponseFlow = ai.defineFlow(
  {
    name: 'ragBasedResponseFlow',
    inputSchema: RagBasedResponseInputSchema,
    outputSchema: RagBasedResponseOutputSchema,
  },
  async input => {
    const knowledge = knowledgeBase[input.intent as keyof typeof knowledgeBase] || "No information found for this domain.";
    const {output} = await prompt({...input, knowledge});
    return output!;
  }
);
