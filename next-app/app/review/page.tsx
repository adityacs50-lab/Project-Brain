"use client";

import useSWR from "swr";
import { fetcher, getRules } from "@/lib/api";
import { StatsBar } from "@/components/StatsBar";
import { RuleCard, Rule } from "@/components/RuleCard";

export default function ReviewQueue() {
  const workspaceId = "test-workspace-1";
  const { data: rules, mutate } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });

  const pendingRules = rules?.filter((r: Rule) => r.status === "pending") || [];

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Human Review Queue</h1>
      
      <StatsBar workspaceId={workspaceId} />

      {rules && pendingRules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold">Brain is clean</h2>
          <p className="text-muted-foreground mt-2">No rules need review right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
  );
}
