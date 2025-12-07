import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('merges Tailwind classes correctly', () => {
    const result = cn('bg-red-500', 'text-white', 'p-4');
    expect(result).toBe('bg-red-500 text-white p-4');
  });

  it('handles conflicting classes by keeping the last one', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('handles clsx-style inputs', () => {
    const result = cn('bg-red-500', ['text-white', 'p-4'], { 'font-bold': true });
    expect(result).toBe('bg-red-500 text-white p-4 font-bold');
  });

  it('handles undefined and null values', () => {
    const result = cn('bg-red-500', undefined, null, 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('handles empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles single input', () => {
    const result = cn('bg-red-500');
    expect(result).toBe('bg-red-500');
  });

  it('handles complex Tailwind conflicts', () => {
    const result = cn('p-2', 'p-4', 'm-1', 'm-2');
    expect(result).toBe('p-4 m-2');
  });

  it('handles important modifiers', () => {
    const result = cn('bg-red-500!', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('handles responsive prefixes', () => {
    const result = cn('sm:bg-red-500', 'md:bg-blue-500');
    expect(result).toBe('sm:bg-red-500 md:bg-blue-500');
  });

  it('handles hover and focus states', () => {
    const result = cn('hover:bg-red-500', 'focus:bg-blue-500');
    expect(result).toBe('hover:bg-red-500 focus:bg-blue-500');
  });

  it('handles arbitrary values', () => {
    const result = cn('bg-[#ff0000]', 'text-[14px]');
    expect(result).toBe('bg-[#ff0000] text-[14px]');
  });
});