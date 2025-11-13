
"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatInterfaceCard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m ARBORIS AI, your plant intelligence assistant. I can help you identify plants, diagnose health issues, provide care recommendations, and answer any plant-related questions. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let partialRead = '';
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader?.read() || { done: true, value: undefined };
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split('\n');
        partialRead = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                assistantMessage.content += content;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: assistantMessage.content }
                    : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-[var(--negro-vacuo)]/60 backdrop-blur-sm border-[var(--verde-simbionte)]/30 hover:border-[var(--verde-simbionte)]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--verde-simbionte)]/20 h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-[var(--branco-estelar)]">
            <motion.div
              animate={{ 
                color: isLoading ? 'var(--ambar-evolucao)' : 'var(--verde-simbionte)',
                scale: isLoading ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                color: { duration: 0.5 },
                scale: { duration: 1, repeat: isLoading ? Infinity : 0 }
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
            </motion.div>
            AI Chat Assistant
          </CardTitle>
          <CardDescription className="text-[var(--cinza-tatico-claro)]">
            Ask questions about plants, care tips, or plant identification
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4 p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                    {/* Avatar */}
                    <motion.div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-[var(--azul-genese)]' 
                          : 'bg-gradient-to-r from-[var(--verde-simbionte)] to-[var(--magenta-exotico)]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </motion.div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-[var(--azul-genese)]/20 border border-[var(--azul-genese)]/30 text-[var(--branco-estelar)]'
                          : 'bg-[var(--verde-simbionte)]/10 border border-[var(--verde-simbionte)]/30 text-[var(--branco-estelar)]'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs text-[var(--cinza-tatico-claro)] mt-2">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[var(--verde-simbionte)] to-[var(--magenta-exotico)] flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                    <div className="bg-[var(--ambar-evolucao)]/10 border border-[var(--ambar-evolucao)]/30 rounded-lg px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 text-[var(--ambar-evolucao)] animate-spin" />
                        <span className="text-sm text-[var(--ambar-evolucao)]">
                          ARBORIS is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-[var(--cinza-tatico-escuro)]/30 px-6 py-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask ARBORIS about plants..."
                disabled={isLoading}
                className="flex-1 bg-[var(--azul-noite-profundo)]/50 border-[var(--verde-simbionte)]/30 text-[var(--branco-estelar)] placeholder-[var(--cinza-tatico-claro)] focus:border-[var(--verde-simbionte)] focus:ring-[var(--verde-simbionte)]"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-[var(--verde-simbionte)] hover:bg-[var(--verde-simbionte)]/80 text-black font-medium px-6 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--verde-simbionte)]/25"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
