"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Time in milliseconds before data is considered stale
            staleTime: 1000 * 60 * 5, // 5 minutes
            // Time in milliseconds before inactive queries are garbage collected
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            // Retry failed requests
            retry: (failureCount, error: unknown) => {
              // Don't retry for 4xx errors except 408 (timeout)
              const apiError = error as { status?: number };
              if (apiError?.status && apiError.status >= 400 && apiError.status < 500 && apiError.status !== 408) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Refetch on window focus in production only
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Don't refetch on reconnect by default
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
