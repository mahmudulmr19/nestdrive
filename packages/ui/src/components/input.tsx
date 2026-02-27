import { cn } from "@nestdrive/ui";
import type * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-background text-foreground placeholder:text-muted-foreground",
        "flex w-full rounded-lg border px-3 py-2.5 text-sm shadow-xs",
        "transition-all duration-200 ease-out outline-none",
        "hover:border-primary/50",
        "focus:border-primary focus:ring-primary/20 focus:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
