"use client";

import { useAgentStore } from "@/store/agent-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export function TestChat() {
  const { agent, ui, toggleTestChat } = useAgentStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with the agent's first message if the chat is empty and opened
  useEffect(() => {
    if (ui.testChatOpen && messages.length === 0 && agent.firstMessage) {
      setMessages([{ role: "assistant", content: agent.firstMessage }]);
    }
  }, [ui.testChatOpen, messages.length, agent.firstMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Optimistic UI update
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: agent.provider,
          model: agent.model,
          systemPrompt: agent.systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Failed to get response from the AI.";
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `⚠️ [Error] ${errorMessage}\n\nPlease check your backend .env file and API keys.` 
        },
      ]);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={ui.testChatOpen} onOpenChange={toggleTestChat}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 border-l border-border bg-background/95 backdrop-blur-xl">
        <SheetHeader className="p-4 border-b border-border bg-muted/30">
          <SheetTitle className="text-sm font-semibold flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            Testing: {agent.name}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === "user" ? (
                    <User className="w-3 h-3 opacity-70" />
                  ) : (
                    <Bot className="w-3 h-3 opacity-70" />
                  )}
                  <span className="text-[10px] uppercase font-bold opacity-70 tracking-wider">
                    {msg.role}
                  </span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted text-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-3 h-3 opacity-70" />
                  <span className="text-[10px] uppercase font-bold opacity-70 tracking-wider">
                    Assistant
                  </span>
                </div>
                <div className="flex items-center gap-1.5 py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground text-xs animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t border-border mt-auto">
          <div className="flex items-end gap-2 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message to test..."
              className="pr-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className={cn(
                "absolute right-1 bottom-1 w-7 h-7 rounded-md transition-all",
                input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
              )}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Using {agent.model} via OpenRouter
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
