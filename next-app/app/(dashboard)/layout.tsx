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
    <div className="flex min-h-screen bg-zinc-50">
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
  );
}
