import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StateLock — AI Agents That Never Break Your Rules",
  description:
    "We synthesize your Slack, emails, tickets, and policies into a deterministic governance layer — so your agents execute with mathematical certainty instead of probabilistic guesses.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased bg-[#050505] text-[#e5e5e5] ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
