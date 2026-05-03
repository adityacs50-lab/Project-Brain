"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, ClipboardCheck, Settings, Workflow } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/review", label: "Review Queue", icon: ClipboardCheck },
    { href: "/rules", label: "Active Rules", icon: Workflow },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 flex flex-col h-screen fixed border-r border-white/10 bg-black/20 backdrop-blur-xl z-10">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3 text-primary">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide">Company Brain</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">Navigation</div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? "bg-primary/10 text-blue-400 border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/80 transition-colors"}`} />
              <span className="font-medium text-sm">{link.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
            US
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white/90">Umesh Shinde</span>
            <span className="text-xs text-white/50">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
