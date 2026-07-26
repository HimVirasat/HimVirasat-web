import "./globals.css";

import type { Metadata, Viewport } from "next";

import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";

import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Himachal Pradesh",
    "Himachali languages",
    "Pahari",
    "Mandeali",
    "Kangri",
    "Takri script",
    "Devanagari",
    "open dataset",
    "language preservation",
  ],
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_IN",
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${fontVariables} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
