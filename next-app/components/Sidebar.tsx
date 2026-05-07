"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, ClipboardCheck, Workflow } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/review", label: "Review Queue", icon: ClipboardCheck },
    { href: "/active-rules", label: "Active Rules", icon: Workflow },
    { href: "/decisions", label: "Agent Decisions", icon: Brain },
  ];

  return (
    <div className="w-64 flex flex-col h-screen fixed border-r border-white/5 bg-[#0F1117] z-10">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Brain className="w-5 h-5 text-blue-500" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Company Brain</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 flex flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                isActive 
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
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            US
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">Umesh Shinde</span>
            <span className="text-xs text-zinc-500">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
