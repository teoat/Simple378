import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIProvider } from '../../../context/AIContext';
import { AIAssistant } from '../AIAssistant';

// Mock API
const mockApiRequest = vi.fn();
vi.mock('../../../lib/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args)
}));

describe('AIAssistant Component', () => {
  beforeEach(() => {
    mockApiRequest.mockClear();
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('should render floating button when closed', () => {
    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    const button = screen.getByLabelText('Open AI Assistant');
    expect(button).toBeInTheDocument();
  });

  it('should open chat window on click', () => {
    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    const floatingButton = screen.getByLabelText('Open AI Assistant');
    fireEvent.click(floatingButton);

    expect(screen.getByText('Frenly AI')).toBeInTheDocument();
  });

  it('should close chat window', () => {
    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    // Open chat
    fireEvent.click(screen.getByLabelText('Open AI Assistant'));
    
    // Close chat
    const closeButton = screen.getAllByRole('button')[0]; // X button
    fireEvent.click(closeButton);

    // Should show floating button again
    expect(screen.getByLabelText('Open AI Assistant')).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    expect(screen.getByText(/Hello! I'm Frenly AI/i)).toBeInTheDocument();
  });

  it('should send message via button', async () => {
    mockApiRequest.mockResolvedValueOnce({
      response: 'Test response',
      persona: 'analyst',
      suggestions: []
    });

    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const input = screen.getByPlaceholderText(/Ask the/);
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/ai/chat', expect.any(Object));
    });
  });

  it('should send message via Enter key', async () => {
    mockApiRequest.mockResolvedValueOnce({
      response: 'Test response',
      persona: 'analyst',
      suggestions: []
    });

    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const input = screen.getByPlaceholderText(/Ask the/);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalled();
    });
  });

  it('should prevent empty messages', () => {
    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeDisabled();

    const input = screen.getByPlaceholderText(/Ask the/);
    fireEvent.change(input, { target: { value: '   ' } });
    
    expect(sendButton).toBeDisabled();
  });

  it('should clear input after sending', async () => {
    mockApiRequest.mockResolvedValueOnce({
      response: 'Test response',
      persona: 'analyst',
      suggestions: []
    });

    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const input = screen.getByPlaceholderText(/Ask the/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should display user and assistant messages', async () => {
    mockApiRequest.mockResolvedValueOnce({
      response: 'AI response',
      persona: 'analyst',
      suggestions: []
    });

    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const input = screen.getByPlaceholderText(/Ask the/);
    fireEvent.change(input, { target: { value: 'User message' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => {
      expect(screen.getByText('User message')).toBeInTheDocument();
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('API Error'));

    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const input = screen.getByPlaceholderText(/Ask the/);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => {
      expect(screen.getByText(/encountered an error/i)).toBeInTheDocument();
    });
  });

  it('should support multiple message conversation', async () => {
    mockApiRequest
      .mockResolvedValueOnce({
        response: 'First response',
        persona: 'analyst',
        suggestions: []
      })
      .mockResolvedValueOnce({
        response: 'Second response',
        persona: 'analyst',
        suggestions: []
      });

    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    fireEvent.click(screen.getByLabelText('Open AI Assistant'));

    const input = screen.getByPlaceholderText(/Ask the/);

    // First message
    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => {
      expect(screen.getByText('First response')).toBeInTheDocument();
    });

    // Second message
    fireEvent.change(input, { target: { value: 'Second message' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => {
      expect(screen.getByText('Second response')).toBeInTheDocument();
    });
  });

  it('should have proper ARIA labels for accessibility', () => {
    render(
      <AIProvider>
        <AIAssistant />
      </AIProvider>
    );

    const floatingButton = screen.getByLabelText('Open AI Assistant');
    expect(floatingButton).toHaveAttribute('aria-label');

    fireEvent.click(floatingButton);

    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toHaveAttribute('aria-label');
  });
});
