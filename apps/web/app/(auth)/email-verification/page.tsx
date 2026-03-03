import { CircleCheck, CircleX } from "lucide-react";

export default async function EmailVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const success = status === "success";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="bg-card border-border flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border p-8 text-center shadow-xs">
        <div
          className={`flex size-14 items-center justify-center rounded-full ${success ? "bg-primary/10" : "bg-destructive/10"}`}
        >
          {success ? (
            <CircleCheck className="text-primary size-7" />
          ) : (
            <CircleX className="text-destructive size-7" />
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">
            {success ? "Email verified!" : "Verification failed"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {success
              ? "Your email has been confirmed. You can close this window"
              : "The link may have expired or already been used."}
          </p>
        </div>
      </div>
    </div>
  );
}
