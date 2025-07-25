"use client";
import ChatAssistant from '@/components/chat-assistant';
import { useState, useEffect } from 'react';

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
    const newTheme = domainThemes[domain] || "theme-mental-health";
    document.body.className = `font-body antialiased ${newTheme}`;
    setTheme(newTheme);
  }

  // Set initial theme on mount
  useEffect(() => {
    document.body.className = `font-body antialiased ${theme}`;
  }, [theme]);

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 transition-colors duration-500`}>
      <div className="w-full max-w-4xl mx-auto">
        <ChatAssistant onDomainChange={handleThemeChange} />
      </div>
    </main>
  );
}
