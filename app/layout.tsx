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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#06090e",
};

export const metadata: Metadata = {
  title: "OPADA Operator — Autonomous AI Agent Runtime & Hardened Code Sandbox",
  description:
    "High-throughput, <15 MB RAM autonomous agent runtime in Go with multi-model failover (Groq, Cohere, Mistral, Gemini), secure Rust code isolation sandbox, and zero-collision PostgreSQL queuing.",
  keywords: [
    "AI Agent Runtime",
    "Autonomous Agent",
    "Rust Sandbox",
    "Go Backend",
    "PostgreSQL SKIP LOCKED",
    "pgvector",
    "Multi-Model Failover",
    "Groq",
    "Cohere",
    "Mistral",
    "Gemini",
  ],
  authors: [{ name: "OPADA Core Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#06090e] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}

