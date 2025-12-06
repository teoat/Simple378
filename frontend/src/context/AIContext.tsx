import { createContext, useContext, useState, ReactNode } from 'react';
import { apiRequest } from '../lib/api';

export type Persona = 'analyst' | 'legal' | 'cfo';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  persona?: Persona;
  timestamp: number;
  suggestions?: string[];
  caseId?: string;
  insights?: CaseInsight[];
}

export interface CaseInsight {
  type: 'pattern' | 'risk' | 'recommendation' | 'evidence';
  title: string;
  description: string;
  confidence: number;
  data?: any;
}

interface AIChatResponse {
  response: string;
  persona: Persona;
  suggestions?: string[];
  insights?: CaseInsight[];
}

interface CaseAnalysis {
  summary: string;
  keyFindings: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: string[];
  };
  recommendations: string[];
  patterns: {
    type: string;
    description: string;
    transactions: any[];
  }[];
}

interface AIContextType {
  persona: Persona;
  setPersona: (p: Persona) => void;
  messages: Message[];
  sendMessage: (content: string, caseId?: string) => Promise<void>;
  analyzeCase: (caseId: string) => Promise<CaseAnalysis>;
  isProcessing: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  clearHistory: () => void;
  currentCaseId?: string;
  setCurrentCaseId: (caseId?: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>('analyst');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Frenly AI, your intelligent fraud investigation assistant. I can help analyze cases, identify patterns, and provide recommendations. Select a persona above or ask me about a specific case.",
      persona: 'analyst',
      timestamp: Date.now(),
      suggestions: ["Analyze case patterns", "Review risk factors", "Suggest next steps"]
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState<string | undefined>();

  const sendMessage = async (content: string, caseId?: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
      caseId: caseId || currentCaseId
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await apiRequest<AIChatResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: content,
          persona,
          caseId: caseId || currentCaseId
        })
      });

      const aiMsg: Message = {
        role: 'assistant',
        content: response.response,
        persona: response.persona,
        timestamp: Date.now(),
        suggestions: response.suggestions,
        insights: response.insights,
        caseId: caseId || currentCaseId
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error connecting to the AI service. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeCase = async (caseId: string): Promise<CaseAnalysis> => {
    try {
      const response = await apiRequest<CaseAnalysis>(`/cases/${caseId}/ai-analysis`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Case analysis error:', error);
      throw new Error('Failed to analyze case');
    }
  };

  const clearHistory = () => {
    setMessages([{ 
      role: 'assistant', 
      content: `Switched to ${persona} mode. How can I help?`, 
      persona,
      timestamp: Date.now() 
    }]);
  };

  return (
    <AIContext.Provider value={{
      persona,
      setPersona,
      messages,
      sendMessage,
      analyzeCase,
      isProcessing,
      isOpen,
      setIsOpen,
      clearHistory,
      currentCaseId,
      setCurrentCaseId
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
