"use client";

import { Button, Separator } from "@nestdrive/ui";
import {
  CheckCircle2,
  CreditCard,
  FileText,
  Folder,
  HardDrive,
  Layers,
} from "lucide-react";
import { api } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { schemas } from "@nestdrive/client";

type Package = schemas["SubscriptionPackage"];
type Subscription = schemas["Subscription"];

function PackageCard({
  pkg,
  isActive,
  isSwitching,
  onSelect,
}: {
  pkg: Package;
  isActive: boolean;
  isSwitching: boolean;
  onSelect: (id: string) => void;
}) {
  const fileTypes = pkg.allowedFileTypes
    .map((t) => t.charAt(0) + t.slice(1).toLowerCase())
    .join(", ");

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-xs transition-all ${
        isActive
          ? "border-primary ring-2 ring-primary/20"
          : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      {isActive && (
        <span className="absolute -top-3 left-4 flex items-center gap-x-1 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
          <CheckCircle2 className="size-3" />
          Current Plan
        </span>
      )}

      <h3 className="text-lg font-semibold">{pkg.name}</h3>

      <ul className="mt-4 flex flex-col gap-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-x-2">
          <Folder className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.maxFolders}
            </span>{" "}
            max folders
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <Layers className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.maxNestingLevel}
            </span>{" "}
            nesting levels
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <FileText className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            File types:{" "}
            <span className="font-medium text-foreground">{fileTypes}</span>
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <HardDrive className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.maxFileSizeMb} MB
            </span>{" "}
            max file size
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <HardDrive className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.totalFileLimit}
            </span>{" "}
            total files
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <Folder className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.filesPerFolder}
            </span>{" "}
            files per folder
          </span>
        </li>
      </ul>

      <div className="mt-6">
        <Button
          className="w-full"
          variant={isActive ? "outline" : "default"}
          disabled={isActive || isSwitching}
          isLoading={isSwitching}
          onClick={() => onSelect(pkg.id)}
        >
          {isActive ? "Current Plan" : "Switch to this Plan"}
        </Button>
      </div>
    </div>
  );
}

function HistoryRow({ sub }: { sub: Subscription }) {
  const started = new Date(sub.startedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const ended = sub.endedAt
    ? new Date(sub.endedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <div className="flex items-center gap-x-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-neutral-100">
          <CreditCard className="size-3.5 text-neutral-500" />
        </div>
        <span className="font-medium">{sub.package.name}</span>
      </div>
      <div className="flex items-center gap-x-6 text-muted-foreground">
        <span>From {started}</span>
        {ended ? (
          <span>To {ended}</span>
        ) : (
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Active
          </span>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const queryClient = useQueryClient();

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
    },
    onError(err) {
      toast.error(err.error.message);
    },
  });

  const switchingPackageId = isSwitching
    ? (variables?.body as { packageId?: string })?.packageId
    : undefined;

  return (
    <div className="flex h-full flex-col">
      {/* Topbar */}
      <div className="flex items-center border-b bg-white px-6 py-3">
        <div>
          <h1 className="text-base font-semibold">Subscription</h1>
          <p className="text-xs text-muted-foreground">
            Choose a plan that fits your needs.
          </p>
        </div>
      </div>

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
