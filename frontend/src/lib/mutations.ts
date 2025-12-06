import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import toast from 'react-hot-toast';

/**
 * Cache Invalidation and Mutation Patterns
 * 
 * Fix #6: Implement Cache Invalidation Pattern
 * Provides mutation hooks with automatic cache invalidation.
 */

export interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  invalidateKeys?: string[][];  // Query keys to invalidate
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

// Generic types for API responses
export interface Case {
  id: string;
  title: string;
  status: string;
  risk_score?: number;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  [key: string]: unknown;
}

export interface Subject {
  id: string;
  name: string;
  type: string;
  risk_score: number;
  status: string;
  [key: string]: unknown;
}

/**
 * Create a case mutation with automatic cache invalidation
 */
export function useCreateCaseMutation(options?: MutationOptions<Case>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Case>) =>
      api.post<Case>('/cases', data),

    onMutate: async (newCase) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['cases'] });

      // Snapshot previous value
      const previousCases = queryClient.getQueryData<Case[]>(['cases']);

      // Optimistic update
      queryClient.setQueryData<Case[]>(['cases'], (old) => {
        if (!old) return [];
        return [...old, { 
          ...newCase, 
          id: `optimistic-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Case];
      });

      return { previousCases };
    },

    onError: (error: Error, _newCase, context) => {
      // Rollback on error
      if (context?.previousCases) {
        queryClient.setQueryData(['cases'], context.previousCases);
      }
      
      if (options?.showErrorToast !== false) {
        toast.error(options?.errorMessage || `Failed to create case: ${error.message}`);
      }
      options?.onError?.(error);
    },

    onSuccess: (data) => {
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Optionally set exact data
      queryClient.setQueryData(['cases', data.id], data);

      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage || 'Case created successfully');
      }
      options?.onSuccess?.(data);
    },
  });
}

/**
 * Update a case with automatic cache invalidation
 */
export function useUpdateCaseMutation(caseId: string, options?: MutationOptions<Case>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Case>) =>
      api.put<Case>(`/cases/${caseId}`, data),

    onMutate: async (updatedCase) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cases', caseId] });

      // Snapshot previous value
      const previousCase = queryClient.getQueryData<Case>(['cases', caseId]);

      // Optimistic update
      if (previousCase) {
        queryClient.setQueryData<Case>(['cases', caseId], {
          ...previousCase,
          ...updatedCase,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousCase };
    },

    onError: (error: Error, _updatedCase, context) => {
      // Rollback on error
      if (context?.previousCase) {
        queryClient.setQueryData(['cases', caseId], context.previousCase);
      }
      
      if (options?.showErrorToast !== false) {
        toast.error(options?.errorMessage || `Failed to update case: ${error.message}`);
      }
      options?.onError?.(error);
    },

    onSuccess: (updatedCase) => {
      // Update specific case
      queryClient.setQueryData(['cases', caseId], updatedCase);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage || 'Case updated');
      }
      options?.onSuccess?.(updatedCase);
    },
  });
}

/**
 * Delete a case with automatic cache invalidation
 */
export function useDeleteCaseMutation(options?: MutationOptions<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caseId: string) =>
      api.delete<void>(`/cases/${caseId}`),

    onMutate: async (caseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cases'] });

      // Snapshot previous values
      const previousCases = queryClient.getQueryData<Case[]>(['cases']);

      // Optimistic delete
      queryClient.setQueryData<Case[]>(['cases'], (old) => {
        if (!old) return [];
        return old.filter(c => c.id !== caseId);
      });

      return { previousCases };
    },

    onError: (error: Error, _caseId, context) => {
      // Rollback on error
      if (context?.previousCases) {
        queryClient.setQueryData(['cases'], context.previousCases);
      }
      
      if (options?.showErrorToast !== false) {
        toast.error(options?.errorMessage || `Failed to delete case: ${error.message}`);
      }
      options?.onError?.(error);
    },

    onSuccess: () => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage || 'Case deleted');
      }
      options?.onSuccess?.(undefined);
    },
  });
}

/**
 * Create a subject mutation with automatic cache invalidation
 */
export function useCreateSubjectMutation(options?: MutationOptions<Subject>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Subject>) =>
      api.post<Subject>('/subjects', data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      queryClient.setQueryData(['subjects', data.id], data);

      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage || 'Subject created successfully');
      }
      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      if (options?.showErrorToast !== false) {
        toast.error(options?.errorMessage || `Failed to create subject: ${error.message}`);
      }
      options?.onError?.(error);
    },
  });
}

/**
 * Generic mutation factory with cache invalidation
 */
export function useCachedMutation<T, V = unknown>(
  endpoint: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  invalidateKeys: string[][] = [],
  options?: MutationOptions<T>
) {
  const queryClient = useQueryClient();

  const mutationFn = async (data?: V): Promise<T> => {
    switch (method) {
      case 'post':
        return api.post<T>(endpoint, data);
      case 'put':
        return api.put<T>(endpoint, data);
      case 'patch':
        return api.patch<T>(endpoint, data);
      case 'delete':
        return api.delete<T>(endpoint);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  };

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Invalidate all specified keys
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (options?.showSuccessToast !== false && options?.successMessage) {
        toast.success(options.successMessage);
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      if (options?.showErrorToast !== false) {
        toast.error(options?.errorMessage || error.message);
      }
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to batch invalidate multiple query keys
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return (keys: string[][]) => {
    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };
}

/**
 * Hook to optimistically update a query
 */
export function useOptimisticUpdate<T>() {
  const queryClient = useQueryClient();

  return {
    setData: (key: readonly unknown[], updater: (old: T | undefined) => T) => {
      queryClient.setQueryData<T>(key, updater);
    },
    getData: (key: readonly unknown[]) => {
      return queryClient.getQueryData<T>(key);
    },
    cancelQueries: async (key: readonly unknown[]) => {
      await queryClient.cancelQueries({ queryKey: key });
    },
    invalidate: (key: readonly unknown[]) => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  };
}
