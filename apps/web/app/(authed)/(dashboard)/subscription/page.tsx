"use client";

import { Separator } from "@nestdrive/ui";
import { api } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PackageCard } from "./package-card";
import { HistoryRow } from "./history-row";

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: packages, isLoading: packagesLoading } = api.useQuery(
    "get",
    "/v1/packages",
  );

  const { data: activeSubscription, isLoading: subLoading } = api.useQuery(
    "get",
    "/v1/subscriptions/me",
  );

  const { data: history, isLoading: historyLoading } = api.useQuery(
    "get",
    "/v1/subscriptions/history",
  );

  const {
    mutate: subscribe,
    isPending: isSwitching,
    variables,
  } = api.useMutation("post", "/v1/subscriptions", {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/subscriptions/me"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/subscriptions/history"],
      });
      toast.success("Subscription updated successfully");
      if (!activeSubscription) {
        router.replace("/");
      }
    },
    onError(err) {
      toast.error(err.error.message);
    },
  });

  const switchingPackageId = isSwitching
    ? (variables?.body as { packageId?: string })?.packageId
    : undefined;

  const isFirstTime = !subLoading && !activeSubscription;

  return (
    <div className="flex h-full flex-col">
      {/* Topbar */}
      <div className="flex items-center border-b bg-white px-6 py-3">
        <div>
          <h1 className="text-base font-semibold">Subscription</h1>
          <p className="text-xs text-muted-foreground">
            {isFirstTime
              ? "Pick a plan to start using NestDrive."
              : "Choose a plan that fits your needs."}
          </p>
        </div>
      </div>

      {isFirstTime && (
        <div className="flex items-center gap-x-3 border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          <span className="text-base">👋</span>
          <span>
            Welcome! You don&apos;t have an active plan yet. Pick one below to
            start managing your files.
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Packages grid */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Available Plans
          </h2>
          {packagesLoading || subLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl bg-neutral-100"
                />
              ))}
            </div>
          ) : !packages?.length ? (
            <p className="text-sm text-muted-foreground">
              No packages available. Ask the admin to create some.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  isActive={activeSubscription?.packageId === pkg.id}
                  isSwitching={switchingPackageId === pkg.id}
                  onSelect={(packageId) => subscribe({ body: { packageId } })}
                />
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* History */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Subscription History
          </h2>
          {historyLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-neutral-100"
                />
              ))}
            </div>
          ) : !history?.length ? (
            <p className="text-sm text-muted-foreground">
              No subscription history yet.
            </p>
          ) : (
            <div className="divide-y rounded-xl border bg-white px-4">
              {history.map((sub) => (
                <HistoryRow key={sub.id} sub={sub} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
