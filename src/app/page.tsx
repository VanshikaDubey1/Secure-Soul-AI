import ChatAssistant from '@/components/chat-assistant';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl mx-auto">
        <ChatAssistant />
      </div>
    </main>
  );
}
