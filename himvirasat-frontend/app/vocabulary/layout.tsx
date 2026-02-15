import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function VocabularyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <html lang="en" suppressHydrationWarning>
    // <body>
    <TooltipProvider>
      <main>{children}</main>
    </TooltipProvider>
    // </body>
    // </html>
  );
}
