import { useState } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';

export function AIInsightPanel() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I have analyzed your latest financial data. Currently, your burn rate is $12,500/month, giving you approximately 14 months of runway. Would you like to simulate a reduction in OpEx?' }
  ]);

  const handleSend = () => {
    if (!query.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "That's a great question. Based on the Q4 data, marketing expenses have increased by 15% month-over-month, primarily driven by the new ad campaign. However, CAC has remained stable at $45." 
      }]);
    }, 1000);
    
    setQuery('');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-1 shadow-lg h-[400px] flex flex-col">
      <div className="bg-white dark:bg-slate-900 rounded-xl h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-indigo-100 dark:border-slate-700 flex items-center gap-2 bg-indigo-50/50 dark:bg-slate-800/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">AI Financial Analyst</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini Pro</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-2xl p-3 text-sm max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your finances..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleSend}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
