"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher, getRules } from "@/lib/api";
import { Search, Workflow, Loader2, ExternalLink } from "lucide-react";
import { Rule } from "@/components/RuleCard";

export default function ActiveRules() {
  const workspaceId = "T0B27A94NN4";
  const { data: rules, isLoading } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const activeRules = (rules || []).filter((r: Rule) => 
    r.status === "active" && 
    (r.title.toLowerCase().includes(search.toLowerCase()) || 
     r.rule_text.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-lg">
            <Workflow className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Active Rules</h1>
            <p className="text-xs text-zinc-500 mt-0.5">The current operational logic governing your organization.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search rules..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-zinc-200 rounded-md pl-10 pr-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 transition-colors w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rule Title</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Channel</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Confidence</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Version</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {activeRules.length > 0 ? (
              activeRules.map((rule: Rule) => (
                <tr key={rule.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">{rule.title}</span>
                      <span className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{rule.rule_text}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-zinc-500 bg-zinc-100 px-2 py-1 rounded border border-zinc-200 uppercase tracking-tighter font-bold">
                      {rule.source_channel || "#general"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rule.confidence > 0.85 ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10'} uppercase tracking-wider`}>
                      {Math.round(rule.confidence * 100)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs text-zinc-500 font-mono">v{rule.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-zinc-500 hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 text-sm italic">
                  No active rules found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
