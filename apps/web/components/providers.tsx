"use client";

import { getQueryClient, QueryClientProvider } from "~/lib/query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors={true} />

      {children}
    </QueryClientProvider>
  );
}
