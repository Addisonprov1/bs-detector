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
  title: "BS Detector - Earnings Call Analysis",
  description: "AI-powered deception analysis for public company earnings calls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        {/* Win98 Taskbar-style nav */}
        <nav
          className="flex items-center justify-between px-1"
          style={{
            background: '#c0c0c0',
            borderBottom: '2px solid',
            borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
            height: '28px',
          }}
        >
          <a
            href="/"
            className="win-button flex items-center gap-1.5 text-xs font-bold"
            style={{ padding: '1px 10px', minWidth: 'auto', height: '22px' }}
          >
            <span style={{ fontSize: '14px' }}>&#128169;</span>
            <span>BS Detector</span>
          </a>
          <div className="flex items-center gap-1">
            <a
              href="/"
              className="text-[11px] px-3 py-0.5 hover:bg-[#000080] hover:text-white transition-colors"
            >
              Browse
            </a>
          </div>
        </nav>

        <main className="flex-1">{children}</main>

        {/* Win98 Status bar footer */}
        <div className="win-status-bar">
          <span className="win-status-item flex-1">
            Powered by Claude AI + Perplexity Sonar
          </span>
          <span className="win-status-item">
            Deception linguistics (Larcker & Zakolyukina 2012)
          </span>
        </div>
      </body>
    </html>
  );
}
