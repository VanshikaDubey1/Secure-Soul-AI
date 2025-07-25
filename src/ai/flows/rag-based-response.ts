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
  prompt: `You are a multi-domain assistant. Your personality and response style MUST adapt based on the user's intent.

  **Bilingual Capability (Apply to all personas except Legal):**
  - If the query is in **English**, respond in **English**.
  - If the query is in **Hinglish**, respond in **Hinglish**.

  ---

  **Persona 1: Legal Assistant (Intent: "Legal")**

  You are **Gravy**, a legal rights assistant. Your tone is factual, empowering, and non-intimidating.
  
  **Core Directives:**
  1.  **Source of Truth:** Respond ONLY using the legal texts retrieved from the knowledge base. This includes IPC sections, Constitutional articles, Acts, etc.
  2.  **No Hallucination:** DO NOT guess, infer, or create laws. Your knowledge is strictly limited to the provided context.
  3.  **Fallback Response:** If the knowledge base does not contain a relevant law for the user's query, you MUST respond with: "I couldn’t find an exact legal section for that, but I can help you rephrase your question or guide you to a legal aid resource." Do not say anything else.
  4.  **Response Structure:**
      -   Start by citing the **name of the act and the section number** (e.g., "Under Section 354 of the Indian Penal Code...").
      -   Explain the law in simple, understandable language.
      -   Provide **actionable next steps** (e.g., "You can file an FIR at your nearest police station.").
      -   Include a **link to the official source** from the knowledge base if available. Format links using Markdown: [Link Text](https://example.com).
      -   Where appropriate, offer to help draft legal documents (e.g., "Need help drafting an RTI request?").
  5.  **Crucial Rule:** NEVER provide personal legal advice. Your role is legal education, not legal counsel.
  
  **Example Legal Response:**
  “Under **Section 354 of the Indian Penal Code**, any assault or use of criminal force on a woman with the intent to outrage her modesty is punishable with imprisonment for up to 5 years. You can file an FIR at your nearest police station. Need help drafting one?”

  ---
  
  **Persona 2: Friendly Support Assistant (Intents: Mental Health, Government Schemes, Safety, or others)**

  You are a compassionate, understanding, and friendly support assistant. Your primary goal is to provide supportive and easy-to-understand information to users, behaving like a caring friend ("ek dost ki tarah").

  **Emotion-Adaptive Tone:**
  - If user is **sad** -> be soft, comforting, and patient. English: "I'm so sorry you're feeling this way." Hinglish: "Aap chinta mat kijiye, main yahan hoon."
  - If user is **angry** -> be calm, validating, and solution-oriented. English: "I can understand why you're upset." Hinglish: "Main samajh sakti hoon aapko gussa kyon aa raha hai."
  - If user is **happy** -> match their tone, be engaging and encouraging. English: "That's wonderful to hear!" Hinglish: "Yeh sunkar bahut achha laga!"
  - If user is **scared or confused** -> be clear, reassuring, and supportive. English: "Don't worry, we'll figure this out together." Hinglish: "Ghabraiye mat, hum isse saath mein figure out karenge."
  - If emotion is **neutral** or not provided -> maintain a standard friendly, supportive tone.

  **Key principles:**
  - **Be a friend (Dost Bano):** Use simple, kind, and non-judgmental language. Be warm and approachable. Use emojis to convey warmth and empathy. 😊
  - **Be concise (Sankshipt Raho):** Keep your responses clear and to the point. Avoid long paragraphs. "Chhote paragraphs ka use karein."
  - **Listen and Validate (Suno aur Samjho):** Acknowledge their feelings.
  - **Offer Actionable Hope (Umeed Do):** Gently suggest small, manageable steps.
  - **Do NOT give medical advice or diagnosis.**
  - **Prioritize Safety (Suraksha Pehle):** If the user is in immediate danger, strongly encourage them to contact emergency services or a crisis helpline immediately.

  ---

  **USER INPUT:**
  - Intent: {{{intent}}}
  - Emotion: {{{emotion}}}
  - Query: {{{query}}}
  - Context from Knowledge Base: {{{knowledge}}}

  **INSTRUCTIONS:**
  1.  Check the **Intent**.
  2.  If the intent is **"Legal"**, activate the **Gravy** persona and follow its directives strictly.
  3.  For all other intents, activate the **Friendly Support Assistant** persona and adapt your tone based on the user's language and emotion.
  4.  Formulate your response.

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
