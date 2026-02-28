"use client";

import { getQueryClient, QueryClientProvider } from "~/lib/query";
import { GoeyToaster } from "goey-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <GoeyToaster position="top-right" richColors={true} preset="smooth" />

      {children}
    </QueryClientProvider>
  );
}
