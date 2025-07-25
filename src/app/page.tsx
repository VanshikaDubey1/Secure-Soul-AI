"use client";
import ChatAssistant from '@/components/chat-assistant';
import { useState } from 'react';

type Domain = "Mental Health" | "Legal" | "Government Schemes" | "Safety";

const domainThemes: Record<Domain, string> = {
  "Mental Health": "theme-mental-health",
  "Legal": "theme-legal",
  "Government Schemes": "theme-government",
  "Safety": "theme-safety",
};

export default function Home() {
  const [theme, setTheme] = useState(domainThemes["Mental Health"]);

  const handleThemeChange = (domain: Domain) => {
    setTheme(domainThemes[domain] || "theme-mental-health");
  }

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 transition-colors duration-500 ${theme}`}>
      <div className="w-full max-w-4xl mx-auto">
        <ChatAssistant onDomainChange={handleThemeChange} />
      </div>
    </main>
  );
}
