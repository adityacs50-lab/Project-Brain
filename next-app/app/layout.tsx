import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Human Review Queue",
  description: "Company Brain Rule Review",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
