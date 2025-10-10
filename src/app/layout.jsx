// src/app/layout.jsx
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import ClientNav from "@/components/ClientNav.jsx";
// 필요 시 나중에 요청하면 HeaderClient/RouteDebug/Breadcrumb도 붙여줄게

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = { title: "Sporttalk", description: "생활체육 커뮤니티" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
          <div className="mx-auto max-w-5xl px-4 h-14 md:h-16 flex items-center justify-between">
            <a href="/" className="font-bold text-base md:text-lg text-brand-700 tracking-tight">
              Sporttalk
            </a>
            <ClientNav />
          </div>
        </header>

        <Suspense fallback={null}>
          <main className="mx-auto max-w-5xl px-4 py-4 md:py-6">{children}</main>
        </Suspense>

        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs md:text-sm text-gray-500">
          © {new Date().getFullYear()} Sporttalk
        </footer>
      </body>
    </html>
  );
}
