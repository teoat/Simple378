import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest } from './api';

describe('apiRequest', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('makes GET request by default', async () => {
    const mockResponse = { data: 'test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (key: string) => key === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.resolve(mockResponse)
    });

    const result = await apiRequest('/test');

    expect(global.fetch).toHaveBeenCalledWith('/test', {
      method: 'GET',
      headers: expect.any(Headers)
    });
    expect(result).toEqual(mockResponse);
  });

  it('makes request with custom method', async () => {
    const mockResponse = { success: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (key: string) => key === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.resolve(mockResponse)
    });

    const result = await apiRequest('/test', { method: 'POST' });

    expect(global.fetch).toHaveBeenCalledWith('/test', {
      method: 'POST',
      headers: expect.any(Object)
    });
    expect(result).toEqual(mockResponse);
  });

  it('includes custom headers', async () => {
    const mockResponse = { data: 'test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (key: string) => key === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.resolve(mockResponse)
    });

    const result = await apiRequest('/test', {
      headers: {
        'Authorization': 'Bearer token',
        'X-Custom': 'value'
      }
    });

    expect(global.fetch).toHaveBeenCalledWith('/test', {
      method: 'GET',
      headers: expect.objectContaining({
        'Authorization': 'Bearer token',
        'X-Custom': 'value'
      })
    });
    expect(result).toEqual(mockResponse);
  });

  it('includes body for POST requests', async () => {
    const mockResponse = { created: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (key: string) => key === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.resolve(mockResponse)
    });

    const requestBody = { name: 'test' };
    const result = await apiRequest('/test', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    expect(global.fetch).toHaveBeenCalledWith('/test', {
      method: 'POST',
      headers: expect.any(Headers),
      body: JSON.stringify(requestBody)
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws error for non-ok responses', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: () => null
      },
      text: () => Promise.resolve('Not found')
    });

    await expect(apiRequest('/test')).rejects.toThrow('API request failed: 404 Not Found');
  });

  it('handles network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(apiRequest('/test')).rejects.toThrow('Network error');
  });

  it('handles JSON parsing errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (key: string) => key === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    await expect(apiRequest('/test')).rejects.toThrow('Invalid JSON');
  });

  it('returns typed response', async () => {
    interface TestResponse {
      id: number;
      name: string;
    }

    const mockResponse: TestResponse = { id: 1, name: 'test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (key: string) => key === 'content-type' ? 'application/json' : null
      },
      json: () => Promise.resolve(mockResponse)
    });

    const result = await apiRequest<TestResponse>('/test');

    expect(result).toEqual(mockResponse);
    expect(result.id).toBe(1);
    expect(result.name).toBe('test');
  });

  it('handles empty response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => null
      },
      text: () => Promise.resolve('')
    });

    const result = await apiRequest('/test');
    expect(result).toBe('');
  });
});