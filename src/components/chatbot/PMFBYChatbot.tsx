"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface PMFBYChatbotProps {
    role: "farmer" | "officer";
}

export function PMFBYChatbot({ role }: PMFBYChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: role === "farmer"
                ? "Namaste! 🌾 I'm your PMFBY Assistant. I can help you with crop insurance questions and guide you through our portal. How can I help you today?"
                : "Welcome! 👋 I'm your PMFBY Assistant. I can help you with crop insurance queries, claim analysis, and portal navigation. How may I assist you?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }],
                    role,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.message },
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
                    "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
                    "hover:scale-110 hover:shadow-xl",
                    isOpen && "scale-0 opacity-0"
                )}
            >
                <MessageCircle className="h-6 w-6 text-white" />
            </Button>

            {/* Chat Panel */}
            <Card
                className={cn(
                    "fixed bottom-6 right-6 z-50 w-[380px] shadow-2xl transition-all duration-300 border-2 border-green-200 dark:border-green-800",
                    "transform origin-bottom-right",
                    isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg py-3 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 rounded-full p-1.5">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold">PMFBY Assistant</CardTitle>
                                <p className="text-xs text-green-100">Crop Insurance Help</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20 h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0">
                    <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-2",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                                            msg.role === "user"
                                                ? "bg-green-600 text-white rounded-br-sm"
                                                : "bg-muted text-foreground rounded-bl-sm"
                                        )}
                                    >
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-green-600 flex items-center justify-center">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2 justify-start">
                                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="border-t p-3 bg-card">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about PMFBY or navigation..."
                                disabled={isLoading}
                                className="flex-1 border-green-200 dark:border-green-800 focus-visible:ring-green-500"
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white px-3"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            Powered by Gemini AI • PMFBY & Portal Help Only
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
