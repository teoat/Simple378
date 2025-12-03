import { useState } from 'react';
import { X, Send, Bot, MessageSquare } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your fraud detection AI assistant. How can I help you today?' }
  ]);

  const sendMessageMutation = useMutation({
    mutationFn: (msg: string) => api.sendChatMessage(msg),
    onSuccess: (response) => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.response 
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    sendMessageMutation.mutate(message);
    setMessage('');
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant"
              className="rounded-full p-1 hover:bg-blue-700 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
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
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
              <button
                onClick={handleSend}
                aria-label="Send message"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
