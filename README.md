# SecureSoulAI: Your Emotionally Intelligent AI Companion

SecureSoulAI is a next-generation, multi-domain AI assistant designed to provide empathetic, context-aware support across critical areas of life: mental health, legal rights, government schemes, and personal safety. It leverages the power of Retrieval-Augmented Generation (RAG) and advanced generative AI to deliver conversations that are not only intelligent but also emotionally attuned to the user.

![SecureSoulAI Assistant](https://placehold.co/800x400.png?text=SecureSoulAI+Interface)
*<p align="center">A preview of the domain-adaptive user interface.</p>*

---

## ✨ Key Features

- **🧠 Multi-Domain Personas**: Switch between four specialized AI assistants, each with a unique personality and knowledge base:
  - **Sheny (Mental Health)**: A compassionate friend for mental well-being conversations.
  - **Gravy (Legal Rights)**: A factual, empowering guide for legal information.
  - **Aarogya (Govt. Schemes)**: A helpful assistant for navigating government programs.
  - **Alert (Safety)**: A vigilant partner for safety concerns and emergencies.

- **🎨 Emotion-Adaptive UI**: The entire user interface, including animated backgrounds and color schemes, dynamically changes to match the emotional tone of the selected domain.

- **🌐 Bilingual (English & Hinglish)**: The assistant automatically detects whether the user is communicating in English or Hinglish and responds in the same language, ensuring a natural conversational flow.

- **🎤 Voice-Enabled Interaction**: Full support for voice input and spoken responses. The assistant can detect emotion from the user's voice tone and transcribe audio in real-time.

- **🚨 Emergency Detection**: In "Safety" mode, the AI can identify keywords indicating panic or danger, automatically displaying emergency contacts for immediate assistance.

- **🔒 Safe & Factual Responses**: Built on a Retrieval-Augmented Generation (RAG) model, the assistant provides answers based on a curated knowledge base, ensuring information is reliable and contextually appropriate, especially for sensitive legal and health topics.

---

## 🚀 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Google Gemini](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit) (The GenAI Stack for Firebase)
- **State Management**: React Hooks & Context API

---

## 🔧 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- An environment variable file (`.env`) with your `GEMINI_API_KEY`.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VanshikaDubey1/Secure-Soul-AI.git
   cd Secure-Soul-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment:**
   Create a `.env` file in the root of the project and add your Google Gemini API key:
   ```
   GEMINI_API_KEY="YOUR_API_KEY_HERE"
   ```

### Running the Application

This project uses `genkit` to run the AI flows and `next` for the frontend application.

1. **Start the Genkit server:**
   The Genkit server runs the AI flows that power the assistant.
   ```bash
   npm run genkit:watch
   ```
   This will start the server and watch for any changes in the `src/ai/` directory.

2. **Start the Next.js development server:**
   In a separate terminal, run the following command:
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Open your browser and navigate to `http://localhost:9002` (or the port specified in your terminal).

---

## 📁 Project Structure

```
.
├── src
│   ├── ai                  # All Genkit AI flows and configurations
│   │   ├── flows           # Individual AI flow definitions
│   │   └── genkit.ts       # Genkit initialization
│   ├── app                 # Next.js App Router
│   │   ├── actions.ts      # Server Actions for client-server communication
│   │   ├── schema.ts       # Zod schemas for type validation
│   │   ├── page.tsx        # Main application page
│   │   └── globals.css     # Global styles and theme definitions
│   ├── components          # Reusable React components
│   │   ├── ui              # ShadCN UI components
│   │   ├── chat-assistant.tsx # The core chat interface component
│   │   └── emergency-contacts.tsx # Emergency contact card
│   ├── hooks               # Custom React hooks (e.g., useToast)
│   └── lib                 # Utility functions
├── package.json
└── tailwind.config.ts
```

---

## 🤖 AI Architecture

The assistant's intelligence is powered by a series of interconnected Genkit flows:

1.  **Input Processing**: The app accepts either text or audio input.
    -   `speechToText`: Transcribes user audio into text.
2.  **Intent & Emotion Analysis**: The transcribed text is analyzed in parallel to understand the user's needs.
    -   `detectUserIntent`: Classifies the query into one of the four domains (Mental Health, Legal, etc.).
    -   `detectEmotion`: Detects the user's emotional state (e.g., happy, sad, angry).
3.  **Retrieval-Augmented Generation (RAG)**:
    -   `ragBasedResponse`: This is the core flow. It takes the query, intent, and emotion as input.
    -   It selects the appropriate knowledge base and persona instructions.
    -   It generates a context-aware, emotionally intelligent response in either English or Hinglish.
4.  **Audio Response**:
    -   `textToSpeech`: The final text response is converted back into natural-sounding audio for the user.
```