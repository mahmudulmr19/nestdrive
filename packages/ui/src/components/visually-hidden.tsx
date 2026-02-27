"use client";
import { VisuallyHidden as VisuallyHiddenPrimitive } from "radix-ui";

export function VisuallyHidden({
  children,
  ...props
}: React.ComponentProps<typeof VisuallyHiddenPrimitive.Root>) {
  return (
    <VisuallyHiddenPrimitive.Root {...props}>
      {children}
    </VisuallyHiddenPrimitive.Root>
  );
}
