import useSWR from "swr";
import { fetcher, getRules, getContradictions } from "@/lib/api";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertOctagon, TrendingUp } from "lucide-react";

export function StatsBar({ workspaceId }: { workspaceId: string }) {
  const { data: rules, isValidating } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });
  const { data: contradictions } = useSWR(getContradictions(workspaceId), fetcher, { refreshInterval: 30000 });

  const totalActive = rules?.filter((r: {status: string}) => r.status === "active").length || 0;
  const pendingReview = rules?.filter((r: {status: string}) => r.status === "pending").length || 0;
  const totalContradictions = contradictions?.length || 0;

  const stats = [
    {
      title: "Active Rules",
      value: totalActive,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Pending Review",
      value: pendingReview,
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Contradictions",
      value: totalContradictions,
      icon: AlertOctagon,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 w-full">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.title}</span>
            <div className={`p-1.5 rounded-md ${stat.bg}`}>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
