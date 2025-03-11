import "../styles/globals.css";
import { Viewport } from "next";
import clsx from "clsx";
import { Analytics } from "@vercel/analytics/react";

import { Providers } from "./providers";
import { metadata } from "./metadata";

import { siteConfig } from "../config/site";
import { fontSans } from "../config/fonts";
import { Navbar } from "../components/navbar";

export { metadata };

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex flex-col items-center justify-center py-3 gap-2">
              <p className="text-default-600 text-sm">
                Powered by AI - Generate viral tweets for tech and AI audiences
              </p>
              <p className="text-default-400 text-xs text-center">
                News content sourced from NewsAPI and Athina AI Hub. Athina AI Hub content © Athina AI - Visit <a href="https://hub.athina.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">hub.athina.ai</a> for original articles.
              </p>
            </footer>
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
