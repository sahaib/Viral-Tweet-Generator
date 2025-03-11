import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Viral Tweet Generator",
    template: `%s`,
  },
  description: "Generate viral tweets for tech and AI audiences.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/favicon/favicon-256x256.png",
    other: [
      {
        url: "/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-64x64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Viral Tweet Generator",
    description: "Generate viral tweets for tech and AI audiences.",
    siteName: "Viral Tweet Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Viral Tweet Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viral Tweet Generator",
    description: "Generate viral tweets for tech and AI audiences.",
    images: ["/og-image.png"],
    creator: "@sahaibsingh",
  },
}; 