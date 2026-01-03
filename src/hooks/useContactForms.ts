"use client";

import { useQuery } from '@tanstack/react-query';
import { ContactService, ContactFormEntry, ContactFormsListResponse } from '@/services/contact.service';
import { useAdmin } from '@/contexts/AdminContext';

// Query key factory for contact forms
export const contactFormKeys = {
  all: ['contact-forms'] as const,
  lists: () => [...contactFormKeys.all, 'list'] as const,
  list: () => [...contactFormKeys.lists()] as const,
};

/**
 * Hook for fetching all contact form submissions (admin only)
 */
export function useContactForms() {
  const { getToken } = useAdmin();
  const token = getToken();

  return useQuery({
    queryKey: contactFormKeys.list(),
    queryFn: async (): Promise<ContactFormEntry[]> => {
      const response = await ContactService.getAllContactForms(token || undefined);
      return response.data || [];
    },
    enabled: !!token, // Only fetch when admin is authenticated
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry for authentication errors (401, 403)
      const apiError = error as { statusCode?: number; message?: string };
      if (apiError?.statusCode === 401 || apiError?.statusCode === 403) {
        return false;
      }
      // Don't retry for other 4xx errors except 408 (timeout)
      if (apiError?.statusCode && apiError.statusCode >= 400 && apiError.statusCode < 500 && apiError.statusCode !== 408) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

