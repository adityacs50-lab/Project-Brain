"use client";

import { useState } from "react";
import { 
  Code2, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  Key, 
  Zap, 
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Cpu
} from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function DeveloperPortal() {
  const { workspaceId } = useWorkspace();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const apiKey = `sk_live_${workspaceId || "demo"}_${Math.random().toString(36).substring(7)}`;

  const pythonCode = `from statelock import StateLock

# Initialize with your workspace API Key
sl = StateLock(api_key="${apiKey}")

# Enforce governance on any agent action
result = sl.enforce(
    action="refund $450", 
    user_role="support_lead",
    customer_id="cust_9921"
)

if result.is_permitted():
    print("Action approved by Adjudication Engine")
else:
    print(f"Action blocked: {result.reason}")`;

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
          <Cpu className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Developer Access</span>
        </div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Integration Layer.</h1>
        <p className="text-zinc-500 max-w-md">Connect your autonomous agents to the StateLock Adjudication Engine via our lightweight SDKs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: API Key & Quick Start */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* API Key Card */}
          <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Key className="w-32 h-32 text-zinc-900" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Key className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Workspace API Key</h2>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-zinc-900 rounded-2xl p-4 flex items-center justify-between gap-4">
                <code className="text-emerald-400 font-mono text-sm break-all">
                  {apiKey}
                </code>
                <button 
                  onClick={() => copyToClipboard(apiKey, setCopiedKey)}
                  className="shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                >
                  {copiedKey ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Production Key</span>
              </div>
              <div className="h-4 w-px bg-zinc-200" />
              <button className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest">Revoke Key</button>
            </div>
          </div>

          {/* Code Example Card */}
          <div className="bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">example_agent.py</span>
              </div>
              <button 
                onClick={() => copyToClipboard(pythonCode, setCopiedCode)}
                className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                {copiedCode ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? "Copied!" : "Copy Snippet"}
              </button>
            </div>
            <div className="p-8">
              <pre className="text-emerald-400/90 font-mono text-sm leading-relaxed overflow-x-auto">
                <code>{pythonCode}</code>
              </pre>
            </div>
            <div className="px-8 py-4 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ultra-Low Latency (~45ms)</span>
              </div>
              <Link href="/docs" className="text-[10px] font-bold text-emerald-500 hover:underline uppercase tracking-widest flex items-center gap-1">
                Full SDK Docs
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Resources & Stats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">Integration Progress</h3>
            <div className="space-y-6">
              {[
                { label: "Python SDK", status: "GA v0.1.0", color: "emerald", icon: <Terminal className="w-4 h-4" /> },
                { label: "Node.js SDK", status: "Coming Soon", color: "zinc", icon: <Code2 className="w-4 h-4" /> },
                { label: "REST API", status: "Live", color: "emerald", icon: <Globe className="w-4 h-4" /> },
                { label: "Slack Ingestion", status: "Active", color: "emerald", icon: <Zap className="w-4 h-4" /> }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${item.color}-500/10 rounded-lg`}>
                      <div className={`text-${item.color}-600`}>{item.icon}</div>
                    </div>
                    <span className="text-sm font-bold text-zinc-700">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-600`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[32px] p-8 text-white relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
               <BookOpen className="w-24 h-24" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Read the <br />Documentation.</h3>
            <p className="text-emerald-100 text-sm mb-6 max-w-[180px]">Learn how to implement complex logic graphs and multi-perspective adjudication.</p>
            <div className="flex items-center gap-2 font-bold text-sm">
              View Docs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="bg-zinc-100 border border-zinc-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center">
            <ShieldCheck className="w-12 h-12 text-zinc-300 mb-4" />
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Security Audit</p>
            <p className="text-xs text-zinc-500">All API keys are encrypted at rest using AES-256-GCM.</p>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-6 py-6 opacity-30 grayscale">
         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Runtime_Gateway_Active</span>
         <div className="w-1 h-1 rounded-full bg-zinc-400" />
         <span className="text-[10px] font-black uppercase tracking-[0.3em]">SSL_Secured_256bit</span>
      </div>
    </div>
  );
}

// Simple Globe icon mock since lucide doesn't have it imported or I missed it
function Globe({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
