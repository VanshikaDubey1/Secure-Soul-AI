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
  prompt: `You are a helpful assistant providing information to users based on their intent and a provided knowledge base.

  Your knowledge base for the current intent is:
  {{{knowledge}}}

  Intent: {{{intent}}}
  Query: {{{query}}}
  Context: {{{context}}}

  Formulate a clear and concise answer based on the intent, query, and context. Use the provided knowledge base as the primary source of truth.
  Use plain language, short paragraphs, and bullet points for readability.
  If the user asks for links, provide them from the knowledge base. Do not make up links.
  If the knowledge base does not contain the answer, say that you do not have information on that topic.

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
