import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { WorkspaceProvider } from "@/components/WorkspaceContext";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Brain | Dashboard",
  description: "Living Operating System for Teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-zinc-900 bg-zinc-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col pl-64">
            <Topbar />
            <main className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <Suspense fallback={<div>Loading workspace...</div>}>
                  <WorkspaceProvider>
                    {children}
                  </WorkspaceProvider>
                </Suspense>
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
