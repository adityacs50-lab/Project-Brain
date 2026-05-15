"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, getRules, updateRuleStatus } from "@/lib/api";
import { 
  Search, 
  Workflow, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  AlertCircle, 
  MessageSquare, 
  ShieldCheck, 
  Zap,
  History,
  FileText
} from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { motion, AnimatePresence } from "framer-motion";

interface Rule {
  id: string;
  title: string;
  rule_text: string;
  status: "pending" | "active" | "archived" | "rejected";
  confidence: number;
  source_message?: string;
  source_channel?: string;
  version: number;
  created_at: string;
  action_type?: string;
  threshold_value?: number;
  threshold_currency?: string;
  operator?: string;
}

export default function ActiveRules() {
  const { workspaceId } = useWorkspace();
  const { data: rules, isLoading } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // MOCK DATA for "first glance" impact if API is empty
  const mockPending: Rule[] = [
    {
      id: "mock-1",
      title: "Refund Threshold Extraction",
      rule_text: "Autonomous agents are permitted to issue refunds up to $50 without dual-authorization.",
      status: "pending",
      confidence: 0.94,
      source_message: "@support-bot: Hey team, should we auto-approve small refunds? Usually under $50 is fine.",
      source_channel: "#ops-strategy",
      version: 1,
      created_at: new Date().toISOString()
    },
    {
      id: "mock-2",
      title: "Production Access Protocol",
      rule_text: "Any deletion of production records requires an active P0 Incident ID and Change Ticket.",
      status: "pending",
      confidence: 0.88,
      source_message: "We need a rule that nobody drops tables in prod without a ticket. Period.",
      source_channel: "#engineering",
      version: 1,
      created_at: new Date().toISOString()
    }
  ];

  const allRules: Rule[] = rules || [];
  const displayRules = (activeTab === "pending" && allRules.filter(r => r.status === "pending").length === 0) 
    ? mockPending 
    : allRules.filter((r: Rule) => r.status === activeTab);

  const filteredRules = displayRules.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.rule_text.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusUpdate = async (ruleId: string, newStatus: string) => {
    if (ruleId.startsWith("mock-")) {
      alert("This is a mock rule for demo purposes. In production, this would update the database.");
      return;
    }
    
    setProcessingId(ruleId);
    try {
      await updateRuleStatus(ruleId, newStatus, undefined, "Umesh Shinde");
      mutate(getRules(workspaceId));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading && !rules) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Loading Governance Engine...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto py-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Governance Control</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Rule Management.</h1>
          <p className="text-zinc-500 max-w-md">Approved rules are enforced deterministically by the StateLock Supreme Court.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter rules..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
            <Plus className="w-4 h-4" />
            New Hard Rule
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl w-fit border border-zinc-200 shadow-inner">
        <button 
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "pending" 
              ? "bg-white text-emerald-600 shadow-sm ring-1 ring-zinc-200" 
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Zap className={`w-4 h-4 ${activeTab === "pending" ? "text-emerald-500" : ""}`} />
          Pending Review
          <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
            activeTab === "pending" ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-200 text-zinc-500"
          }`}>
            {allRules.filter(r => r.status === "pending").length || 2}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "active" 
              ? "bg-white text-emerald-600 shadow-sm ring-1 ring-zinc-200" 
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${activeTab === "active" ? "text-emerald-500" : ""}`} />
          Active Rules
          <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
            activeTab === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-200 text-zinc-500"
          }`}>
            {allRules.filter(r => r.status === "active").length}
          </span>
        </button>
      </div>

      {/* Rules Feed */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRules.length > 0 ? (
            filteredRules.map((rule) => (
              <motion.div 
                key={rule.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white border border-zinc-200 rounded-3xl p-6 hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/[0.02] relative overflow-hidden"
              >
                {activeTab === "pending" && (
                  <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500/50" />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Rule Details */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-zinc-900 group-hover:text-emerald-600 transition-colors">
                          {rule.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            v{rule.version}.0
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-widest">
                            <History className="w-3 h-3" />
                            Extracted {new Date(rule.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                           rule.confidence > 0.9 ? "bg-emerald-50 border-emerald-500/20 text-emerald-600" : "bg-amber-50 border-amber-500/20 text-amber-600"
                         }`}>
                           <Zap className="w-3 h-3" />
                           {Math.round(rule.confidence * 100)}% Match
                         </div>
                      </div>
                    </div>

                    <div className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                        <FileText className="w-3 h-3" />
                        Governance Logic
                      </div>
                      <p className="text-zinc-800 font-semibold leading-relaxed">
                        {rule.rule_text}
                      </p>
                    </div>

                    {rule.source_message && (
                      <div className="bg-emerald-50/30 border border-emerald-500/10 rounded-2xl p-4 flex gap-4">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Source Message</span>
                            <span className="text-[10px] font-medium text-zinc-400">{rule.source_channel || "#general"}</span>
                          </div>
                          <p className="text-sm text-zinc-600 italic">&quot;{rule.source_message}&quot;</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions / Metadata */}
                  <div className="lg:col-span-5 h-full flex flex-col justify-between gap-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Risk Level</div>
                          <div className={`text-sm font-black uppercase ${
                            rule.rule_text.toLowerCase().includes("delete") || rule.rule_text.toLowerCase().includes("refund") ? "text-red-500" : "text-amber-500"
                          }`}>
                            {rule.rule_text.toLowerCase().includes("delete") ? "Critical" : "Moderate"}
                          </div>
                       </div>
                       <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Impact</div>
                          <div className="text-sm font-black text-zinc-900 uppercase">Deterministic</div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeTab === "pending" ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(rule.id, "active")}
                            disabled={processingId === rule.id}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {processingId === rule.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Approve Rule
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(rule.id, "rejected")}
                            disabled={processingId === rule.id}
                            className="flex-1 bg-white border border-zinc-200 text-zinc-600 hover:text-red-600 hover:border-red-500/30 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleStatusUpdate(rule.id, "archived")}
                          className="flex-1 bg-white border border-zinc-200 text-zinc-600 hover:text-red-600 hover:border-red-500/30 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                          <AlertCircle className="w-5 h-5" />
                          Deactivate Rule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
               <Workflow className="w-16 h-16 mb-4 text-zinc-300" />
               <p className="text-lg font-bold text-zinc-400">No {activeTab} rules found.</p>
               <p className="text-sm text-zinc-400">Governance engine is standing by.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-6 py-10 opacity-30 grayscale pointer-events-none">
         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Compliance_Engine_Secure</span>
         <div className="w-1 h-1 rounded-full bg-zinc-400" />
         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Version_4.2.1</span>
      </div>
    </div>
  );
}
