import Link from "next/link";
import type { ReactNode } from "react";

type AuthWrapperFooterProps =
  | {
      footerText: string;
      footerLinkText: string;
      footerLinkHref: string;
    }
  | {
      footerText?: undefined;
      footerLinkText?: undefined;
      footerLinkHref?: undefined;
    };

type AuthWrapperProps = AuthWrapperFooterProps & {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthWrapper({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthWrapperProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      {children}

      {footerText && footerLinkText && footerLinkHref ? (
        <p className="text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-medium text-primary hover:underline"
          >
            {footerLinkText}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
