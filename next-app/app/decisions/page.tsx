"use client";

import useSWR from "swr";
import { fetcher, getDecisions } from "@/lib/api";
import { Brain, Search, Loader2, AlertCircle, CheckCircle2, XCircle, HelpCircle, Flag } from "lucide-react";

export default function AgentDecisions() {
  const workspaceId = "demo-workspace";
  const { data, error, isLoading } = useSWR(getDecisions(workspaceId), fetcher, { refreshInterval: 30000 });
  const { data: stats } = useSWR(getStats(workspaceId), fetcher, { refreshInterval: 10000 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const decisions = data?.decisions || [];
  const accuracy = stats?.hallucination_free || 100;
  const brainHealth = stats?.brain_health || 100;
  const healthStatus = stats?.health_status || "OPTIMAL";

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "permitted":
        return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20"><CheckCircle2 className="w-3 h-3" /> Permitted</span>;
      case "denied":
        return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20"><XCircle className="w-3 h-3" /> Denied</span>;
      case "escalate":
        return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><AlertCircle className="w-3 h-3" /> Escalate</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"><HelpCircle className="w-3 h-3" /> No Rule</span>;
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Agent Decisions</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Audit log of all autonomous actions and rule-based enforcement.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Diagnostic Accuracy</span>
            <span className="text-lg font-bold text-green-600">{accuracy}%</span>
          </div>
          <div className="w-px h-8 bg-zinc-200" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Avg. Confidence</span>
            <span className="text-lg font-bold text-blue-600">{brainHealth}%</span>
          </div>
          <div className="w-px h-8 bg-zinc-200" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Health</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${healthStatus === 'OPTIMAL' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs font-bold text-zinc-700">{healthStatus}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Decision</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confidence</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Flagged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {decisions.length > 0 ? (
              decisions.map((d: any) => (
                <tr key={d.audit_id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors truncate max-w-xs">{d.action}</span>
                      <span className="text-[10px] text-zinc-400 font-mono mt-1">ID: {d.audit_id.split("-")[0]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getDecisionBadge(d.decision)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between w-24">
                        <span className="text-[10px] text-zinc-500 font-bold">{Math.round((d.confidence || 0) * 100)}%</span>
                      </div>
                      <div className="w-24 h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${d.confidence > 0.85 ? 'bg-green-500' : d.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${(d.confidence || 0) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-zinc-500">{new Date(d.created_at).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className={`${d.agent_feedback ? 'text-red-500' : 'text-zinc-300 hover:text-zinc-500'} transition-colors`}>
                      <Flag className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm italic">
                  No decision logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
