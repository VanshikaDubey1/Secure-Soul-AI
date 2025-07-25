"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BrainCircuit, Scale, Landmark, Shield, Send, User, Bot, AlertTriangle } from "lucide-react";
import ReactMarkdown from 'react-markdown';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import EmergencyContacts from "@/components/emergency-contacts";
import { processUserMessage } from "@/app/actions";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

type Domain = "Mental Health" | "Legal" | "Government Schemes" | "Safety";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  messages: Message[];
  isLoading: boolean;
  isEmergency: boolean;
};

const domainConfig = {
  "Mental Health": { icon: BrainCircuit, persona: "Sheny", initialMessage: "Hi, I'm Sheny. How can I help you with your mental well-being today? 😊" },
  "Legal": { icon: Scale, persona: "Gravy", initialMessage: "I'm Gravy. What legal information can I provide for you?" },
  "Government Schemes": { icon: Landmark, persona: "Aarogya", initialMessage: "I am Aarogya. How can I assist you with government schemes?" },
  "Safety": { icon: Shield, persona: "Alert", initialMessage: "This is Alert. What safety concerns can I help you with?" },
};

export default function ChatAssistant({ onDomainChange }: { onDomainChange: (domain: Domain) => void }) {
  const [selectedDomain, setSelectedDomain] = useState<Domain>("Mental Health");
  const [chatStates, setChatStates] = useState<Record<Domain, ChatState>>(() => {
    const initialState = {} as Record<Domain, ChatState>;
    for (const key in domainConfig) {
      const domain = key as Domain;
      initialState[domain] = {
        messages: [{
          id: crypto.randomUUID(),
          role: 'assistant',
          content: domainConfig[domain].initialMessage
        }],
        isLoading: false,
        isEmergency: false
      };
    }
    return initialState;
  });

  const [pendingDomain, setPendingDomain] = useState<Domain | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const currentChatState = chatStates[selectedDomain];
  const setCurrentChatState = (updater: (prevState: ChatState) => ChatState) => {
    setChatStates(prev => ({
      ...prev,
      [selectedDomain]: updater(prev[selectedDomain])
    }));
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatState.messages, currentChatState.isLoading]);

  const handleDomainSwitch = useCallback((newDomain: Domain) => {
    setSelectedDomain(newDomain);
    onDomainChange(newDomain);
    setPendingDomain(null);
  }, [onDomainChange]);
  
  const handleTabChange = (value: string) => {
    const newDomain = value as Domain;
    if (newDomain !== selectedDomain) {
      setPendingDomain(newDomain);
    }
  };

  const confirmDomainSwitch = () => {
    if (pendingDomain) {
      handleDomainSwitch(pendingDomain);
    }
  };

  const cancelDomainSwitch = () => {
    setPendingDomain(null);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setCurrentChatState(prev => ({ ...prev, isLoading: true }));
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: values.message,
    };
    setCurrentChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage] }));
    form.reset();

    try {
      const result = await processUserMessage({ query: values.message, domain: selectedDomain });
      
      if (result.error) {
        throw new Error(result.error);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.response,
      };

      if (result.isEmergency && !currentChatState.isEmergency) {
        setCurrentChatState(prev => ({ ...prev, isEmergency: true }));
      }
      
      setCurrentChatState(prev => ({ ...prev, messages: [...prev.messages, assistantMessage] }));

    } catch (error) {
        const errorMessageContent = error instanceof Error ? error.message : "I'm sorry, something went wrong. Please try again.";
        const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: errorMessageContent
        }
        setCurrentChatState(prev => ({ ...prev, messages: [...prev.messages, errorMessage] }));
        toast({
          title: "An Error Occurred",
          description: errorMessageContent,
          variant: "destructive",
        })
    } finally {
      setCurrentChatState(prev => ({ ...prev, isLoading: false }));
    }
  }

  return (
    <Card className="w-full shadow-2xl rounded-xl border-border/50 bg-card/80 backdrop-blur-sm transition-colors duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl font-bold text-foreground">SecureSoulAI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <AlertDialog open={!!pendingDomain} onOpenChange={(isOpen) => !isOpen && cancelDomainSwitch()}>
          <Tabs value={selectedDomain} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto bg-transparent p-0 gap-2">
              {Object.entries(domainConfig).map(([name, {icon: Icon, persona}]) => (
                  <TabsTrigger key={name} value={name} className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <Icon className="mr-2 h-5 w-5" />
                      {persona}
                  </TabsTrigger>
              ))}
            </TabsList>
          
            <div className="mt-4 p-4 rounded-lg bg-background/70 border border-border">
              <ScrollArea className="h-[50vh] pr-4">
                <div className="space-y-6">
                  {currentChatState.isEmergency && <EmergencyContacts />}
                  {currentChatState.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-end gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-md rounded-lg p-3 text-sm shadow-md prose prose-sm",
                          "prose-p:m-0",
                          "prose-a:text-primary hover:prose-a:text-primary/90",
                          message.role === "user"
                            ? "bg-accent text-accent-foreground rounded-br-none"
                            : "bg-card text-card-foreground rounded-bl-none"
                        )}
                      >
                         {message.role === 'assistant' ? (
                            <ReactMarkdown
                              components={{
                                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                      </div>
                      {message.role === 'user' && (
                          <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary text-secondary-foreground"><User className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                      )}
                    </div>
                  ))}
                  {currentChatState.isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="max-w-md rounded-lg p-3 text-sm shadow-md bg-card text-card-foreground rounded-bl-none">
                        <div className="flex items-center space-x-1">
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="mt-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder={`Message ${domainConfig[selectedDomain].persona}...`} {...field} disabled={currentChatState.isLoading} className="bg-card"/>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={currentChatState.isLoading} size="icon" className="shrink-0 bg-primary hover:bg-primary/90">
                      <Send className="h-5 w-5" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </Tabs>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive" />
                    Switch Assistant Persona?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                      Are you sure you want to switch to the {pendingDomain ? domainConfig[pendingDomain].persona : ''} assistant? 
                      Your current conversation will be saved, but you will start a new chat in the {pendingDomain} domain.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={cancelDomainSwitch}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDomainSwitch}>Switch</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
