import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AccessGate from "./access-gate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const githubPages = process.env.GITHUB_PAGES === "1";
const siteUrl = githubPages
  ? "https://drandersson.github.io/"
  : "https://shf-arshjul.renyiwushu.chatgpt.site/";
const faviconPath = githubPages ? "/shf-arshjul/favicon.svg" : "/favicon.svg";
const socialImagePath = githubPages ? "/shf-arshjul/og.png" : "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SHF Årshjul – Styrelseportal",
  description: "Ett levande årshjul för Svensk Handkirurgisk Förenings styrelse.",
  openGraph: {
    title: "SHF Årshjul",
    description: "Föreningens arbete, i rätt tid.",
    type: "website",
    images: [{ url: socialImagePath, width: 1664, height: 935, alt: "SHF Årshjul – Föreningens arbete, i rätt tid." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHF Årshjul",
    description: "Föreningens arbete, i rätt tid.",
    images: [socialImagePath],
  },
  icons: {
    icon: faviconPath,
    shortcut: faviconPath,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AccessGate enabled={githubPages} logoSrc={githubPages ? "/shf-arshjul/shf-logo-pos.png" : "/shf-logo-pos.png"}>
          {children}
        </AccessGate>
      </body>
    </html>
  );
}
