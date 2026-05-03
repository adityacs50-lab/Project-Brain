"use client";

import useSWR from "swr";
import { fetcher, getRules } from "@/lib/api";
import { RuleCard, Rule } from "@/components/RuleCard";
import { ClipboardCheck, Sparkles } from "lucide-react";

export default function ReviewQueue() {
  const workspaceId = "demo-workspace";
  const { data: rules, mutate } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });

  const pendingRules = rules?.filter((r: Rule) => r.status === "pending") || [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <ClipboardCheck className="w-6 h-6 text-blue-400" />
          </div>
          Review Queue
        </h1>
        <p className="text-muted-foreground text-lg ml-14">
          Human verification of AI-extracted operational rules.
        </p>
      </div>

      <div className="mt-4">
        {rules && pendingRules.length === 0 ? (
          <div className="glass-card rounded-3xl flex flex-col items-center justify-center py-32 text-center border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
            <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <Sparkles className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">Queue is clear</h2>
            <p className="text-muted-foreground max-w-sm text-lg">
              The Company Brain is fully synced. No new rules require human verification at this time.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {pendingRules.map((rule: Rule) => (
              <RuleCard 
                key={rule.id} 
                rule={rule} 
                onRemoved={() => {
                  // Optimistic update
                  mutate(
                    rules.filter((r: Rule) => r.id !== rule.id),
                    false
                  );
                  // Trigger revalidation in background
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
