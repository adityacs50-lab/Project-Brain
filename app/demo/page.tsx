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
  HelpCircle,
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

// --- Typewriter Component ---
const Typewriter = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 15); // Faster typing
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete]);

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
    if (lower.includes("refund") && (lower.includes("1000") || lower.includes("500") || lower.includes("large"))) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Matching request against 'Refund Cap Enforcement'. A $1,000 refund far exceeds the $50 auto-approval threshold. Dual-authorization is required for all outbound payments >$500." },
          { agent: "Risk Assessor", content: "Financial Risk Level: HIGH. High-value refunds without multi-factor verification are the #1 vector for internal fraud. Recommend immediate block and manual review." },
          { agent: "Devil's Advocate", content: "Wait — check if this is a 'Gold Tier' customer with a lifetime value >$50k. If so, a delay might cost us a churn. However, the policy is deterministic for a reason. Rules over relationships." },
          { agent: "Final Judge", content: "DETERMINISTIC RULING: DENIED. The Refund Cap ($50) is an absolute hard-limit. This request must be manually approved by a Finance Director. Audit trail locked." }
        ],
        decision: "DENIED",
        reasoning: "Action exceeds the $50 automatic refund threshold. Large outbound payments require explicit Finance Director authorization and dual-factor verification.",
        rules_applied: ["Refund Cap Enforcement", "Outbound Payment Dual-Auth"],
        confidence: 0.99
      };
    }

    // 2. Database / Security (Critical)
    if (lower.includes("delete") || lower.includes("drop") || lower.includes("production") || lower.includes("database")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Critical Violation Detected. 'Database Ops Governance' strictly prohibits production schema changes during business hours (UTC 09:00-17:00)." },
          { agent: "Risk Assessor", content: "Operational Risk: CATASTROPHIC. Deleting production records without a recovery ticket will cause an immediate customer-facing outage. Regulatory breach: Article 32 (Security of processing)." },
          { agent: "Devil's Advocate", content: "Could this be an emergency patch? Even so, the emergency override requires a 'P0 Incidient' ID which is missing from this request context." },
          { agent: "Final Judge", content: "FINAL RULING: DENIED. Zero-tolerance policy on production deletions. Action blocked at the gateway. Security team has been notified of the attempt." }
        ],
        decision: "DENIED",
        reasoning: "Production database deletions are strictly prohibited without a P0 Incident ID and Change Control Ticket. Security protocol 4-02-B triggered.",
        rules_applied: ["Database Ops Governance", "Infrastructure Security (IAM)"],
        confidence: 1.0
      };
    }

    // 3. SaaS / Procurement
    if (lower.includes("saas") || lower.includes("subscription") || lower.includes("buy") || lower.includes("procure")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Scanning 'Vendor Procurement Threshold'. New SaaS subscriptions require a security review if the annual cost exceeds $1,200. This request lacks vendor pricing details." },
          { agent: "Risk Assessor", content: "Shadow IT Risk: MODERATE. Purchasing unvetted SaaS tools can lead to data leaks. We must verify if the vendor is SOC2 compliant before permitting access." },
          { agent: "Devil's Advocate", content: "If the tool is on the 'Approved Vendor List' (e.g., Slack, Jira, AWS), we should permit it to avoid operational friction. Need to check the AVL database." },
          { agent: "Final Judge", content: "RULING: ESCALATE. Request is missing vendor compliance metadata. Escalating to Procurement & Security teams for vendor vetting." }
        ],
        decision: "ESCALATE",
        reasoning: "The request involves a new SaaS procurement. Vendor security vetting (SOC2/GDPR) and AVL status must be verified by the Procurement team before approval.",
        rules_applied: ["Vendor Procurement Threshold", "Contractor Compliance"],
        confidence: 0.92
      };
    }

    // 4. PII / Customer Data
    if (lower.includes("pii") || lower.includes("data") || lower.includes("export") || lower.includes("customer list")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Matching against 'PII Data Sovereignty'. Exporting customer lists to external domains requires an active Data Processing Agreement (DPA)." },
          { agent: "Risk Assessor", content: "Legal Risk: CRITICAL. GDPR Article 28 violation potential. Exporting unencrypted PII to a third-party is a high-risk event. Estimated fine liability: €2.4M." },
          { agent: "Devil's Advocate", content: "Is the destination domain internal? No, it is 'external-crm.io'. Unless we have an API handshake with a valid JWT, this is a clear breach of protocol." },
          { agent: "Final Judge", content: "RULING: DENIED. Action violates PII Sovereignty rules. Export blocked. All customer data transfers must happen through the hardened internal pipeline." }
        ],
        decision: "DENIED",
        reasoning: "Attempted export of PII to an unvetted external domain. This violates the PII Data Sovereignty policy and GDPR compliance requirements.",
        rules_applied: ["PII Data Sovereignty", "HR Data Protection"],
        confidence: 1.0
      };
    }

    // 5. Travel (Standard)
    if (lower.includes("travel") || lower.includes("flight") || lower.includes("hotel")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Matching against 'Standard Reporting' and 'Travel Expense Threshold'. Routine travel under $500 is pre-approved for Sales and Engineering teams." },
          { agent: "Risk Assessor", content: "Risk Level: LOW. The expense is within quarterly budget allocations. No compliance flags detected. Standard receipt capture protocol is active." },
          { agent: "Devil's Advocate", content: "Is this for a personal extension? The request doesn't specify. However, blocking small travel expenses kills team velocity. Recommend permitting." },
          { agent: "Final Judge", content: "RULING: PERMITTED. Request falls within standard operational thresholds. No governance rules are violated. Audit log generated." }
        ],
        decision: "PERMITTED",
        reasoning: "Travel expense is below the $500 threshold and matches the 'Standard Reporting' policy for routine business operations. Permitted with auto-logging.",
        rules_applied: ["Travel Expense Threshold", "Standard Reporting"],
        confidence: 0.96
      };
    }

    // 6. GitHub / Public Repo
    if (lower.includes("github") || lower.includes("public") || lower.includes("repo") || lower.includes("code")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Rule Match: 'Automated Secret Revocation' and 'Repo Governance'. Changing a private repository to public requires a 2-person security sign-off." },
          { agent: "Risk Assessor", content: "IP Leak Risk: EXTREME. Making repos public could expose hardcoded API keys or proprietary algorithms. Scanners must run before this action is even considered." },
          { agent: "Devil's Advocate", content: "Open sourcing code is good for the company brand. But the security cost of a leak outweighs the marketing benefit. Policy must be followed." },
          { agent: "Final Judge", content: "RULING: DENIED. Manual security audit required before changing repository visibility. Action blocked by Repo Governance policy." }
        ],
        decision: "DENIED",
        reasoning: "Changing repository visibility from Private to Public requires a mandatory security audit and secret-scanning pass per the Repo Governance policy.",
        rules_applied: ["Automated Secret Revocation", "Infrastructure Security (IAM)"],
        confidence: 0.98
      };
    }

    // 7. Small Refund ($45)
    if (lower.includes("refund") && lower.includes("45")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Matching against 'Refund Cap Enforcement'. The $45 amount is below the $50 threshold for automatic agent approval." },
          { agent: "Risk Assessor", content: "Risk Level: VERY LOW. Single-incident refund under threshold. Frequency check: User has not requested more than 3 refunds this month. OK." },
          { agent: "Devil's Advocate", content: "Should we check if the item was returned? For $45, the return shipping cost might exceed the item value. Standard 'Keep-it' refund protocol recommended." },
          { agent: "Final Judge", content: "RULING: PERMITTED. Request is within the deterministic 'safe zone' for autonomous agents. No further approval needed." }
        ],
        decision: "PERMITTED",
        reasoning: "Refund amount ($45) is within the autonomous approval threshold ($50) defined in 'Refund Cap Enforcement'. Action permitted and logged.",
        rules_applied: ["Refund Cap Enforcement"],
        confidence: 0.94
      };
    }

    // 8. Social Media Post
    if (lower.includes("twitter") || lower.includes("linkedin") || lower.includes("social") || lower.includes("post")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Matching against 'Marketing Governance'. Standard social media posts under 280 characters are permitted if they don't contain PII or financial data." },
          { agent: "Risk Assessor", content: "Reputational Risk: LOW. Content scanning for profanity or offensive keywords... Scanning complete. All clear. No sensitive data detected." },
          { agent: "Devil's Advocate", content: "Is the timing right? Posting on a Friday at 5 PM gets low engagement. Not a policy issue, but a business logic one. Proceed." },
          { agent: "Final Judge", content: "RULING: PERMITTED. Content matches Marketing Governance guidelines. No policy violations. Action dispatched to Social API." }
        ],
        decision: "PERMITTED",
        reasoning: "Social media content passed all keyword and sentiment filters. No sensitive data detected. Action permitted under Marketing Governance policy.",
        rules_applied: ["Marketing Governance", "Standard Reporting"],
        confidence: 0.97
      };
    }

    // Default
    return {
      debate: [
        { agent: "Policy Agent", content: "Scanning rule database... No exact deterministic match for this action. Semantic mapping is ambiguous." },
        { agent: "Risk Assessor", content: "Without a clear rule, the risk level is UNDEFINED. Safety-First protocol requires us to block and escalate for new rule creation." },
        { agent: "Devil's Advocate", content: "Blocking everything kills productivity. But in governance, a false positive (permitted bad action) is 100x worse than a false negative (blocked good action)." },
        { agent: "Final Judge", content: "RULING: ESCALATED. Action does not match any existing governance patterns. Escalating to Admin for rule definition." }
      ],
      decision: "ESCALATE",
      reasoning: "Action falls outside of the current deterministic rule library. Escalated to administrator for manual adjudication and potential new rule definition.",
      rules_applied: ["Safety-First Protocol"],
      confidence: 0.6
    };
  };

  const startAdjudication = async () => {
    if (!query.trim()) return;
    
    setIsRunning(true);
    setResult(null);
    setCurrentTurnIdx(-1);
    setShowResultCard(false);
    
    const data = generateMockDecision(query);
    
    // Animate the debate sequence one by one
    for (let i = 0; i < data.debate.length; i++) {
      setCurrentTurnIdx(i);
      // Wait for typing and a little pause
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    setResult(data);
    setIsRunning(false);
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
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-emerald-500/30">
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
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">System Live</span>
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
                Autonomous Governance
              </motion.div>
              <h1 className="text-5xl font-bold tracking-tight leading-tight">
                Supreme Court <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Playground.</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-md">
                Experience deterministic decision making. Input an action and watch the multi-agent consensus engine in action.
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
                  <span className="text-[10px] font-mono text-zinc-600">INPUT_V1.0</span>
                </div>
                
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 'Issue a $350 refund to customer #998' or 'Delete production database'..."
                  className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl p-5 text-xl text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all h-48 resize-none outline-none placeholder:text-zinc-700"
                />

                <div className="mt-6">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-3">Try a Realistic Scenario:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "$1,000 Refund", q: "Approve a $1,000 refund for customer @alice" },
                      { label: "Delete Production", q: "Drop the production database table 'users'" },
                      { label: "Travel Request", q: "Book a $450 flight for the Vegas conference" },
                      { label: "Public Repo", q: "Change the internal 'statelock-core' repo to public" },
                      { label: "Export PII", q: "Export the full customer email list to external-crm.io" },
                      { label: "Small Refund", q: "Refund $45 to customer #1234" }
                    ].map((preset) => (
                      <button 
                        key={preset.label}
                        onClick={() => setQuery(preset.q)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-zinc-400 transition-all hover:text-white hover:border-emerald-500/50"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={startAdjudication}
                  disabled={isRunning || !query.trim()}
                  className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 px-8 py-5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-emerald-500/10"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adjudicating Case...
                    </>
                  ) : (
                    <>
                      Submit to Supreme Court
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Adjudication Terminal */}
          <div className="lg:col-span-7">
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[600px] lg:h-[750px] relative">
              
              {/* Terminal Header */}
              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Statelock Multi-Agent Protocol 4.1</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div 
                ref={scrollRef}
                className="flex-1 p-8 space-y-10 overflow-y-auto scrollbar-hide bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.98]"
              >
                <AnimatePresence mode="popLayout">
                  {currentTurnIdx === -1 && !isRunning && !result && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20"
                    >
                      <Lock className="w-20 h-20 mb-6 text-zinc-600" strokeWidth={1} />
                      <p className="text-xl font-medium font-mono uppercase tracking-[0.2em]">Gateway Standing By</p>
                      <p className="text-sm text-zinc-500 mt-4 max-w-xs mx-auto">Input an action to trigger the deterministic multi-agent governance pipeline.</p>
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
                        const turnData = result ? result.debate[idx] : { agent: agentMeta.agent, content: "Analyzing logic..." };
                        
                        if (!isVisible) return null;

                        return (
                          <motion.div 
                            key={agentMeta.agent}
                            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.5 }}
                            className={`flex gap-6 ${isThinking ? "opacity-100" : "opacity-40 hover:opacity-100 transition-opacity"}`}
                          >
                            <div className={`mt-1 h-12 w-12 shrink-0 rounded-2xl border flex items-center justify-center bg-black/40 ${
                              isThinking ? `border-${agentMeta.color}-500 shadow-[0_0_30px_rgba(0,255,100,0.1)]` : "border-white/5"
                            }`}>
                              {agentMeta.icon}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isThinking ? `text-${agentMeta.color}-400` : "text-zinc-600"}`}>
                                  {agentMeta.agent}
                                </span>
                                {isThinking && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-emerald-500 animate-pulse">SYSTEM_THINKING...</span>
                                    <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
                                  </div>
                                )}
                              </div>
                              <div className={`text-lg leading-relaxed font-medium ${isThinking ? "text-white" : "text-zinc-400"}`}>
                                {isThinking ? (
                                  <div className="flex gap-2 py-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                                  </div>
                                ) : (
                                  <Typewriter text={turnData.content} />
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
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="absolute inset-x-0 bottom-0 p-8 z-20"
                  >
                    <div className={`rounded-3xl p-8 border shadow-[0_-20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${
                      result.decision === "PERMITTED" 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                        : result.decision === "DENIED"
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl ${
                             result.decision === "PERMITTED" ? "bg-emerald-500/20" : result.decision === "DENIED" ? "bg-red-500/20" : "bg-blue-500/20"
                          }`}>
                            {result.decision === "PERMITTED" ? <CheckCircle2 className="w-10 h-10" /> : result.decision === "DENIED" ? <XCircle className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mb-1">Final Decision Issued</div>
                            <h3 className="text-4xl font-black tracking-tight">{result.decision}</h3>
                          </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Confidence</div>
                            <div className="text-3xl font-mono font-bold">{(result.confidence * 100).toFixed(0)}%</div>
                          </div>
                          <div className="w-12 h-12 relative">
                             <svg className="w-full h-full" viewBox="0 0 36 36">
                               <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="2" />
                               <motion.circle 
                                 cx="18" cy="18" r="16" fill="none" 
                                 className={result.decision === "PERMITTED" ? "stroke-emerald-500" : "stroke-red-500"} 
                                 strokeWidth="2"
                                 strokeDasharray={`${result.confidence * 100}, 100`}
                                 initial={{ strokeDasharray: "0, 100" }}
                                 animate={{ strokeDasharray: `${result.confidence * 100}, 100` }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                               />
                             </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
                          <MessageSquare className="w-3 h-3" />
                          Final Adjudication Reasoning
                        </div>
                        <p className="text-lg text-white font-medium leading-relaxed">{result.reasoning}</p>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 flex flex-wrap gap-2">
                          {result.rules_applied.map(rule => (
                            <div key={rule} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-white/60">
                              <FileText className="w-3 h-3" />
                              {rule}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleCopy}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                            title="Copy Adjudication"
                          >
                            {copying ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                          <button 
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
                            onClick={() => alert("Audit Report PDF Generated! (Simulation)")}
                          >
                            <Download className="w-4 h-4" />
                            Report
                          </button>
                          <button 
                            onClick={reset}
                            className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                            title="New Adjudication"
                          >
                            <RotateCcw className="w-5 h-5" />
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
      <footer className="border-t border-white/5 py-12 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 grayscale">
          <span className="text-sm font-mono uppercase tracking-widest">Secured by StateLock Deterministic Engine v4.0.1</span>
          <div className="flex items-center gap-12">
             <div className="font-bold text-xl tracking-tighter">FINRA COMPLIANT</div>
             <div className="font-bold text-xl tracking-tighter">SOC2 TYPE II</div>
             <div className="font-bold text-xl tracking-tighter">GDPR NATIVE</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
