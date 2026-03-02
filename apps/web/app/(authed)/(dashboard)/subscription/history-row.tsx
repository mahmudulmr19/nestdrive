import { CreditCard } from "lucide-react";
import type { schemas } from "@nestdrive/client";

type Subscription = schemas["Subscription"];

export function HistoryRow({ sub }: { sub: Subscription }) {
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
        <span className="font-medium">
          {sub.package?.name ?? (
            <span className="italic text-muted-foreground">Deleted plan</span>
          )}
        </span>
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
