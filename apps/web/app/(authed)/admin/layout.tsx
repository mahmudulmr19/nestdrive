"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/lib/auth";
import { AdminLayout } from "~/components/admin-layout";

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
