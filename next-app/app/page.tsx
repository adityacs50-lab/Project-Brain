"use client";

import { Activity, Brain, CheckCircle2, AlertTriangle, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { StatsBar } from "@/components/StatsBar";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
            Company Brain <span className="text-gradient">Overview</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time monitoring of your organization&apos;s living operating system.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md shadow-lg">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-sm font-medium text-white/90">System Online</span>
        </div>
      </div>

      <StatsBar workspaceId="demo-workspace" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Activity Feed */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full border border-white/10 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Rule Activity
            </h2>
            <Link href="/rules" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4 flex-1">
            {[
              { title: "Updated Refund Policy", time: "10 mins ago", type: "update", icon: Zap },
              { title: "New Enterprise Pricing Tier", time: "2 hours ago", type: "new", icon: ShieldCheck },
              { title: "SLA Response Times", time: "5 hours ago", type: "review", icon: AlertTriangle },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className={`p-2 rounded-lg ${item.type === 'update' ? 'bg-blue-500/20 text-blue-400' : item.type === 'new' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-white/90 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Health */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full border border-white/10 hover:border-primary/30 transition-colors relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Brain Health
            </h2>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" className="stroke-white/10" strokeWidth="8" fill="none" />
                  <circle cx="64" cy="64" r="60" className="stroke-green-500" strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset="40" strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold">89%</span>
                  <span className="text-xs text-muted-foreground">Confidence</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Hallucination Free</span>
                <span className="font-medium">100%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Contradiction Free</span>
                <span className="font-medium text-orange-400">Reviewing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
