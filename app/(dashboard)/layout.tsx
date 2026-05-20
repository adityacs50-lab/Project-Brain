import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { WorkspaceProvider } from "@/components/WorkspaceContext";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading workspace...</div>}>
      <WorkspaceProvider>
        <div className="flex min-h-screen bg-zinc-50">
          <Sidebar />
          <div className="flex-1 flex flex-col w-full lg:pl-64 transition-all duration-300">
            <Topbar />
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
              <div className="max-w-screen-2xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </WorkspaceProvider>
    </Suspense>
  );
}
