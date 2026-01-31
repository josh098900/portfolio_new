'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_INPUT_LENGTH = 500;

/**
 * Pixel-styled AI Chatbot Modal component
 */
export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim().slice(0, MAX_INPUT_LENGTH),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (data.response) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch {
      setError('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= MAX_INPUT_LENGTH) {
      setInput(e.target.value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Chat Window */}
      <div className="relative w-full max-w-md h-[500px] bg-pixel-dark border-4 border-pixel-primary flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] animate-fade-in">
        {/* Header */}
        <div className="bg-pixel-primary px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="font-pixel text-pixel-dark text-xs">JOSH&apos;S AI ASSISTANT</span>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-pixel-dark text-xs hover:text-pixel-light transition-colors"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border-b-2 border-red-500 px-4 py-2">
            <p className="font-pixel text-red-400 text-xs">{error}</p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">👋</span>
              <p className="font-pixel text-pixel-light text-xs">
                Hi! I&apos;m Josh&apos;s AI assistant.
              </p>
              <p className="font-pixel text-pixel-light/60 text-xs mt-2">
                Ask me about his skills, projects, or experience!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 font-pixel text-xs ${
                  message.role === 'user'
                    ? 'bg-pixel-primary text-pixel-dark'
                    : 'bg-pixel-secondary/20 text-pixel-light border-2 border-pixel-secondary/40'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-pixel-secondary/20 text-pixel-light border-2 border-pixel-secondary/40 px-3 py-2">
                <span className="font-pixel text-xs animate-pulse">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 border-t-2 border-pixel-primary/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything..."
              className="flex-1 bg-pixel-dark border-2 border-pixel-primary/50 px-3 py-2 font-pixel text-xs text-pixel-light placeholder:text-pixel-light/40 focus:outline-none focus:border-pixel-primary"
              disabled={isLoading}
              maxLength={MAX_INPUT_LENGTH}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-pixel-primary border-2 border-pixel-dark px-3 md:px-4 py-2 font-pixel text-xs text-pixel-dark hover:bg-pixel-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
            >
              <span className="hidden sm:inline">SEND</span>
              <span className="sm:hidden">➤</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
