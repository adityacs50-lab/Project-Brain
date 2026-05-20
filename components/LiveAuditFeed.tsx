"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { ShieldAlert, CheckCircle, AlertTriangle, Flag, Activity, Loader2 } from "lucide-react";
import { fetcher } from "@/lib/api";

type Decision = {
  audit_id: string;
  agent_id: string;
  action: string;
  context: Record<string, unknown>;
  decision: "permitted" | "denied" | "escalate" | "no_rule_found";
  matched_rule_id: string | null;
  rule_text: string | null;
  escalate_to: string | null;
  confidence: number | null;
  agent_feedback: string | null;
  created_at: string;
};

export function LiveAuditFeed({ workspaceId }: { workspaceId: string }) {
  // Poll every 3 seconds for real-time audit updates
  const { data: response, error, mutate } = useSWR<{ decisions: Decision[] }>(
    workspaceId ? `/api/proxy/agent/decisions/${workspaceId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const [flaggingState, setFlaggingState] = useState<Record<string, boolean>>({});

  const handleFlag = async (auditId: string) => {
    setFlaggingState((prev) => ({ ...prev, [auditId]: true }));
    try {
      await fetch("/api/proxy/agent/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit_id: auditId, outcome: "incorrect", notes: "Flagged via live dashboard" }),
      });
      // Optionally mutate to get the updated feedback state from backend immediately
      mutate();
    } catch (e) {
      console.error("Failed to flag decision:", e);
    } finally {
      setFlaggingState((prev) => ({ ...prev, [auditId]: false }));
    }
  };

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600 font-medium">Failed to load live audit feed.</p>
        <button onClick={() => mutate()} className="mt-3 text-xs font-bold text-red-500 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (!response && !error) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-sm text-zinc-500 font-medium">Establishing secure connection to StateLock edge...</p>
      </div>
    );
  }

  const decisions = response?.decisions || [];

  // Calculate live stats from the fetched decisions batch
  const total = decisions.length;
  const blocked = decisions.filter((d) => d.decision === "denied").length;
  const permitted = decisions.filter((d) => d.decision === "permitted" || d.decision === "no_rule_found").length;
  const escalated = decisions.filter((d) => d.decision === "escalate").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Realtime Stats Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Live Audit Stream</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <span className="text-zinc-300">Total: <span className="text-white font-bold">{total}</span></span>
          <span className="text-red-400">Blocked: <span className="font-bold">{blocked}</span></span>
          <span className="text-emerald-400">Permitted: <span className="font-bold">{permitted}</span></span>
          <span className="text-yellow-400">Escalated: <span className="font-bold">{escalated}</span></span>
        </div>
      </div>

      {/* Audit Feed */}
      <div className="flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
        {decisions.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
            <Activity className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-zinc-900 font-semibold mb-1">No decisions yet</h3>
            <p className="text-sm text-zinc-500">Run your agent to see decisions appear here in real-time.</p>
          </div>
        ) : (
          decisions.map((decision) => {
            const isDenied = decision.decision === "denied";
            const isEscalate = decision.decision === "escalate";
            const isPermitted = decision.decision === "permitted" || decision.decision === "no_rule_found";
            
            const isFlagged = decision.agent_feedback && decision.agent_feedback.includes("incorrect");

            return (
              <div 
                key={decision.audit_id} 
                className={`relative overflow-hidden rounded-xl border p-5 transition-all ${
                  isDenied 
                    ? "bg-red-50/50 border-red-100 shadow-[0_4px_20px_-10px_rgba(239,68,68,0.2)]" 
                    : isEscalate
                    ? "bg-yellow-50/50 border-yellow-100 shadow-sm"
                    : "bg-white border-zinc-200 shadow-sm hover:border-zinc-300"
                }`}
              >
                {/* Header: ID & Time */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isDenied && <span className="px-2.5 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Denied</span>}
                    {isEscalate && <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Escalate</span>}
                    {isPermitted && <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Permitted</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-400">ID: {decision.audit_id.split('-')[0]}...</span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {new Date(decision.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Core Action */}
                <h3 className="text-base font-semibold text-zinc-900 mb-2 leading-snug">
                  &quot;{decision.action}&quot;
                </h3>

                {/* Rule & Reason */}
                <div className="space-y-1.5 mb-4">
                  {decision.rule_text && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-zinc-500 font-medium shrink-0">Rule Matched:</span>
                      <span className="text-zinc-700">{decision.rule_text}</span>
                    </div>
                  )}
                  {decision.escalate_to && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-zinc-500 font-medium shrink-0">Routed To:</span>
                      <span className="text-zinc-700 font-semibold">{decision.escalate_to}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-zinc-500 font-medium shrink-0">Confidence:</span>
                    <span className="text-zinc-700 font-mono">{(decision.confidence || 1.0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-900/5">
                  <button
                    onClick={() => handleFlag(decision.audit_id)}
                    disabled={isFlagged || flaggingState[decision.audit_id]}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors px-2 py-1 -ml-2 rounded ${
                      isFlagged 
                        ? "text-red-500 cursor-default" 
                        : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {flaggingState[decision.audit_id] ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Flag className="w-3.5 h-3.5" />
                    )}
                    {isFlagged ? "Flagged \u2713" : "Flag Incorrect"}
                  </button>
                  
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                    View Details &rarr;
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
