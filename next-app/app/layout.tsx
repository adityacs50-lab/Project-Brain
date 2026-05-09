import type { Metadata } from "next";
import { Fraunces, DM_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ 
  subsets: ["latin"], 
  variable: "--font-fraunces",
  style: ["italic"]
});

const dmMono = DM_Mono({ 
  subsets: ["latin"], 
  variable: "--font-dm-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Company Brain | Deterministic Control Plane",
  description: "Enterprise Guardrails for Autonomous Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
