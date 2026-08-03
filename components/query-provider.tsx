"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError, isRetriableApiError } from "@/lib/api/client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: {
            retry: false,
          },
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: (failureCount, error) =>
              failureCount < 2 && isRetriableApiError(error),
            retryDelay: (attemptIndex, error) => {
              if (error instanceof ApiError && error.retryAfterMs) {
                return error.retryAfterMs;
              }

              return Math.min(1000 * 2 ** attemptIndex, 30_000);
            },
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
