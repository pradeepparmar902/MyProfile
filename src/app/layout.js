import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://credoras.org"),
  title: "Proofolio | Proof-Based Career Profiles",
  description:
    "Build a proof-backed career identity with achievement stories, projects, skills, and a recruiter-friendly public profile.",
  openGraph: {
    title: "Proofolio | Proof-Based Career Profiles",
    description: "Build a proof-backed career identity with achievement stories, projects, skills, and a recruiter-friendly public profile.",
    url: "https://credoras.org",
    siteName: "Proofolio",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Proofolio Career Profiles",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proofolio | Proof-Based Career Profiles",
    description: "Build a proof-backed career identity with achievement stories, projects, skills, and a recruiter-friendly public profile.",
    images: ["/opengraph-image.jpg"],
  },
};

import { db } from "@/lib/db";
import Script from "next/script";

export default async function RootLayout({ children }) {
  let globalSettings = {};
  try {
    globalSettings = await db.setting.findFirst({}) || {};
  } catch (error) {
    console.error("Failed to fetch settings in layout:", error);
  }
  const adSenseId = globalSettings.adSensePublisherId;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {adSenseId && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
          />
        )}
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
