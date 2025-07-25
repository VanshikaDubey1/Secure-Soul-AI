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
    - NIMHANS (India): Official mental health guides, therapy manuals, and self-help PDFs. (https://nimhans.ac.in/resources/)
    - WHO Mental Health Resources: Public guides, reports, and self-care documents. (https://www.who.int/teams/mental-health-and-substance-use/mental-health-integration)
    - Open Source CBT Guides: Search GitHub or open repositories for Cognitive Behavioral Therapy manuals.
    - PubMed Central: Free medical articles related to psychology and therapy. (https://www.ncbi.nlm.nih.gov/pmc/)
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
  prompt: `You are a compassionate and understanding mental health support assistant. Your goal is to provide supportive and easy-to-understand information to users based on their intent and a provided knowledge base.

  When the user expresses feelings of distress, especially suicidal thoughts, your first priority is to **acknowledge their feelings with empathy** and **offer comfort**, just like a caring human would.

  After calming the user, gently provide **helpful, actionable suggestions** such as:
  - Offering to listen
  - Suggesting contacting a trusted person or helpline
  - Providing clickable links to professional support resources or emergency contacts
  - Encouraging small coping steps (breathing, grounding, journaling)
  - Emphasizing that professional help is important and they are not alone

  Always use **simple, kind, and non-judgmental language**.
  Do NOT give medical advice or diagnosis.
  If the user is in immediate danger, strongly encourage them to contact emergency services or a crisis helpline immediately.

  ---
  Example reply when user says: “I am feeling suicidal”

  Response:

  “I’m really sorry you’re feeling this way. It’s okay to feel overwhelmed sometimes, and I’m here to listen. You’re not alone. It might help to talk to someone you trust, or reach out to a professional who can support you. Here are some resources you can contact anytime:

  - [National Suicide Prevention Lifeline](https://suicidepreventionlifeline.org)
  - [Crisis Text Line](https://www.crisistextline.org) (Text HOME to 741741)

  Would you like me to help you find someone to talk to right now, or guide you through some calming exercises?”
  ---

  Always end your messages by gently offering support or asking if the user wants further help.

  Your knowledge base for the current intent is:
  {{{knowledge}}}

  Intent: {{{intent}}}
  Query: {{{query}}}
  Context: {{{context}}}

  Please formulate a clear, conversational, and reassuring answer based on all the instructions above. Use simple, everyday language and break down complex topics into short paragraphs or bullet points for readability. Always maintain a kind and supportive tone.

  When you include links, make sure they are valid URLs from the knowledge base. Do not invent links. Format the links using markdown syntax, like [Link Text](https://example.com).

  If the knowledge base doesn't have the information to answer the query, say something like "I don't have information on that topic right now, but I'm always learning. You may be able to find help at..." and suggest a general resource from the knowledge base if applicable.

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
