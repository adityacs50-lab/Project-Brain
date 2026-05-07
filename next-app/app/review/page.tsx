"use client";

import useSWR from "swr";
import { fetcher, getRules } from "@/lib/api";
import { RuleCard, Rule } from "@/components/RuleCard";
import { ClipboardCheck, Sparkles, Loader2 } from "lucide-react";

export default function ReviewQueue() {
  const workspaceId = "T0B27A94NN4";
  const { data: rules, error, isLoading, mutate } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const pendingRules = rules?.filter((r: Rule) => r.status === "pending") || [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-lg">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Review Queue</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Verify and approve new operational rules extracted by the AI.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pending Verification</span>
          <p className="text-lg font-bold text-zinc-900 leading-none mt-1">{pendingRules.length}</p>
        </div>
      </div>

      <div className="mt-4">
        {pendingRules.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl flex flex-col items-center justify-center py-24 text-center shadow-sm">
            <div className="p-4 bg-blue-600/10 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Queue is clear</h2>
            <p className="text-zinc-500 max-w-xs text-sm">
              The Company Brain is fully synced. All operational rules are currently verified.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingRules.map((rule: Rule) => (
              <RuleCard 
                key={rule.id} 
                rule={rule} 
                onRemoved={() => {
                  mutate(
                    rules.filter((r: Rule) => r.id !== rule.id),
                    false
                  );
                  mutate();
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
