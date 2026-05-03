import useSWR from "swr";
import { fetcher, getRules, getContradictions } from "@/lib/api";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertOctagon, TrendingUp } from "lucide-react";

export function StatsBar({ workspaceId }: { workspaceId: string }) {
  const { data: rules, isValidating } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });
  const { data: contradictions } = useSWR(getContradictions(workspaceId), fetcher, { refreshInterval: 30000 });
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!isValidating) setLastUpdated(Date.now());
  }, [isValidating, rules, contradictions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const totalActive = rules?.filter((r: {status: string}) => r.status === "active").length || 0;
  const pendingReview = rules?.filter((r: {status: string}) => r.status === "pending").length || 0;
  const totalContradictions = contradictions?.length || 0;

  const stats = [
    {
      title: "Active Rules",
      value: totalActive,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "group-hover:border-green-500/50",
      trend: "+12% this week"
    },
    {
      title: "Pending Review",
      value: pendingReview,
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "group-hover:border-blue-500/50",
      trend: "Needs attention"
    },
    {
      title: "Contradictions",
      value: totalContradictions,
      icon: AlertOctagon,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "group-hover:border-orange-500/50",
      trend: "Resolved 3 today"
    }
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-end text-xs text-muted-foreground mb-3 items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white/50"></span>
        </span>
        Synced {secondsAgo}s ago
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className={`glass-card rounded-2xl p-5 border border-white/5 transition-all duration-300 group ${stat.border} hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${stat.bg.replace('/10', '')}`}></div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <h3 className="text-sm font-medium text-white/70">{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="flex flex-col relative z-10 mt-2">
              <div className="text-3xl font-bold tracking-tight text-white">{stat.value}</div>
              <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
