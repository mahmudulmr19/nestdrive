"use client";

import { getQueryClient, QueryClientProvider } from "~/lib/query";
import { Toaster } from "sonner";
import { AuthProvider } from "~/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" richColors={true} />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
