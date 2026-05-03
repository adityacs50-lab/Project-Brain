"use client";

import useSWR from "swr";
import { Activity, Brain, CheckCircle2, AlertTriangle, ArrowRight, Zap, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetcher, getRules, getStats } from "@/lib/api";
import { StatsBar } from "@/components/StatsBar";

export default function Dashboard() {
  const workspaceId = "demo-workspace";
  const { data: rules, error: rulesError, isLoading: rulesLoading } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });
  const { data: stats, error: statsError } = useSWR(getStats(workspaceId), fetcher, { refreshInterval: 10000 });

  if (rulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const recentRules = [...(rules || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const brainHealth = stats?.brain_health || 100;
  const hallucinationFree = stats?.hallucination_free || 100;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Company Brain</h1>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Online</span>
          </div>
        </div>
      </div>

      <StatsBar workspaceId={workspaceId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Recent Rule Activity
            </h2>
            <Link href="/active-rules" className="text-xs text-zinc-500 hover:text-blue-600 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="divide-y divide-zinc-100">
            {recentRules.length > 0 ? (
              recentRules.map((rule, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${rule.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {rule.status === 'active' ? <ShieldCheck className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">{rule.title}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{rule.source_channel || "#general"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">{new Date(rule.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-tighter">{rule.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm text-zinc-400">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Intelligence Health */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          <div className="absolute top-4 left-6">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              Brain Health
            </h2>
          </div>

          <div className="mt-8 relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" className="stroke-zinc-100" strokeWidth="12" fill="none" />
              <circle 
                cx="96" 
                cy="96" 
                r="80" 
                className="stroke-blue-600" 
                strokeWidth="12" 
                fill="none" 
                strokeDasharray="502" 
                strokeDashoffset={502 - (502 * brainHealth) / 100} 
                strokeLinecap="round" 
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-zinc-900">{brainHealth}%</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Confidence</span>
            </div>
          </div>
          
          <div className="mt-8 w-full space-y-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-zinc-500">Hallucination Free</span>
              <span className="text-xs font-bold text-green-600">{hallucinationFree}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${hallucinationFree}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
