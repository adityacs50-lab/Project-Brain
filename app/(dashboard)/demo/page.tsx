"use client";

import { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { runSupremeCourtDemo } from "@/lib/api";
import { useWorkspace } from "@/components/WorkspaceContext";

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

export default function DemoPage() {
  const { workspaceId } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"court" | "slack" | "rules">("court");
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(-1);
  const [result, setResult] = useState<SupremeCourtResult | null>(null);

  const generateMockDecision = (q: string): SupremeCourtResult => {
    const lower = q.toLowerCase();

    // Refund scenarios
    if (lower.includes("refund") || lower.includes("$350") || lower.includes("$300") || lower.includes("$200")) {
      const amount = lower.match(/\$(\d+)/)?.[1] || "350";
      return {
        debate: [
          { agent: "Policy Agent", content: `Cross-referencing request against Refund Cap Enforcement rule. A $${amount} refund exceeds the $50 threshold requiring manager approval. This action triggers escalation protocol.` },
          { agent: "Risk Assessor", content: `Financial risk assessment: $${amount} outbound payment without dual authorization. If approved without oversight, this sets a precedent that bypasses fiduciary controls. Risk level: HIGH.` },
          { agent: "Devil's Advocate", content: `Counter-argument: The customer may have a valid claim, and blocking the refund could result in chargeback fees ($25 per incident) and negative reviews. However, the policy exists to prevent fraud — the rule must hold.` },
          { agent: "Final Judge", content: `RULING: The Refund Cap Enforcement policy is deterministic. Any refund above $50 requires manager approval. This $${amount} request is DENIED at the agent level and ESCALATED to the VP of Customer Success for manual review.` }
        ],
        decision: "ESCALATE",
        reasoning: `The $${amount} refund exceeds the $50 automatic approval threshold defined in "Refund Cap Enforcement." The request has been escalated to manager-level review per company policy. No agent may override this rule.`,
        rules_applied: ["Refund Cap Enforcement", "Outbound Payment Dual-Auth"],
        confidence: 1.0
      };
    }

    // Travel / expense scenarios
    if (lower.includes("travel") || lower.includes("$500") || lower.includes("expense") || lower.includes("flight")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Matching against Travel Expense policy and Outbound Payment Dual-Auth rule. A $500 travel request exceeds the $5,000 dual-authorization threshold? No — but it does require departmental budget approval per standard operating procedures." },
          { agent: "Risk Assessor", content: "Operational risk is LOW for a $500 travel expense. However, we must verify the requestor has remaining departmental budget allocation. No compliance flags detected." },
          { agent: "Devil's Advocate", content: "This is a routine expense. Blocking it would slow down business operations unnecessarily. The amount is well below any financial risk threshold. Recommend: PERMIT with standard logging." },
          { agent: "Final Judge", content: "RULING: The $500 travel request falls within standard operational parameters. No active policy explicitly blocks this amount. Action is PERMITTED with full audit trail logging." }
        ],
        decision: "PERMITTED",
        reasoning: "The $500 travel request does not violate any active governance rules. The amount is below the Outbound Payment Dual-Auth threshold ($5,000) and no travel-specific restriction policy is active. Permitted with standard audit logging.",
        rules_applied: ["Outbound Payment Dual-Auth", "Standard Reporting"],
        confidence: 0.95
      };
    }

    // Database / deletion scenarios
    if (lower.includes("delete") || lower.includes("database") || lower.includes("drop") || lower.includes("production")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "CRITICAL MATCH: Database Ops Governance rule states 'No production database changes during business hours without change ticket.' This is a destructive operation requiring the highest level of scrutiny." },
          { agent: "Risk Assessor", content: "RISK LEVEL: CRITICAL. Uncontrolled database deletions can cause irreversible data loss, regulatory violations (GDPR Article 17 compliance), and potential customer-facing outages. This action must be blocked." },
          { agent: "Devil's Advocate", content: "Even in emergency scenarios, the change ticket requirement exists to maintain an audit trail. There is no legitimate reason to bypass this control. The rule is absolute." },
          { agent: "Final Judge", content: "RULING: DENIED. The Database Ops Governance policy is a zero-tolerance rule. No production database changes — especially deletions — may proceed without a formal change ticket and security team review. This decision is final and non-negotiable." }
        ],
        decision: "DENIED",
        reasoning: "Production database deletion is explicitly prohibited without a formal change ticket and security team review, per the Database Ops Governance policy. This is a zero-tolerance enforcement rule. Action is DENIED.",
        rules_applied: ["Database Ops Governance", "Infrastructure Security (IAM)"],
        confidence: 1.0
      };
    }

    // PII / data export scenarios
    if (lower.includes("pii") || lower.includes("data") || lower.includes("crm") || lower.includes("export") || lower.includes("customer")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "PII Data Sovereignty rule matched: 'Customer PII cannot be shared outside CRM without a signed DPA.' This request involves transferring customer data to an external system." },
          { agent: "Risk Assessor", content: "Legal risk: HIGH. Exporting PII without a Data Processing Agreement violates GDPR, CCPA, and internal data governance standards. Potential fine: up to 4% of annual revenue." },
          { agent: "Devil's Advocate", content: "If a DPA is already on file with the external CRM vendor, this action could be permissible. However, verifying DPA status requires human review — the agent cannot make this determination autonomously." },
          { agent: "Final Judge", content: "RULING: ESCALATED to the Data Protection Officer. Customer PII transfer requires verified DPA documentation. The agent is not authorized to make this determination independently." }
        ],
        decision: "ESCALATE",
        reasoning: "Customer PII transfer to external systems requires a signed Data Processing Agreement (DPA) per the PII Data Sovereignty policy. DPA verification requires human review. Escalated to the Data Protection Officer.",
        rules_applied: ["PII Data Sovereignty", "HR Data Protection"],
        confidence: 0.98
      };
    }

    // Vendor / contract scenarios
    if (lower.includes("vendor") || lower.includes("contract") || lower.includes("$15,000") || lower.includes("$10,000") || lower.includes("procurement")) {
      return {
        debate: [
          { agent: "Policy Agent", content: "Vendor Procurement Threshold rule triggered: 'No vendor contract above $10,000 without legal sign-off.' This $15,000 contract exceeds the threshold by $5,000." },
          { agent: "Risk Assessor", content: "Financial and legal risk: MODERATE-HIGH. Unapproved vendor contracts expose the company to unfavorable terms, IP risk, and potential compliance violations. Legal review is mandatory." },
          { agent: "Devil's Advocate", content: "Speed matters in vendor negotiations. However, the $10,000 threshold exists because contracts above this amount typically contain indemnification clauses that require legal expertise to evaluate." },
          { agent: "Final Judge", content: "RULING: DENIED at agent level. The $15,000 vendor contract exceeds the $10,000 procurement threshold. Legal sign-off is required before this contract can be approved. Escalating to Legal team." }
        ],
        decision: "DENIED",
        reasoning: "The $15,000 vendor contract exceeds the Vendor Procurement Threshold of $10,000. Legal sign-off is mandatory per company policy. The agent is not authorized to approve contracts above this amount.",
        rules_applied: ["Vendor Procurement Threshold", "Outbound Payment Dual-Auth"],
        confidence: 1.0
      };
    }

    // Default / unknown scenarios
    return {
      debate: [
        { agent: "Policy Agent", content: `Scanning active rule database for matches against: "${q}". No exact policy match found. Checking semantic similarity across 11 active governance rules.` },
        { agent: "Risk Assessor", content: "Without a specific matching rule, the default risk posture is CAUTIOUS. Unrecognized actions should be escalated to prevent potential policy violations." },
        { agent: "Devil's Advocate", content: "The absence of a rule doesn't mean the action is prohibited — it means governance hasn't been defined yet. This is a gap in the rule library, not a violation." },
        { agent: "Final Judge", content: "RULING: ESCALATED. No deterministic rule covers this action. Per the Safety-First Protocol, unmatched actions are escalated to a human administrator for review and potential rule creation." }
      ],
      decision: "ESCALATE",
      reasoning: "No active governance rule matches this specific action. Per StateLock's Safety-First Protocol, actions without explicit rule coverage are escalated to human administrators. This ensures zero false-negatives in governance enforcement.",
      rules_applied: ["Safety-First Protocol (Default)"],
      confidence: 0.7
    };
  };

  const startAdjudication = async () => {
    if (!query.trim()) return;
    
    setIsRunning(true);
    setResult(null);
    setCurrentTurnIdx(-1);
    
    // Generate decision (client-side mock, or try live API)
    let data: SupremeCourtResult;
    try {
      data = await runSupremeCourtDemo(query, workspaceId || "demo-workspace");
    } catch {
      // Fallback to client-side mock if backend is unavailable
      data = generateMockDecision(query);
    }
    
    // Animate the debate sequence
    for (let i = 0; i < data.debate.length; i++) {
      setCurrentTurnIdx(i);
      await new Promise(resolve => setTimeout(resolve, 1400));
    }
    
    setResult(data);
    setIsRunning(false);
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case "Policy Agent": return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case "Risk Assessor": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "Devil's Advocate": return <Scale className="w-5 h-5 text-purple-500" />;
      case "Final Judge": return <Gavel className="w-5 h-5 text-blue-500" />;
      default: return <HelpCircle className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white -m-8 p-8 overflow-x-hidden">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <span className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg border border-emerald-500/20">
            <Zap className="w-6 h-6" />
          </span>
          Live Demo Environment
        </h1>
        <p className="text-zinc-400 max-w-2xl">
          Experience StateLock&apos;s deterministic governance in action. 
          Connect your workspace or test our Supreme Court with simulated scenarios.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5 mb-8 w-fit">
        <button 
          onClick={() => setActiveTab("court")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "court" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
        >
          Supreme Court Playground
        </button>
        <button 
          onClick={() => setActiveTab("slack")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "slack" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
        >
          Connect Slack
        </button>
        <button 
          onClick={() => setActiveTab("rules")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "rules" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
        >
          Extracted Rules
        </button>
      </div>

      {activeTab === "court" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left: Input & Config */}
          <div className="space-y-6">
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                Proposed Agent Action
              </h2>
              <textarea 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Example: Issue a $350 refund to customer #1234 or Approve a new vendor contract for $15,000"
                className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl p-4 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all h-32 resize-none outline-none"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-zinc-500 w-full mb-1">Try a preset:</span>
                {["$500 Travel Request", "Refund for 2yr Customer", "Delete Database Entry"].map((preset) => (
                  <button 
                    key={preset}
                    onClick={() => setQuery(`Handle request: ${preset}`)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-zinc-400 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <button 
                onClick={startAdjudication}
                disabled={isRunning || !query.trim()}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-50 px-6 py-4 rounded-xl font-bold text-white hover:text-emerald-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adjudicating...
                  </>
                ) : (
                  <>
                    Submit to Supreme Court
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Decision Status */}
            {result && (
              <div className={`rounded-2xl p-6 border animate-in zoom-in duration-300 ${
                result.decision === "PERMITTED" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : result.decision === "DENIED"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {result.decision === "PERMITTED" ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{result.decision}</h3>
                      <p className="text-xs opacity-70">Deterministic Ruling Issued</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold">{(result.confidence * 100).toFixed(0)}%</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60">Confidence</div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-4 text-sm leading-relaxed border border-white/5">
                  <p className="font-medium mb-2">Final Reasoning:</p>
                  <p className="opacity-80">{result.reasoning}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.rules_applied.map(rule => (
                    <span key={rule} className="px-2.5 py-1 bg-white/5 rounded-md text-[10px] font-mono border border-white/5">
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: The Debate View */}
          <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-fit lg:min-h-[600px]">
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Multi-Agent Protocol v1.4.2</span>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {currentTurnIdx === -1 && !isRunning && !result && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                  <Scale className="w-16 h-16 mb-4 text-zinc-600" />
                  <p className="text-sm font-medium">Supreme Court is standing by.</p>
                  <p className="text-xs text-zinc-500 mt-2">Submit an action to begin multi-agent adjudication.</p>
                </div>
              )}

              {/* Debate Sequence */}
              {isRunning || result ? (
                <div className="space-y-6">
                  {(result ? result.debate : [
                    {agent: "Policy Agent", content: "Evaluating..."},
                    {agent: "Risk Assessor", content: "Evaluating..."},
                    {agent: "Devil's Advocate", content: "Evaluating..."},
                    {agent: "Final Judge", content: "Evaluating..."}
                  ]).map((turn, idx) => {
                    const isVisible = idx <= currentTurnIdx || result !== null;
                    const isThinking = isRunning && idx === currentTurnIdx;
                    
                    if (!isVisible) return null;

                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-4 animate-in slide-in-from-left-4 fade-in duration-500 ${isThinking ? "opacity-100" : "opacity-60 hover:opacity-100 transition-opacity"}`}
                      >
                        <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${
                          isThinking ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-white/10 bg-white/5"
                        }`}>
                          {getAgentIcon(turn.agent)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold tracking-tight uppercase ${isThinking ? "text-emerald-400" : "text-zinc-400"}`}>
                              {turn.agent}
                            </span>
                            {isThinking && <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />}
                          </div>
                          <div className={`text-sm rounded-xl p-3 border ${
                            isThinking ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-50" : "bg-white/[0.02] border-white/5 text-zinc-300"
                          }`}>
                            {isThinking ? (
                              <div className="flex gap-1">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                              </div>
                            ) : (
                              turn.content
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {activeTab === "slack" && (
        <div className="max-w-xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[#E01E5A]/10 text-[#E01E5A] rounded-3xl border border-[#E01E5A]/20 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52h6.313a2.527 2.527 0 0 1 2.521 2.52v2.523a2.528 2.528 0 0 1-2.52 2.523H8.834a2.528 2.528 0 0 1-2.521-2.523v-2.523zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.527 2.527 0 0 1 2.521 2.521v6.313a2.528 2.528 0 0 1-2.521 2.521H6.313a2.528 2.528 0 0 1-2.521-2.521V8.834a2.528 2.528 0 0 1 2.521-2.521h2.521zM18.958 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.522 2.521h-2.52v-2.521zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521H8.852a2.527 2.527 0 0 1-2.521-2.521V6.313a2.528 2.528 0 0 1 2.521-2.521h6.313a2.528 2.528 0 0 1 2.523 2.521v2.521zM15.165 18.958a2.528 2.528 0 0 1 2.521 2.522A2.527 2.527 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.52h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52 2.523v-6.313a2.527 2.527 0 0 1 2.52-2.521h2.523a2.527 2.527 0 0 1 2.522 2.521v6.313a2.528 2.528 0 0 1-2.522 2.523h-2.523z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Integrate Your Intelligence</h2>
          <p className="text-zinc-400 mb-8">
            Connect Slack to allow StateLock to begin ingestive rule extraction. 
            No technical configuration required.
          </p>
          <button className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 mx-auto shadow-xl">
            Connect Slack Workspace
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-6 text-xs text-zinc-500">
            Secure OAuth2 flow. We never store your credentials.
          </p>
        </div>
      )}

      {activeTab === "rules" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Workflow className="w-4 h-4 text-emerald-500" />
                Live Rule Extraction Feed
              </h2>
              <button className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
                Simulate New Messages
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500">
                    <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Slack Source</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Extracted Rule</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Action</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Confidence</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { msg: "Refunds over $200 need VP approval", rule: "Refund Approval Policy", action: "Escalate", conf: 0.98, status: "Active" },
                    { msg: "Always check GDPR before exporting data", rule: "Data Export Guard", action: "Denied", conf: 0.92, status: "Review" },
                    { msg: "New travel policy: >$500 is no-go", rule: "Travel Expense Threshold", action: "Escalate", conf: 0.95, status: "Active" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-300 font-medium truncate max-w-[200px] italic">&ldquo;{row.msg}&rdquo;</span>
                          <span className="text-[10px] text-zinc-600 mt-1">#finance-policy • 2m ago</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{row.rule}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          row.action === 'Escalate' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {row.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-500">{(row.conf * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${
                          row.status === 'Active' ? 'text-emerald-500' : 'text-blue-400'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-blue-400 animate-pulse'}`} />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-12 text-center border-t border-white/5">
              <p className="text-zinc-500 text-sm">More rules are currently in the extraction queue...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Zap({ className }: { className?: string }) {
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function Workflow({ className }: { className?: string }) {
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
      <path d="M3 12h12" />
      <path d="M3 6h18" />
      <path d="M3 18h6" />
      <path d="M15 18l6-6-6-6" />
    </svg>
  );
}
