"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, ClipboardCheck, Workflow, Play, Code2, BookOpen, Sliders, X } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";

export function Sidebar() {
  const pathname = usePathname();
  const { workspaceId, isSidebarOpen, setIsSidebarOpen } = useWorkspace();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/review", label: "Review Queue", icon: ClipboardCheck },
    { href: "/active-rules", label: "Active Rules", icon: Workflow },
    { href: "/developer", label: "Developer", icon: Code2 },
    { href: "/docs", label: "Documentation", icon: BookOpen },
    { href: "/decisions", label: "Agent Decisions", icon: ShieldCheck },
    { href: "/demo", label: "Live Demo", icon: Play },
    { href: "/sandbox", label: "Policy Sandbox", icon: Sliders },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`w-64 flex flex-col h-screen fixed top-0 left-0 border-r border-white/5 bg-[#0F1117] z-50 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight leading-none">Statelock</span>
              <span className="text-[9px] text-blue-400 font-mono tracking-wider font-semibold uppercase mt-1 max-w-[140px] truncate">{workspaceId}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500 transition-colors"}`} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              DU
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">Demo User</span>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded shrink-0">Demo</span>
              </div>
              <span className="text-xs text-zinc-500 truncate">Workspace View</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
