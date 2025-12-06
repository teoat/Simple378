import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your fraud detection AI assistant. How can I help you today?',
      timestamp: new Date(),
      feedback: null
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('frenly-conversation');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load conversation:', e);
      }
    }
  }, []);

  // Save conversation to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      localStorage.setItem('frenly-conversation', JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (msg: string) => api.sendChatMessage(msg),
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        feedback: null
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        feedback: null
      }]);
      toast.error('Failed to send message');
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }]);
    sendMessageMutation.mutate(message);
    setMessage('');
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, feedback } : msg
    ));

    // Show toast notification
    toast.success(
      feedback === 'positive'
        ? '👍 Thanks! Frenly learns from your feedback.'
        : '👎 Thanks for the feedback. Frenly will improve!'
    );

    // TODO: Send feedback to backend
    // api.sendAIFeedback(messageId, feedback);
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your fraud detection AI assistant. How can I help you today?',
      timestamp: new Date(),
      feedback: null
    }]);
    localStorage.removeItem('frenly-conversation');
    toast.success('Conversation cleared');
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50 hover:scale-110"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[420px] flex-col rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold">Frenly AI</h3>
                <p className="text-xs text-blue-100">Your fraud detection assistant</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearConversation}
                className="rounded-full p-1 hover:bg-blue-700 focus:outline-none text-xs"
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close AI Assistant"
                className="rounded-full p-1 hover:bg-blue-700 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col',
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  )}
                >
                  {msg.content}
                </div>

                {/* Feedback Buttons (only for assistant messages) */}
                {msg.role === 'assistant' && (
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => handleFeedback(msg.id, 'positive')}
                      className={cn(
                        'p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors',
                        msg.feedback === 'positive' && 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                      )}
                      title="Helpful"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'negative')}
                      className={cn(
                        'p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors',
                        msg.feedback === 'negative' && 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      )}
                      title="Not helpful"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-xs text-slate-400 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 text-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                disabled={sendMessageMutation.isPending}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={sendMessageMutation.isPending || !message.trim()}
                aria-label="Send message"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Press Enter to send • Your conversation is saved locally
            </p>
          </div>
        </div>
      )}
    </>
  );
}
