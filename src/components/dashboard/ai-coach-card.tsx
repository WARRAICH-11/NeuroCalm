"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, Send, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import type { ChatMessage } from "@/lib/types";

interface AiCoachCardProps {
  chatHistory: ChatMessage[];
  onSubmit: (question: string) => void;
  isPending: boolean;
}

export default function AiCoachCard({
  chatHistory,
  onSubmit,
  isPending,
}: AiCoachCardProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isPending) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <Card className="flex flex-col h-[280px] xxs:h-[320px] xs:h-[400px] sm:h-[500px] compact-mobile-card">
      <CardHeader className="pb-2 xxs:pb-2 xs:pb-3">
        <CardTitle className="text-sm xxs:text-base xs:text-lg sm:text-xl">AI Brain Coach</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-1 xxs:gap-2 xs:gap-3 sm:gap-4 overflow-hidden p-3 xxs:p-4 xs:p-6">
        <ScrollArea className="flex-grow pr-1 xxs:pr-1 xs:pr-2 sm:pr-4" ref={scrollAreaRef}>
          <div className="space-y-1 xxs:space-y-2 xs:space-y-3 sm:space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                  className={cn(
                    "flex items-start gap-1 xxs:gap-1.5 xs:gap-2 sm:gap-3",
                    message.role === "user" ? "justify-end" : ""
                  )}
                >
                {message.role === "assistant" && (
                  <Avatar className="h-4 w-4 xxs:h-5 xxs:w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-2 w-2 xxs:h-2.5 xxs:w-2.5 xs:h-3 xs:w-3 sm:h-5 sm:w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg px-1.5 xxs:px-2 xs:px-3 py-1 xxs:py-1.5 xs:py-2 max-w-[92%] xxs:max-w-[90%] xs:max-w-[85%] sm:max-w-sm",
                    message.role === "assistant"
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <p className="text-[9px] xxs:text-[10px] xs:text-xs sm:text-sm leading-relaxed compact-mobile-text">{message.content}</p>
                </div>
                 {message.role === "user" && (
                  <Avatar className="h-4 w-4 xxs:h-5 xxs:w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback>
                        <User className="h-2 w-2 xxs:h-2.5 xxs:w-2.5 xs:h-3 xs:w-3 sm:h-5 sm:w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isPending && chatHistory[chatHistory.length - 1]?.role === "user" && (
               <div className="flex items-start gap-1.5 xs:gap-2 sm:gap-3">
                 <Avatar className="h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-5 sm:w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-2 xs:px-3 py-1.5 xs:py-2 bg-muted flex items-center">
                    <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 animate-spin text-muted-foreground" />
                  </div>
               </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex gap-1.5 xs:gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach..."
            disabled={isPending}
            className="text-xs xs:text-sm sm:text-base h-8 xs:h-9 sm:h-10"
          />
          <Button type="submit" disabled={isPending || !input.trim()} size="sm" className="px-2 xs:px-3 h-8 xs:h-9 sm:h-10">
            {isPending ? <Loader2 className="h-3 w-3 xs:h-4 xs:w-4 animate-spin" /> : <Send className="h-3 w-3 xs:h-4 xs:w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
