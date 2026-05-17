"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  Gavel, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Copy,
  RotateCcw,
  Lock,
  MessageSquare,
  FileText,
  Sparkles,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";

// --- Typewriter Component ---
const Typewriter = ({ text, onComplete, speed = 15 }: { text: string, onComplete?: () => void, speed?: number }) => {
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

interface AdjudicationResult {
  debate: DebateTurn[];
  decision: "PERMITTED" | "DENIED" | "ESCALATE";
  reasoning: string;
  rules_applied: string[];
  confidence: number;
}

export default function PolicySimulatorSandbox() {
  const [rule, setRule] = useState("");
  const [action, setAction] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(-1);
  const [result, setResult] = useState<AdjudicationResult | null>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [copying, setCopying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentTurnIdx]);

  const startAdjudication = async () => {
    if (!rule.trim() || !action.trim()) {
      setErrorMsg("Please enter both a policy rule and an agent action to simulate.");
      return;
    }
    
    setErrorMsg("");
    setIsRunning(true);
    setResult(null);
    setCurrentTurnIdx(-1);
    setShowResultCard(false);

    try {
      const response = await fetch("/api/sandbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rule, action }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact the sandbox engine.");
      }

      const data: AdjudicationResult = await response.json();

      // Animate the debate turns one by one
      for (let i = 0; i < data.debate.length; i++) {
        setCurrentTurnIdx(i);
        // Sync typewriter delays with high-fidelity pacing
        await new Promise(resolve => setTimeout(resolve, 600));
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setResult(data);
      setIsRunning(false);

      if (data.decision === "PERMITTED") {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#10b981', '#34d399', '#059669', '#6ee7b7']
        });
      }

      setTimeout(() => setShowResultCard(true), 500);

    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during simulation.";
      setErrorMsg(msg);
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    setCopying(true);
    const text = `StateLock Sandbox Adjudication Report\n\nRule: ${rule}\nSimulated Action: ${action}\n\nVerdict: ${result.decision}\nReasoning: ${result.reasoning}\nConfidence: ${(result.confidence * 100).toFixed(0)}%`;
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopying(false), 2000);
  };

  const reset = () => {
    setRule("");
    setAction("");
    setResult(null);
    setCurrentTurnIdx(-1);
    setShowResultCard(false);
    setIsRunning(false);
    setErrorMsg("");
  };

  const loadPreset = (presetRule: string, presetAction: string) => {
    setRule(presetRule);
    setAction(presetAction);
    setResult(null);
    setCurrentTurnIdx(-1);
    setShowResultCard(false);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-emerald-500/30 font-sans">
      {/* Standalone Nav */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="font-bold text-xl tracking-tight">StateLock <span className="text-emerald-500 font-mono text-xs ml-2 opacity-50 uppercase tracking-widest">Sandbox</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/demo" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Interactive Demo</Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Sandbox Online</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        {/* Header Section */}
        <div className="max-w-3xl mb-12 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Active Policy Sandbox
          </motion.div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9] text-white">
            Policy Simulator <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Sandbox.</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg">
            Type custom English policy guidelines and simulate raw AI agent payloads. Observe how our deterministic Adjudication Engine evaluates, intercepts, and seals agent actions live.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Input Console */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative bg-[#121214] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Configure Sandbox Environment
                  </h2>
                  <span className="text-[10px] font-mono text-zinc-600">SANDBOX_V1</span>
                </div>

                {/* Horizontal Quick Presets Bar */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Quick-Simulation Presets:</span>
                    <span className="text-[9px] font-mono text-zinc-600 uppercase">Click to Autofill</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                    {[
                      {
                        label: "💰 $150 Refund",
                        rule: "No refunds over $100 can be processed without direct manager approval.",
                        action: "Process a $150 refund for customer @jane_doe due to package delay"
                      },
                      {
                        label: "🔒 Export PII",
                        rule: "All customer email exports and PII downloads must be strictly blocked at the gateway.",
                        action: "Download email list and home addresses of active users to a local csv file"
                      },
                      {
                        label: "💥 Delete DB Table",
                        rule: "Destructive actions like database drops or table deletions are strictly prohibited during operation hours.",
                        action: "Drop table 'production_users' to reset test database"
                      },
                      {
                        label: "💸 Transfer $5000",
                        rule: "All wire transfers and money routing actions exceeding $1,000 must be escalated to the compliance supervisor.",
                        action: "Transfer $5,000 to routing account #90210"
                      }
                    ].map((sim) => {
                      const isActive = rule === sim.rule && action === sim.action;
                      return (
                        <button
                          key={sim.label}
                          type="button"
                          onClick={() => loadPreset(sim.rule, sim.action)}
                          className={`shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isActive
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                              : "bg-white/[0.02] hover:bg-white/[0.06] border-white/5 hover:border-emerald-500/20 text-zinc-400 hover:text-white"
                          }`}
                          disabled={isRunning}
                        >
                          {sim.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Input 1: Policy Rule */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    1. Enter Your Policy Rule
                  </label>
                  <textarea
                    value={rule}
                    onChange={(e) => setRule(e.target.value)}
                    placeholder="e.g. 'No refunds exceeding $100 can be issued without manager authorization.'"
                    className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl p-4 text-sm text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all h-28 resize-none outline-none placeholder:text-zinc-700 font-medium"
                    disabled={isRunning}
                  />
                </div>

                {/* Input 2: Simulated Agent Action */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    2. Simulate Agent Action
                  </label>
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="e.g. 'Issue a $150 refund to transaction #9021'"
                    className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-4 text-sm text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none placeholder:text-zinc-700 font-medium"
                    disabled={isRunning}
                  />
                </div>

                <button 
                  onClick={startAdjudication}
                  disabled={isRunning || !rule.trim() || !action.trim()}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 px-6 py-5 rounded-xl font-black text-white text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      ADJUDICATING SIMULATED PAYLOAD...
                    </>
                  ) : (
                    <>
                      RUN SIMULATED ADJUDICATION
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Adjudication Terminal */}
          <div className="lg:col-span-7">
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[580px] lg:h-[700px] relative">
              
              {/* Scanline Sweep Animation */}
              {isRunning && (
                <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-transparent via-emerald-500/[0.05] to-transparent animate-scanline" />
              )}

              {/* Inline CSS for Scanline Animation */}
              <style>{`
                @keyframes scanline {
                  0% { transform: translateY(-100%); }
                  100% { transform: translateY(100%); }
                }
                .animate-scanline {
                  animation: scanline 3s linear infinite;
                }
              `}</style>

              {/* Terminal Header */}
              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.25em]">STATELOCK_POLICY_SIMULATOR_CORE</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div 
                ref={scrollRef}
                className="flex-1 p-8 space-y-10 overflow-y-auto scrollbar-hide bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.98] relative"
              >
                <AnimatePresence mode="popLayout">
                  {currentTurnIdx === -1 && !isRunning && !result && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col justify-between space-y-8 py-2"
                    >
                      {/* Top Welcome & Mode Badge */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400">ENGINE_LEDGER_ONLINE</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-white/5 rounded text-[9px] font-mono font-semibold uppercase">Mode: FAIL_CLOSED</span>
                          <span className="px-2 py-0.5 bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-mono font-semibold uppercase">Active: GATEWAY_V1</span>
                        </div>
                      </div>

                      {/* Step-by-Step Interactive Guide */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block">HOW TO SIMULATE:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition-all space-y-1.5 group/card">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono">01</span>
                              <span className="text-xs font-bold text-zinc-200 group-hover/card:text-white transition-colors">Formulate Guidelines</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">Write any enterprise rules or compliance caps into the Custom Policy field using simple natural language.</p>
                          </div>

                          <div className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition-all space-y-1.5 group/card">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono">02</span>
                              <span className="text-xs font-bold text-zinc-200 group-hover/card:text-white transition-colors">Draft Agent Action</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">Enter a simulated operation, payload, or API execution command you want the autonomous agent to perform.</p>
                          </div>

                          <div className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition-all space-y-1.5 group/card">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono">03</span>
                              <span className="text-xs font-bold text-zinc-200 group-hover/card:text-white transition-colors">Consensus Analysis</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">Watch three specialized agents cross-examine, analyze, and debate the safety boundaries of the action.</p>
                          </div>

                          <div className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl transition-all space-y-1.5 group/card">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono">04</span>
                              <span className="text-xs font-bold text-zinc-200 group-hover/card:text-white transition-colors">Immutable Verdict</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">Get a deterministic Permitted, Denied, or Escalate verdict with fully generated structured logs and confidence values.</p>
                          </div>
                        </div>
                      </div>

                      {/* Live Threat Assessment Matrix */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3 font-mono">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">LIVE_THREAT_ASSESSMENT_MATRIX</span>
                          <span className="text-[9px] text-emerald-500 font-bold tracking-wider">LATENCY: ~85ms</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-[10px] text-zinc-400 font-medium">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span>Policy Evaluator:</span>
                            </div>
                            <span className="text-emerald-500 font-bold">VERIFIED</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span>Risk Integrity Index:</span>
                            </div>
                            <span className="text-white font-bold">1.000</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span>Exception Interceptor:</span>
                            </div>
                            <span className="text-emerald-500 font-bold">ACTIVE</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span>Consensus Threshold:</span>
                            </div>
                            <span className="text-white font-bold">0.90 STRICT</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Animated turns */}
                  {(isRunning || result) && (
                    <div className="space-y-10">
                      {[
                        { agent: "Policy Evaluator", icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, color: "emerald" },
                        { agent: "Compliance Assessor", icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, color: "amber" },
                        { agent: "Exception Handler", icon: <Scale className="w-5 h-5 text-purple-500" />, color: "purple" },
                        { agent: "Adjudication Verdict", icon: <Gavel className="w-5 h-5 text-blue-500" />, color: "blue" }
                      ].map((agentMeta, idx) => {
                        const isVisible = idx <= currentTurnIdx || result !== null;
                        const isThinking = isRunning && idx === currentTurnIdx;
                        const turnData = result ? result.debate[idx] : { agent: agentMeta.agent, content: "Analyzing simulated boundary patterns..." };
                        
                        if (!isVisible) return null;

                        return (
                          <motion.div 
                            key={agentMeta.agent}
                            initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.4 }}
                            className={`flex gap-6 ${isThinking ? "opacity-100" : "opacity-45 hover:opacity-100 transition-opacity"}`}
                          >
                            <div className={`mt-0.5 h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center bg-black/60 transition-all ${
                              isThinking 
                                ? agentMeta.color === "emerald" ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                  : agentMeta.color === "amber" ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                  : agentMeta.color === "purple" ? "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                  : "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                : "border-white/5"
                            }`}>
                               {agentMeta.icon}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-black tracking-[0.25em] uppercase transition-colors ${
                                  isThinking 
                                    ? agentMeta.color === "emerald" ? "text-emerald-400"
                                      : agentMeta.color === "amber" ? "text-amber-400"
                                      : agentMeta.color === "purple" ? "text-purple-400"
                                      : "text-blue-400"
                                    : "text-zinc-500"
                                }`}>
                                  {agentMeta.agent}
                                </span>
                                {isThinking && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-mono text-emerald-500 animate-pulse uppercase tracking-wider">Evaluating_Simulator...</span>
                                    <Loader2 className="w-2.5 h-2.5 text-emerald-500 animate-spin" />
                                  </div>
                                )}
                              </div>
                              <div className={`text-base leading-relaxed font-semibold tracking-tight ${isThinking ? "text-white" : "text-zinc-200"}`}>
                                {isThinking ? (
                                  <div className="flex gap-2 py-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                                  </div>
                                ) : (
                                  <Typewriter text={turnData.content} speed={12} />
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
                    initial={{ opacity: 0, y: 150 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 150 }}
                    className="absolute inset-x-0 bottom-0 p-6 z-20"
                  >
                    <div className={`rounded-3xl p-8 border shadow-[0_-15px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl relative overflow-hidden ${
                      result.decision === "PERMITTED" 
                        ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400 shadow-emerald-500/5" 
                        : result.decision === "DENIED"
                        ? "bg-red-950/20 border-red-500/40 text-red-500 shadow-red-500/15"
                        : "bg-blue-950/20 border-blue-500/30 text-blue-400 shadow-blue-500/5"
                    }`}>
                      {result.decision === "DENIED" && (
                        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                      )}
                      {result.decision === "PERMITTED" && (
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 relative z-10">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl ${
                             result.decision === "PERMITTED" ? "bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : result.decision === "DENIED" ? "bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.25)]" : "bg-blue-500/20"
                          }`}>
                            {result.decision === "PERMITTED" ? <CheckCircle2 className="w-8 h-8" /> : result.decision === "DENIED" ? <XCircle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-[0.3em] font-black opacity-50 mb-1">Sandbox_Verdict</div>
                            <h3 className="text-4xl font-black tracking-tighter leading-none">
                              {result.decision}
                            </h3>
                          </div>
                        </div>
                        <div className="bg-black/60 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5 font-bold">Confidence</div>
                            <div className="text-2xl font-mono font-black tracking-tighter">{(result.confidence * 100).toFixed(0)}%</div>
                          </div>
                          <div className="w-10 h-10 relative">
                             <svg className="w-full h-full" viewBox="0 0 36 36">
                               <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3.5" />
                               <motion.circle 
                                 cx="18" cy="18" r="16" fill="none" 
                                 className={result.decision === "PERMITTED" ? "stroke-emerald-500" : result.decision === "DENIED" ? "stroke-red-600" : "stroke-blue-500"} 
                                 strokeWidth="3.5"
                                 strokeDasharray={`${result.confidence * 100}, 100`}
                                 initial={{ strokeDasharray: "0, 100" }}
                                 animate={{ strokeDasharray: `${result.confidence * 100}, 100` }}
                                 transition={{ duration: 1.2, ease: "easeOut" }}
                                 strokeLinecap="round"
                               />
                             </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/60 rounded-2xl p-6 mb-6 border border-white/5 relative z-10">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-3">
                          <MessageSquare className="w-3.5 h-3.5" />
                          ADJUDICATOR_EXECUTIVE_SUMMARY
                        </div>
                        <p className="text-base text-white font-bold leading-relaxed tracking-tight">{result.reasoning}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex-1 flex flex-wrap gap-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-[10px] font-mono font-bold text-white/60">
                            <FileText className="w-3.5 h-3.5 text-emerald-500/70" />
                            Simulated Policy Applied
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleCopy}
                            className="p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all"
                            title="Copy Simulated Verdict"
                          >
                            {copying ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={reset}
                            className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 text-xs font-bold"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reset Sandbox
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 grayscale contrast-125">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-black">STATELOCK_CORE_SECURE</span>
          </div>
          <div className="flex items-center gap-8">
             <div className="font-black text-lg tracking-tighter">FINRA COMPLIANT</div>
             <div className="font-black text-lg tracking-tighter">SOC2 TYPE II</div>
             <div className="font-black text-lg tracking-tighter">GDPR COMPLIANT</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
