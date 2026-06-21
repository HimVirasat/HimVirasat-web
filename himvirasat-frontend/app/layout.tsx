import "./globals.css";

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}