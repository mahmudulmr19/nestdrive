import { PropsWithChildren } from "react";
import { cn } from "@nestdrive/ui";

export function DashboardBody({
  children,
  title,
  className,
  wrapperClassName,
  description,
  header,
}: PropsWithChildren & {
  title?: string;
  className?: string;
  wrapperClassName?: string;
  description?: string;
  header?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-w-0 flex-2 flex-col items-center rounded-2xl border-neutral-200 px-4 md:overflow-y-auto md:border md:px-8 md:shadow-xs">
      <div
        className={cn(
          "flex h-full w-full max-w-(--breakpoint-xl) flex-col",
          wrapperClassName,
        )}
      >
        <div className="flex flex-col gap-y-4 py-8 md:flex-row md:items-center md:justify-between md:gap-x-8 md:py-8">
          <div>
            {title && (
              <h4 className="text-2xl font-medium whitespace-nowrap">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {description}
              </p>
            )}
          </div>
          {header}
        </div>

        <div className={cn("flex w-full flex-col pb-8", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
