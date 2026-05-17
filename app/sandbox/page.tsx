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
  Sliders,
  ChevronRight
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
        // Delay between agents to simulate analytical thinking
        await new Promise(resolve => setTimeout(resolve, 800));
        await new Promise(resolve => setTimeout(resolve, 1400));
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

                {/* Presets selectors */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">Load Sandbox Presets:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { 
                        name: "Refund Threshold", 
                        r: "No refunds over $100 can be processed without direct manager approval.",
                        a: "Process a $150 refund for customer @jane_doe due to package delay"
                      },
                      { 
                        name: "PII Security", 
                        r: "All customer email exports and PII downloads must be blocked.",
                        a: "Download email list and home addresses of active users to a local csv file"
                      },
                      { 
                        name: "Schema Shield", 
                        r: "Destructive actions like database drops or table deletions are strictly prohibited during operation hours.",
                        a: "Drop table 'production_users' to reset test database"
                      },
                      { 
                        name: "Slack Notify cap", 
                        r: "Sending automated messages to #announcements is allowed if under 10 messages/day.",
                        a: "Send weekly company updates to the #announcements channel"
                      }
                    ].map((preset) => (
                      <button 
                        key={preset.name}
                        onClick={() => loadPreset(preset.r, preset.a)}
                        className="px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-lg text-[10px] font-semibold text-zinc-400 transition-all text-left hover:text-white hover:border-emerald-500/30 flex items-center gap-1.5"
                        disabled={isRunning}
                      >
                        <ChevronRight className="w-3 h-3 text-emerald-500/50" />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={startAdjudication}
                  disabled={isRunning || !rule.trim() || !action.trim()}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 px-6 py-4.5 rounded-xl font-bold text-white text-sm tracking-tight transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      ADJUDICATING SIMULATED PAYLOAD...
                    </>
                  ) : (
                    <>
                      RUN SIMULATED ADJUDICATION
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Adjudication Terminal */}
          <div className="lg:col-span-7">
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[580px] lg:h-[700px] relative">
              
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
                className="flex-1 p-8 space-y-10 overflow-y-auto scrollbar-hide bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.98]"
              >
                <AnimatePresence mode="popLayout">
                  {currentTurnIdx === -1 && !isRunning && !result && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-24">
                      <Lock className="w-20 h-20 mb-6 text-zinc-600" strokeWidth={1} />
                      <p className="text-lg font-bold font-mono uppercase tracking-[0.25em]">SIMULATOR_AWAITING_INPUT</p>
                      <p className="text-xs text-zinc-500 mt-4 max-w-xs mx-auto leading-relaxed">Enter a custom policy rule and configure an agent action, then submit for multi-perspective adjudication analysis.</p>
                    </div>
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
                            <div className="mt-0.5 h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center bg-black/60 border-white/5">
                               {agentMeta.icon}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black tracking-[0.25em] uppercase text-zinc-500">
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
                                  <div className="flex gap-1.5 py-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                                  </div>
                                ) : (
                                  <Typewriter text={turnData.content} speed={10} />
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
