"use client";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as "success" | "failed" | null;
  return (
    <div className="flex items-center justify-center">
      <div>
        {status === "success"
          ? "Email verified successfully! You can close this window"
          : "Failed to verify email."}
      </div>
    </div>
  );
}
