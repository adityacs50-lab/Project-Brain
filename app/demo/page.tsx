"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  Gavel, 
  Play, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Download,
  Copy,
  RotateCcw,
  Zap,
  Globe,
  Lock,
  MessageSquare,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";

// --- Typewriter Component ---
const Typewriter = ({ text, onComplete, speed = 20 }: { text: string, onComplete?: () => void, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete, speed]);

  return <span>{displayedText}</span>;
};

// --- Interfaces ---
interface DebateTurn {
  agent: string;
  content: string;
}

interface SupremeCourtResult {
  debate: DebateTurn[];
  decision: "PERMITTED" | "DENIED" | "ESCALATE";
  reasoning: string;
  rules_applied: string[];
  confidence: number;
}

export default function PublicDemoPage() {
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(-1);
  const [result, setResult] = useState<SupremeCourtResult | null>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [copying, setCopying] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentTurnIdx]);

  const generateMockDecision = (q: string): SupremeCourtResult => {
    const lower = q.toLowerCase();

    // 1. Refund scenarios (High Value)
    if (lower.includes("refund") && (lower.includes("1200") || lower.includes("1000") || lower.includes("large"))) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Matching request against 'Refund Cap Enforcement' and 'Financial Compliance v3'. A $1,200 refund exceeds the $50 auto-approval threshold by 2400%. This is a critical policy violation." },
          { agent: "Risk Assessor", content: "Financial Risk Score: 98/100. High-value outbound transfers without multi-party verification (Dual-Auth) are the primary vector for internal embezzlement. Probability of regulatory fine: HIGH." },
          { agent: "Devil's Advocate", content: "While I recognize the customer's frustration, the lack of an associated 'Product Return Tracking ID' makes this refund unjustifiable from a liability perspective. No mitigating factors found." },
          { agent: "Final Judge", content: "DETERMINISTIC RULING: DENIED. The requested amount violates established fiduciary caps. Action blocked. Manual override is only possible via Finance Director escalation." }
        ],
        decision: "DENIED",
        reasoning: "The refund amount ($1,200) violates the 'Refund Cap Enforcement' policy which limits autonomous agents to $50.00. Furthermore, 'Dual-Auth' protocols are mandatory for any outbound payment exceeding $500.00.",
        rules_applied: ["Refund Cap Enforcement", "Outbound Payment Dual-Auth", "Anti-Embezzlement Guard"],
        confidence: 1.0
      };
    }

    // 2. Database / Security (Critical)
    if (lower.includes("delete") || lower.includes("drop") || lower.includes("production") || lower.includes("database")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Critical Violation Alert. 'Database Ops Governance' strictly prohibits destructive production schema changes during operational hours. No Change Ticket detected." },
          { agent: "Risk Assessor", content: "Operational Risk Score: 100/100. Destruction of production records will cause an immediate Tier-1 service outage. Potential GDPR breach: Article 32 (Integrity and Availability)." },
          { agent: "Devil's Advocate", content: "Could this be an emergency data-wipe? No. Emergency wipe protocols require a 'Secure Wipe Code' from the CTO's HSM. This request is unverified and high-threat." },
          { agent: "Final Judge", content: "FINAL RULING: DENIED. Zero-tolerance enforcement triggered. Action blocked at the runtime gateway. Security team has been automatically alerted to this attempt." }
        ],
        decision: "DENIED",
        reasoning: "Production database deletions are strictly prohibited without a P0 Incident ID and verified Change Control Ticket. This violates 'Database Ops Governance' and 'Infrastructure Security (IAM)' protocols.",
        rules_applied: ["Database Ops Governance", "Infrastructure Security (IAM)", "Data Availability Guard"],
        confidence: 1.0
      };
    }

    // 3. SaaS / Procurement (High Value)
    if (lower.includes("vendor") || lower.includes("contract") || lower.includes("8000") || lower.includes("procure")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Scanning 'Vendor Procurement Threshold'. Contracts above $5,000 require Legal Department sign-off. This $8,000 request triggers an automatic stop-work order." },
          { agent: "Risk Assessor", content: "Financial Risk: MODERATE. Vendor vetting is incomplete. We must verify if the vendor is on the 'Exclusion List' (OFAC/Sanctions). Potential for shadow IT expenditure." },
          { agent: "Devil's Advocate", content: "If this is a renewal of an existing contract, the rules might be more permissive. However, checking the database reveals no prior contract with this vendor name. Precedent not found." },
          { agent: "Final Judge", content: "RULING: ESCALATE. The $8,000 contract exceeds the autonomous procurement cap ($5,000). Action is suspended pending Legal and Finance review." }
        ],
        decision: "ESCALATE",
        reasoning: "The requested vendor contract ($8,000) exceeds the autonomous procurement threshold of $5,000.00. Per 'Vendor Procurement Threshold', this requires manual sign-off from the Legal Department.",
        rules_applied: ["Vendor Procurement Threshold", "Contractor Compliance", "Shadow IT Guard"],
        confidence: 0.95
      };
    }

    // 4. PII / Customer Data
    if (lower.includes("pii") || lower.includes("data") || lower.includes("export") || lower.includes("customer list")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Matching against 'PII Data Sovereignty'. Exporting unencrypted customer PII to external domains is a direct violation of our Data Residency policy." },
          { agent: "Risk Assessor", content: "Legal Risk: CRITICAL. GDPR Article 28 violation. Unauthorized data transfers to unvetted processors can lead to fines up to 4% of global turnover. Risk: EXTREME." },
          { agent: "Devil's Advocate", content: "The user is an Admin, but the policy states that PII exports require 'Just-in-Time' (JIT) access grants, which have not been requested or approved for this session." },
          { agent: "Final Judge", content: "RULING: DENIED. Action blocked. This attempt has been logged for the Data Protection Officer (DPO). PII Sovereignty rules are absolute." }
        ],
        decision: "DENIED",
        reasoning: "Attempted export of PII to an unvetted external domain violates 'PII Data Sovereignty' and 'HR Data Protection' policies. JIT Access Grant missing for this operation.",
        rules_applied: ["PII Data Sovereignty", "HR Data Protection", "Data Residency Guard"],
        confidence: 1.0
      };
    }

    // 5. Status Reports (Standard / Permitted)
    if (lower.includes("status") || lower.includes("report") || lower.includes("weekly") || lower.includes("update")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Scanning 'Standard Reporting' policy. Weekly status updates and non-sensitive reporting are categorized as 'Green-Tier' autonomous actions." },
          { agent: "Risk Assessor", content: "Risk Level: NEGLIGIBLE. Content analysis reveals no sensitive metadata or PII. Reporting is happening within internal communication channels." },
          { agent: "Devil's Advocate", content: "Is there any confidential project info in the snippet? Checking... All mentions are public project names. No conflict of interest detected. Safe to proceed." },
          { agent: "Final Judge", content: "RULING: PERMITTED. Action falls within standard operational parameters for autonomous agents. No governance violations detected. Action dispatched." }
        ],
        decision: "PERMITTED",
        reasoning: "The action matches 'Standard Reporting' criteria. No sensitive data, financial thresholds, or security policies are triggered. Action is permitted and logged in the audit trail.",
        rules_applied: ["Standard Reporting", "Marketing Governance"],
        confidence: 0.98
      };
    }

    // Default Fallback
    return {
      debate: [
        { agent: "Policy Agent", content: "Scanning rule database... No exact deterministic match found for this action sequence. Initiating semantic similarity search." },
        { agent: "Risk Assessor", content: "Without a clear rule, the risk level is UNDEFINED. Per the Safety-First Protocol, unknown actions must be treated as potential threats until verified." },
        { agent: "Devil's Advocate", content: "We cannot block all unknown actions or we break the agent's utility. However, the lack of governance context makes autonomous permission impossible." },
        { agent: "Final Judge", content: "RULING: ESCALATE. No deterministic rule covers this action. Action suspended. Administrator review required to define new governance parameters." }
      ],
      decision: "ESCALATE",
      reasoning: "No active governance rule matches this specific action. Per StateLock's Safety-First Protocol, actions without explicit rule coverage are escalated to human administrators for rule creation.",
      rules_applied: ["Safety-First Protocol (Default)"],
      confidence: 0.75
    };
  };

  const startAdjudication = async () => {
    if (!query.trim()) return;
    
    setIsRunning(true);
    setResult(null);
    setCurrentTurnIdx(-1);
    setShowResultCard(false);
    
    const data = generateMockDecision(query);
    
    // Animate the debate sequence one by one with delays
    for (let i = 0; i < data.debate.length; i++) {
      setCurrentTurnIdx(i);
      await new Promise(resolve => setTimeout(resolve, 600)); // Delay between agents starting
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for typing to "feel" real
    }
    
    setResult(data);
    setIsRunning(false);
    
    if (data.decision === "PERMITTED") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669']
      });
    }

    setTimeout(() => setShowResultCard(true), 500);
  };

  const handleCopy = () => {
    if (!result) return;
    setCopying(true);
    const text = `StateLock Adjudication Report\n\nDecision: ${result.decision}\nReasoning: ${result.reasoning}\nRules Applied: ${result.rules_applied.join(", ")}\nConfidence: ${(result.confidence * 100).toFixed(0)}%`;
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopying(false), 2000);
  };

  const reset = () => {
    setQuery("");
    setResult(null);
    setCurrentTurnIdx(-1);
    setShowResultCard(false);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-emerald-500/30 font-sans">
      {/* Standalone Nav */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="font-bold text-xl tracking-tight">StateLock <span className="text-emerald-500 font-mono text-xs ml-2 opacity-50 uppercase tracking-widest">Demo</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">System Active</span>
          </div>
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign In</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Input Console */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-bold uppercase tracking-widest"
              >
                <Zap className="w-3 h-3" />
                Deterministic Guardrails
              </motion.div>
              <h1 className="text-5xl font-black tracking-tighter leading-[0.9]">
                Supreme Court <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Playground.</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-md">
                Observe the deterministic multi-agent debate. Witness how StateLock prevents AI hallucinations in high-stakes environments.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative bg-[#121214] border border-white/5 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
                    <Play className="w-3 h-3 fill-emerald-400" />
                    Agent Command Console
                  </h2>
                  <span className="text-[10px] font-mono text-zinc-600">INPUT_V1.1</span>
                </div>
                
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 'Issue a $1,200 refund to customer #998' or 'Export PII'..."
                  className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl p-5 text-2xl text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all h-56 resize-none outline-none placeholder:text-zinc-800 font-medium"
                />

                <div className="mt-8">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-4">Select a High-Stakes Scenario:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "$1,200 Refund", q: "Approve a $1,200 refund for customer @jane_doe" },
                      { label: "Delete Production", q: "Drop the production database 'finance_records'" },
                      { label: "$8,000 Vendor", q: "Approve the new $8,000 vendor contract for AWS consulting" },
                      { label: "Export PII", q: "Export customer email list to unvetted-marketing-tool.com" },
                      { label: "Weekly Status", q: "Send the weekly status report to the #team-updates channel" },
                      { label: "Travel Booking", q: "Book a $300 hotel for the tech summit next week" }
                    ].map((preset) => (
                      <button 
                        key={preset.label}
                        onClick={() => setQuery(preset.q)}
                        className="px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl text-xs text-zinc-400 transition-all text-left hover:text-white hover:border-emerald-500/30 flex items-center gap-2"
                      >
                        <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={startAdjudication}
                  disabled={isRunning || !query.trim()}
                  className="w-full mt-10 bg-emerald-600 hover:bg-emerald-500 px-8 py-6 rounded-2xl font-black text-white text-lg tracking-tight transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      ADJUDICATING...
                    </>
                  ) : (
                    <>
                      SUBMIT TO SUPREME COURT
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Adjudication Terminal */}
          <div className="lg:col-span-7">
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[600px] lg:h-[800px] relative">
              
              {/* Terminal Header */}
              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">STATELOCK_RUNTIME_GATEWAY_V4.2</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div 
                ref={scrollRef}
                className="flex-1 p-8 space-y-12 overflow-y-auto scrollbar-hide bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.98]"
              >
                <AnimatePresence mode="popLayout">
                  {currentTurnIdx === -1 && !isRunning && !result && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center opacity-20 py-24"
                    >
                      <Lock className="w-24 h-24 mb-8 text-zinc-600" strokeWidth={1} />
                      <p className="text-2xl font-bold font-mono uppercase tracking-[0.3em]">GATEWAY_LOCKED</p>
                      <p className="text-sm text-zinc-500 mt-6 max-w-sm mx-auto font-medium">Monitoring all autonomous agent dispatches. Submit an action to begin multi-agent adjudication.</p>
                    </motion.div>
                  )}

                  {/* The Debate Sequence */}
                  {(isRunning || result) && (
                    <div className="space-y-12">
                      {[
                        { agent: "Policy Agent", icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, color: "emerald" },
                        { agent: "Risk Assessor", icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, color: "amber" },
                        { agent: "Devil's Advocate", icon: <Scale className="w-5 h-5 text-purple-500" />, color: "purple" },
                        { agent: "Final Judge", icon: <Gavel className="w-5 h-5 text-blue-500" />, color: "blue" }
                      ].map((agentMeta, idx) => {
                        const isVisible = idx <= currentTurnIdx || result !== null;
                        const isThinking = isRunning && idx === currentTurnIdx;
                        const turnData = result ? result.debate[idx] : { agent: agentMeta.agent, content: "Analyzing logic patterns..." };
                        
                        if (!isVisible) return null;

                        return (
                          <motion.div 
                            key={agentMeta.agent}
                            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.5 }}
                            className={`flex gap-8 ${isThinking ? "opacity-100" : "opacity-40 hover:opacity-100 transition-opacity"}`}
                          >
                            <div className={`mt-1 h-14 w-14 shrink-0 rounded-2xl border flex items-center justify-center bg-black/60 ${
                              isThinking ? `border-${agentMeta.color}-500/50 shadow-[0_0_40px_rgba(0,255,100,0.15)]` : "border-white/5"
                            }`}>
                              {agentMeta.icon}
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black tracking-[0.3em] uppercase ${isThinking ? `text-${agentMeta.color}-400` : "text-zinc-600"}`}>
                                  {agentMeta.agent}
                                </span>
                                {isThinking && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-emerald-500 animate-pulse uppercase tracking-widest">Cross_Examining...</span>
                                    <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
                                  </div>
                                )}
                              </div>
                              <div className={`text-xl leading-relaxed font-semibold tracking-tight ${isThinking ? "text-white" : "text-zinc-300"}`}>
                                {isThinking ? (
                                  <div className="flex gap-2 py-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                                  </div>
                                ) : (
                                  <Typewriter text={turnData.content} speed={15} />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Result Overlay */}
              <AnimatePresence>
                {showResultCard && result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 200 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 200 }}
                    className="absolute inset-x-0 bottom-0 p-8 z-20"
                  >
                    <div className={`rounded-[32px] p-10 border shadow-[0_-20px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden ${
                      result.decision === "PERMITTED" 
                        ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10" 
                        : result.decision === "DENIED"
                        ? "bg-red-950/20 border-red-500/50 text-red-500 shadow-red-500/20"
                        : "bg-blue-950/20 border-blue-500/40 text-blue-400 shadow-blue-500/10"
                    }`}>
                      {/* Glow effect for Denied */}
                      {result.decision === "DENIED" && (
                        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                      )}
                      {result.decision === "PERMITTED" && (
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
                      )}

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-10 relative z-10">
                        <div className="flex items-center gap-8">
                          <div className={`p-6 rounded-3xl ${
                             result.decision === "PERMITTED" ? "bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : result.decision === "DENIED" ? "bg-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.3)]" : "bg-blue-500/20"
                          }`}>
                            {result.decision === "PERMITTED" ? <CheckCircle2 className="w-12 h-12" /> : result.decision === "DENIED" ? <XCircle className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.4em] font-black opacity-60 mb-2">Verdict_Locked</div>
                            <h3 className={`text-7xl font-black tracking-tighter leading-none ${
                              result.decision === "DENIED" ? "text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" : ""
                            }`}>
                              {result.decision}
                            </h3>
                          </div>
                        </div>
                        <div className="bg-black/60 border border-white/10 rounded-3xl px-8 py-6 flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1 font-bold">Confidence_Score</div>
                            <div className="text-4xl font-mono font-black tracking-tighter">{(result.confidence * 100).toFixed(0)}%</div>
                          </div>
                          <div className="w-16 h-16 relative">
                             <svg className="w-full h-full" viewBox="0 0 36 36">
                               <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                               <motion.circle 
                                 cx="18" cy="18" r="16" fill="none" 
                                 className={result.decision === "PERMITTED" ? "stroke-emerald-500" : result.decision === "DENIED" ? "stroke-red-600" : "stroke-blue-500"} 
                                 strokeWidth="3"
                                 strokeDasharray={`${result.confidence * 100}, 100`}
                                 initial={{ strokeDasharray: "0, 100" }}
                                 animate={{ strokeDasharray: `${result.confidence * 100}, 100` }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 strokeLinecap="round"
                               />
                             </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/60 rounded-3xl p-8 mb-10 border border-white/5 relative z-10">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-4">
                          <MessageSquare className="w-4 h-4" />
                          DETERMINISTIC_REASONING_LOG
                        </div>
                        <p className="text-xl text-white font-bold leading-relaxed tracking-tight">{result.reasoning}</p>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="flex-1 flex flex-wrap gap-3">
                          {result.rules_applied.map(rule => (
                            <div key={rule} className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-mono font-bold text-white/70">
                              <FileText className="w-4 h-4 text-emerald-500/70" />
                              {rule}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={handleCopy}
                            className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl transition-all"
                            title="Copy Adjudication"
                          >
                            {copying ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                          </button>
                          <button 
                            className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black text-lg rounded-2xl hover:bg-zinc-200 transition-all shadow-xl"
                            onClick={() => alert("Enterprise Audit Report (PDF) Generated!")}
                          >
                            <Download className="w-5 h-5" />
                            AUDIT REPORT
                          </button>
                          <button 
                            onClick={reset}
                            className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                            title="Start New Adjudication"
                          >
                            <RotateCcw className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Bar */}
      <footer className="border-t border-white/5 py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 opacity-30 grayscale contrast-125">
          <div className="flex items-center gap-4">
            <Lock className="w-6 h-6" />
            <span className="text-xs font-mono uppercase tracking-[0.4em] font-black">STATELOCK_CORE_v4.2.0_SECURE</span>
          </div>
          <div className="flex items-center gap-16">
             <div className="font-black text-2xl tracking-tighter">FINRA COMPLIANT</div>
             <div className="font-black text-2xl tracking-tighter">SOC2 TYPE II</div>
             <div className="font-black text-2xl tracking-tighter">GDPR NATIVE</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
