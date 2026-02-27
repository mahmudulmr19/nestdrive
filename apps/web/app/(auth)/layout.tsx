import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <Link
          href="/"
          className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground"
        >
          NestDrive
        </Link>

        <main className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
