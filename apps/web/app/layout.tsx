import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@nestdrive/ui/styles.css";
import { Providers } from "~/components/providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NestDrive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
