"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";

export function Topbar() {
  const { isSidebarOpen, setIsSidebarOpen } = useWorkspace();

  return (
    <div className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-zinc-200 bg-white sticky top-0 z-10 shadow-sm w-full">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-zinc-100 text-zinc-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center text-sm text-zinc-500">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all w-64">
            <Search className="w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search rules..." 
              className="bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-400 text-sm w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-zinc-100 transition-colors relative text-zinc-500 hover:text-zinc-900">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 shadow-sm"></span>
        </button>
      </div>
    </div>
  );
}
