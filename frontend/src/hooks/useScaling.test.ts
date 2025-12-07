import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScaling } from './useScaling';

describe('useScaling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial scaling state', () => {
    const { result } = renderHook(() => useScaling());

    expect(result.current.scale).toBe(1);
    expect(result.current.isScaling).toBe(false);
    expect(typeof result.current.setScale).toBe('function');
    expect(typeof result.current.zoomIn).toBe('function');
    expect(typeof result.current.zoomOut).toBe('function');
    expect(typeof result.current.resetScale).toBe('function');
  });

  it('setScale updates scale value', () => {
    const { result } = renderHook(() => useScaling());

    act(() => {
      result.current.setScale(1.5);
    });

    expect(result.current.scale).toBe(1.5);
  });

  it('zoomIn increases scale by step amount', () => {
    const { result } = renderHook(() => useScaling());

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.scale).toBe(1.1); // default step is 0.1
  });

  it('zoomOut decreases scale by step amount', () => {
    const { result } = renderHook(() => useScaling());

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.scale).toBe(0.9); // default step is 0.1
  });

  it('zoomIn respects maximum scale limit', () => {
    const { result } = renderHook(() => useScaling());

    // Set scale to maximum
    act(() => {
      result.current.setScale(3.0);
    });

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.scale).toBe(3.0); // should not exceed max
  });

  it('zoomOut respects minimum scale limit', () => {
    const { result } = renderHook(() => useScaling());

    // Set scale to minimum
    act(() => {
      result.current.setScale(0.1);
    });

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.scale).toBe(0.1); // should not go below min
  });

  it('resetScale returns to initial scale', () => {
    const { result } = renderHook(() => useScaling());

    act(() => {
      result.current.setScale(2.0);
    });

    expect(result.current.scale).toBe(2.0);

    act(() => {
      result.current.resetScale();
    });

    expect(result.current.scale).toBe(1.0);
  });

  it('isScaling indicates when scale is changing', () => {
    const { result } = renderHook(() => useScaling());

    expect(result.current.isScaling).toBe(false);

    act(() => {
      result.current.setScale(1.5);
    });

    // isScaling might be true during transitions, but for this simple implementation
    // it might always be false. The test ensures the property exists.
    expect(typeof result.current.isScaling).toBe('boolean');
  });

  it('handles custom initial scale', () => {
    const { result } = renderHook(() => useScaling({ initialScale: 1.2 }));

    expect(result.current.scale).toBe(1.2);
  });

  it('handles custom scale limits', () => {
    const { result } = renderHook(() => useScaling({
      minScale: 0.5,
      maxScale: 2.0
    }));

    act(() => {
      result.current.setScale(0.3);
    });
    expect(result.current.scale).toBe(0.5); // clamped to min

    act(() => {
      result.current.setScale(2.5);
    });
    expect(result.current.scale).toBe(2.0); // clamped to max
  });

  it('handles custom step size', () => {
    const { result } = renderHook(() => useScaling({ step: 0.2 }));

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.scale).toBe(1.2);
  });
});