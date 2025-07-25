import { config } from 'dotenv';
config();

import '@/ai/flows/rag-based-response.ts';
import '@/ai/flows/detect-user-intent.ts';
import '@/ai/flows/speech-to-text.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/detect-emotion.ts';
