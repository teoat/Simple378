import { useRef, useEffect, useState, ElementType } from 'react';
import { X, Send, Bot, MessageSquare, Scale, DollarSign, Sparkles, Mic, MicOff, FileText, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAI, Persona } from '../../context/AIContext'; // Import updateMessage

export function AIAssistant() {
  const {
    isOpen,
    setIsOpen,
    messages,
    sendMessage,
    updateMessage, // Destructure updateMessage here
    isProcessing,
    persona,
    setPersona,
    currentCaseId,
    setFeedback
  } = useAI();

  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null); // State for editing message
  const hasAutoExpandedRef = useRef(false); // Ref to track if auto-expanded recently

  const [chatWidth, setChatWidth] = useState(400); // Initial width
  const [chatHeight, setChatHeight] = useState(600); // Initial height
  const [isResizing, setIsResizing] = useState(false);
  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialChatDimensions = useRef({ width: 0, height: 0 });

  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 200;

  // Define default keyboard shortcuts
  const defaultShortcuts = useRef({
    toggleChat: { key: '/', metaKey: true, ctrlKey: false, altKey: false },
    closeChat: { key: 'Escape', metaKey: false, ctrlKey: false, altKey: false },
    // Add other shortcuts here as needed
  });

  // Load shortcuts from localStorage on component mount
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const savedShortcuts = localStorage.getItem('ai-chat-shortcuts');
      return savedShortcuts ? JSON.parse(savedShortcuts) : defaultShortcuts.current;
    } catch {
      return defaultShortcuts.current;
    }
  });

  const [isDraggingFile, setIsDraggingFile] = useState(false); // State for drag-and-drop

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    initialMousePos.current = { x: e.clientX, y: e.clientY };
    initialChatDimensions.current = { width: chatWidth, height: chatHeight };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const dx = e.clientX - initialMousePos.current.x;
      const dy = e.clientY - initialMousePos.current.y;

      const newWidth = Math.max(MIN_WIDTH, initialChatDimensions.current.width + dx);
      const newHeight = Math.max(MIN_HEIGHT, initialChatDimensions.current.height + dy);

      setChatWidth(newWidth);
      setChatHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, chatWidth, chatHeight]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingFile) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if the mouse leaves the entire chat window, not just a child element
    // This can be tricky, simple approach: always set to false when leaving any child
    // For more robust, need to check relatedTarget
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        await sendMessage(`Received file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, currentCaseId);
        // Future: Implement actual file upload to backend
      }
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Contextual Auto-expansion
  useEffect(() => {
    if (isOpen || messages.length === 0 || hasAutoExpandedRef.current) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && lastMessage.insights) {
      const criticalInsight = lastMessage.insights.find(
        insight => insight.type === 'risk' && insight.confidence >= 90
      );
      if (criticalInsight) {
        setIsOpen(true);
        hasAutoExpandedRef.current = true; // Prevent immediate re-expansion
        setTimeout(() => { hasAutoExpandedRef.current = false; }, 5000); // Cooldown
      }
    }
  }, [messages, isOpen, setIsOpen]);

  // Keyboard shortcut: Cmd/Ctrl + / to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle chat shortcut
      const toggleChatShortcut = shortcuts.toggleChat;
      if (
        (e.key === toggleChatShortcut.key || toggleChatShortcut.key === '') && // Allow empty key for combo only
        (toggleChatShortcut.metaKey === undefined || e.metaKey === toggleChatShortcut.metaKey) &&
        (toggleChatShortcut.ctrlKey === undefined || e.ctrlKey === toggleChatShortcut.ctrlKey) &&
        (toggleChatShortcut.altKey === undefined || e.altKey === toggleChatShortcut.altKey)
      ) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      // Close chat shortcut
      const closeChatShortcut = shortcuts.closeChat;
      if (
        (e.key === closeChatShortcut.key || closeChatShortcut.key === '') && // Allow empty key for combo only
        (closeChatShortcut.metaKey === undefined || e.metaKey === closeChatShortcut.metaKey) &&
        (closeChatShortcut.ctrlKey === undefined || e.ctrlKey === closeChatShortcut.ctrlKey) &&
        (closeChatShortcut.altKey === undefined || e.altKey === closeChatShortcut.altKey) &&
        isOpen
      ) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen, shortcuts]); // Add shortcuts to dependency array

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;
    const msg = inputValue;
    setInputValue('');

    if (editingMessageId !== null) {
      updateMessage(editingMessageId, msg); // Update the existing message
      setEditingMessageId(null);
    } else {
      await sendMessage(msg, currentCaseId); // Send as a new message
    }
  };

  const handleEditMessage = (messageId: number, content: string) => {
    setEditingMessageId(messageId);
    setInputValue(content);
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleQuickAnalysis = async (analysisType: string) => {
    if (!currentCaseId) {
      await sendMessage(`Please analyze this case for ${analysisType}`);
      return;
    }

    let prompt = '';
    switch (analysisType) {
      case 'patterns':
        prompt = 'Analyze transaction patterns and identify suspicious behavior';
        break;
      case 'risk':
        prompt = 'Assess overall risk level and key risk factors';
        break;
      case 'recommendations':
        prompt = 'Provide investigation recommendations and next steps';
        break;
      case 'summary':
        prompt = 'Provide a comprehensive case summary';
        break;
    }

    await sendMessage(prompt, currentCaseId);
  };

  const handleExplainWhy = (message: string, type: 'suggestion' | 'insight') => {
    alert(`Explain Why for ${type}: ${message}`);
    // Future: Implement a modal or expanded view with detailed explanation
  };

  const personas: { id: Persona; label: string; icon: ElementType; color: string }[] = [
    { id: 'analyst', label: 'Analyst', icon: Bot, color: 'bg-blue-600' },
    { id: 'legal', label: 'Legal', icon: Scale, color: 'bg-emerald-600' },
    { id: 'cfo', label: 'CFO', icon: DollarSign, color: 'bg-purple-600' },
    { id: 'investigator', label: 'Detective', icon: TrendingUp, color: 'bg-orange-600' },
  ];

  const currentPersona = personas.find(p => p.id === persona) || personas[0];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          className={cn(
            "fixed bottom-6 right-6 p-4 text-white rounded-full shadow-lg hover:opacity-90 transition-all z-50",
            currentPersona.color
          )}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col rounded-lg border shadow-2xl transition-all transform duration-200",
            currentPersona.color.replace('bg-', 'border-') + '-400', // Dynamic border color
            "dark:" + currentPersona.color.replace('bg-', 'border-') + '-700', // Dynamic dark mode border color
            "bg-white dark:bg-slate-800",
            isDraggingFile ? 'ring-4 ring-blue-500 ring-offset-2' : '' // Visual feedback for drag over
          )} 
          style={{ width: chatWidth, height: chatHeight }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          
          {/* Header */}
          <div className={cn("flex flex-col rounded-t-lg px-4 py-3 text-white transition-colors", currentPersona.color)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <currentPersona.icon className="h-5 w-5" />
                <h3 className="font-semibold">Frenly AI</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/20 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Persona Switcher */}
            <div className="flex bg-black/20 rounded-lg p-1 gap-1">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all",
                    persona === p.id 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  <p.icon className="w-3 h-3" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex flex-col space-y-2 group', // Added 'group' class here
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                   {msg.role === 'assistant' && (
                     <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px]", 
                       personas.find(p => p.id === msg.persona)?.color || currentPersona.color
                     )}>
                       {msg.persona === 'legal' ? <Scale className="w-3 h-3" /> : 
                        msg.persona === 'cfo' ? <DollarSign className="w-3 h-3" /> : 
                        <Bot className="w-3 h-3" />}
                     </div>
                   )}
                   
                   <div
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm shadow-sm relative',
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : `bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none border border-${(personas.find(p => p.id === msg.persona)?.color || currentPersona.color).replace('bg-', '')}-300 dark:border-${(personas.find(p => p.id === msg.persona)?.color || currentPersona.color).replace('bg-', '')}-700`
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {msg.role === 'assistant' && msg.insights?.length ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100 px-2 py-0.5 text-[11px]">
                          Confidence {Math.max(...msg.insights.map(i => i.confidence))}%
                        </span>
                      ) : null}
                      {msg.feedback && msg.role === 'assistant' && (
                        <span className="text-xs text-slate-500">{msg.feedback === 'positive' ? '👍 Thank you' : '👎 Noted'}</span>
                      )}
                    </div>
                    {msg.content}
                    {msg.role === 'user' && (
                        <button 
                            onClick={() => handleEditMessage(msg.timestamp, msg.content)}
                            className="absolute -top-2 -right-2 p-1 bg-slate-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                        </button>
                    )}
                  </div>
                </div>

                {/* Insights */}
                {msg.insights && msg.insights.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2">
                    {msg.insights.map((insight, iIdx) => (
                      <div
                        key={iIdx}
                        className={cn(
                          "p-3 rounded-lg border text-sm",
                          insight.type === 'risk' ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" :
                          insight.type === 'pattern' ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" :
                          insight.type === 'recommendation' ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" :
                          "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">{insight.type}</span>
                          <span className="text-xs opacity-75">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                        <div className="font-medium mb-1">{insight.title}</div>
                        <div className="text-xs opacity-90">{insight.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-8">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => sendMessage(suggestion, msg.caseId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 border border-indigo-100 transition-colors dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800"
                      >
                        <Sparkles className="w-3 h-3" />
                        {suggestion}
                      </button>
                    ))}
                    {(msg.insights || msg.suggestions) && (
                      <button
                        onClick={() => handleExplainWhy(msg.content, msg.insights ? 'insight' : 'suggestion')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 border border-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                      >
                        <Sparkles className="w-3 h-3" />
                        Explain Why
                      </button>
                    )}
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 ml-8 text-xs text-slate-500">
                    <span>Was this helpful?</span>
                    <button
                      onClick={() => setFeedback(msg.timestamp, 'positive')}
                      className={cn(
                        'px-2 py-1 rounded-md border transition-colors',
                        msg.feedback === 'positive' ? 'bg-green-50 border-green-200 text-green-700' : 'border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      👍 Yes
                    </button>
                    <button
                      onClick={() => setFeedback(msg.timestamp, 'negative')}
                      className={cn(
                        'px-2 py-1 rounded-md border transition-colors',
                        msg.feedback === 'negative' ? 'bg-red-50 border-red-200 text-red-700' : 'border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      👎 No
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex items-start gap-2">
                 <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white", currentPersona.color)}>
                   <currentPersona.icon className="w-3 h-3 animate-pulse" />
                 </div>
                 <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 dark:border-slate-700 shadow-sm">
                   <div className="flex space-x-1">
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                   </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {currentCaseId && (
            <div className="border-t border-slate-200 p-3 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleQuickAnalysis('summary')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-50"
                >
                  <FileText className="w-3 h-3" />
                  Summary
                </button>
                <button
                  onClick={() => handleQuickAnalysis('patterns')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 border border-green-100 transition-colors disabled:opacity-50"
                >
                  <TrendingUp className="w-3 h-3" />
                  Patterns
                </button>
                <button
                  onClick={() => handleQuickAnalysis('risk')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 border border-red-100 transition-colors disabled:opacity-50"
                >
                  <TrendingUp className="w-3 h-3" />
                  Risk
                </button>
                <button
                  onClick={() => handleQuickAnalysis('recommendations')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 border border-purple-100 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  Actions
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-4 bg-white dark:bg-slate-800 dark:border-slate-700 rounded-b-lg">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Ask the ${currentPersona.label}...`}
                disabled={isProcessing}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={1} // Initial rows
                style={{ minHeight: '40px', maxHeight: '120px', overflowY: 'auto' }} // Auto-resizing styles
                enterKeyHint="send"
                autoComplete="off"
                autoCapitalize="sentences"
                autoCorrect="on"
                spellCheck="true"
              />
              {recognition && (
                <button
                  onClick={handleVoiceInput}
                  disabled={isProcessing}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  className={cn(
                    "rounded-full p-2.5 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation",
                    isListening ? "bg-red-500 animate-pulse" : "bg-green-500"
                  )}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              )}
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                aria-label="Send message"
                className={cn(
                  "rounded-full p-2.5 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation",
                  currentPersona.color,
                  "focus:ring-" + currentPersona.color.replace('bg-', '')
                )}
              >
                <Send className="h-5 w-5 ml-0.5" />
              </button>
            </div>

            {/* Mobile-specific features */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 md:hidden">
              <div className="flex items-center gap-3">
                {recognition && (
                  <span className="flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    Voice enabled
                  </span>
                )}
                <span>AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                {isProcessing ? 'Thinking...' : 'Ready'}
              </div>
            </div>
          </div>

          {/* Resize Handle */}
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </>
  );
}
