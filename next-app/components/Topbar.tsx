"use client";

import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center text-sm text-white/50">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all w-64">
          <Search className="w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search rules..." 
            className="bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative text-white/70 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
        </button>
      </div>
    </div>
  );
}
