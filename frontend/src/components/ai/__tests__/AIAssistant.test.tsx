import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIAssistant } from '../AIAssistant';
import * as api from '../../../lib/api';

// Mock the API
vi.mock('../../../lib/api', () => ({
  api: {
    sendChatMessage: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AIAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render floating button when closed', () => {
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    const button = screen.getByLabelText('Open AI Assistant');
    expect(button).toBeInTheDocument();
  });

  it('should open chat window when button is clicked', () => {
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    const openButton = screen.getByLabelText('Open AI Assistant');
    fireEvent.click(openButton);
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
  });

  it('should close chat window when close button is clicked', () => {
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    // Open
const openButton = screen.getByLabelText('Open AI Assistant');
    fireEvent.click(openButton);
    
    // Close
    const closeButton = screen.getByLabelText('Close AI Assistant');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
  });

  it('should display initial welcome message', () => {
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    const openButton = screen.getByLabelText('Open AI Assistant');
    fireEvent.click(openButton);
    
    expect(screen.getByText(/Hello! I'm your fraud detection AI assistant/)).toBeInTheDocument();
  });

  it('should send message when send button is clicked', async () => {
    const mockResponse = { response: 'AI response here' };
    vi.mocked(api.api.sendChatMessage).mockResolvedValue(mockResponse);
    
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    // Open chat
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    // Type message
    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'Hello Frenly' } });
    
    // Send
    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);
    
    // Check API was called
    expect(api.api.sendChatMessage).toHaveBeenCalledWith('Hello Frenly');
    
    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('AI response here')).toBeInTheDocument();
    });
  });

  it('should send message when Enter key is pressed', async () => {
    const mockResponse = { response: 'AI response' };
    vi.mocked(api.api.sendChatMessage).mockResolvedValue(mockResponse);
    
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(api.api.sendChatMessage).toHaveBeenCalledWith('Test message');
  });

  it('should not send empty messages', () => {
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);
    
    expect(api.api.sendChatMessage).not.toHaveBeenCalled();
  });

  it('should clear input after sending message', async () => {
    const mockResponse = { response: 'Response' };
    vi.mocked(api.api.sendChatMessage).mockResolvedValue(mockResponse);
    
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    const input = screen.getByPlaceholderText('Ask me anything...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should display user and assistant messages correctly', async () => {
    const mockResponse = { response: 'AI reply' };
    vi.mocked(api.api.sendChatMessage).mockResolvedValue(mockResponse);
    
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'User message' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    
    // User message should appear immediately
    expect(screen.getByText('User message')).toBeInTheDocument();
    
    // AI response should appear after API call
    await waitFor(() => {
      expect(screen.getByText('AI reply')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(api.api.sendChatMessage).mockRejectedValue(new Error('API Error'));
    
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, I encountered an error/)).toBeInTheDocument();
    });
  });

  it('should display multiple messages in conversation', async () => {
    const mockResponse1 = { response: 'First response' };
    const mockResponse2 = { response: 'Second response' };
    
    vi.mocked(api.api.sendChatMessage)
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);
    
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    
    // First message
    fireEvent.change(input, { target: { value: 'Message 1' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    
    await waitFor(() => {
      expect(screen.getByText('First response')).toBeInTheDocument();
    });
    
    // Second message
    fireEvent.change(input, { target: { value: 'Message 2' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    
    await waitFor(() => {
      expect(screen.getByText('Second response')).toBeInTheDocument();
    });
    
    // All messages should be visible
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('First response')).toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
    expect(screen.getByText('Second response')).toBeInTheDocument();
  });

  it('should have accessible ARIA labels', () => {
    render(<AIAssistant />, { wrapper: createWrapper() });
    
    expect(screen.getByLabelText('Open AI Assistant')).toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    expect(screen.getByLabelText('Close AI Assistant')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });
});
