// src/app/layout.jsx
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import HeaderClient from "@/components/HeaderClient.jsx";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = { title: "iSports", description: "생활체육 커뮤니티" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
          <div className="mx-auto max-w-5xl px-4 h-14 md:h-16 flex items-center justify-between">
            <a href="/" className="font-bold text-base md:text-lg tracking-tight">
              <span className="text-blue-600">i</span><span className="text-gray-800">Sports</span>
            </a>
            <HeaderClient />
          </div>
        </header>

        <Suspense fallback={null}>
          <main className="mx-auto max-w-5xl px-4 py-4 md:py-6">{children}</main>
        </Suspense>

        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs md:text-sm text-gray-500">
          © {new Date().getFullYear()} iSports
        </footer>
      </body>
    </html>
  );
}
