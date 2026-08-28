"use client";

import { useAuth } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { setAuthTokenProvider } from "@/lib/services/api-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    setAuthTokenProvider(() => getToken());

    return () => {
      setAuthTokenProvider(null);
    };
  }, [getToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
