"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardLayout } from "~/components/dashboard/dashboard-layout";
import { api } from "~/lib/api";

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: subscription, isLoading } = api.useQuery(
    "get",
    "/v1/subscriptions/me",
  );

  const hasSubscription = !!subscription;
  const isOnSubscriptionPage = pathname === "/subscription";

  useEffect(() => {
    if (!isLoading && !hasSubscription && !isOnSubscriptionPage) {
      router.replace("/subscription");
    }
  }, [isLoading, hasSubscription, isOnSubscriptionPage, router]);

  // Still loading — let parent layout handle the bounce animation
  if (isLoading) return null;

  // No subscription and not yet redirected — render nothing until redirect fires
  if (!hasSubscription && !isOnSubscriptionPage) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
