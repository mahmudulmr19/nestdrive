"use client";

import { api } from "~/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isLoading, error } = api.useQuery("get", "/v1/users/me");

  useEffect(() => {
    if (!isLoading && error) {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return <>{children}</>;
}
