import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Earnings Call BS Detector",
  description: "AI-powered deception analysis for public company earnings calls. Backed by CIA TBA, FBI Statement Analysis, and academic research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-[var(--color-accent-green)] text-xl font-bold">◉</span>
            <span className="font-semibold tracking-wider text-sm">CALL DETECTOR</span>
          </a>
          <div className="flex gap-6 text-xs text-[var(--color-text-muted)]">
            <a href="/" className="hover:text-[var(--color-text-secondary)] transition-colors">BROWSE</a>
            <a href="/#leaderboard" className="hover:text-[var(--color-text-secondary)] transition-colors">LEADERBOARD</a>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--color-border)] px-6 py-3 text-[10px] text-[var(--color-text-muted)] flex justify-between">
          <span>Powered by deception linguistics research (Larcker & Zakolyukina 2012, CIA TBA, CBCA)</span>
          <span>Analysis by Claude AI</span>
        </footer>
      </body>
    </html>
  );
}
