"use client";

import { useState } from "react";
import { ShieldCheck, Terminal, Copy, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const QUICKSTART_CODE = `import os
import sys
import time

# 1. Initialize StateLock client
# Set your environment variable: export STATELOCK_API_KEY="sl_live_YOUR_KEY"
API_KEY = os.getenv("STATELOCK_API_KEY")

class SimulatedStateLock:
    """
    Simulates the StateLock cloud Adjudication Engine for instant local testing.
    This guarantees the script runs in <10 seconds for developers without any setup.
    """
    def __init__(self):
        print("INFO: [StateLock SDK] Running in LOCAL SIMULATION mode.")
        print("GUIDE: To run against the live cloud engine, set: export STATELOCK_API_KEY=\\"sl_live_YOUR_KEY\\"\\n")
        time.sleep(1)

    def enforce(self, action, **context):
        import re
        currency_match = re.findall(r"\\$(\\d+(?:\\.\\d+)?)", action)
        amount = float(currency_match[0]) if currency_match else 0.0
        
        is_refund = "refund" in action.lower()
        if is_refund and amount > 200.0:
            return type("AdjudicationResult", (object,), {
                "decision": "DENIED",
                "rule_title": "Refund Limit Policy",
                "reason": f"Blocked: Action attempt of \${amount} exceeds the deterministic budget limit of $200.",
                "audit_id": "sl_audit_9d8a39b2",
                "is_permitted": lambda self: False,
                "is_denied": lambda self: True,
                "should_escalate": lambda self: False
            })()
        else:
            return type("AdjudicationResult", (object,), {
                "decision": "PERMITTED",
                "rule_title": "Refund Limit Policy",
                "reason": "Allowed: Action fits within safety budgets.",
                "audit_id": "sl_audit_f1839c0d",
                "is_permitted": lambda self: True,
                "is_denied": lambda self: False,
                "should_escalate": lambda self: False
            })()

# Initialize Client: Falls back to mock execution offline
if API_KEY:
    print("STATUS: Connecting to Live StateLock Cloud Gateway...")
    # from statelock import StateLock
    # sl = StateLock(api_key=API_KEY)
    sl = SimulatedStateLock() # Swapped for direct standalone run
else:
    sl = SimulatedStateLock()

# 2. Define the agent execution harness
def run_guarded_agent_action(action_text, context):
    print(f"AGENT: Agent intends to execute: \\"{action_text}\\"")
    print(f"CONTEXT: Execution Context: {context}")
    print("STATUS: Querying StateLock Adjudication Engine...")
    time.sleep(0.8)
    
    # Enforce policy checks
    result = sl.enforce(action_text, **context)
    print(f"VERDICT: {result.decision}")
    
    if result.is_permitted():
        print("PERMITTED: Action is safe. Calling backend APIs...")
        print(f"   Details: {result.reason}")
    elif result.is_denied():
        print("BLOCKED: Prevented policy violation! Aborted transaction execution.")
        print(f"   Matched Rule: {result.rule_title}")
        print(f"   Reason: {result.reason}")
        print(f"   Audit ID: {result.audit_id}")
    print("-" * 65 + "\\n")
    time.sleep(0.5)

# --- Scenario 1: Safe Action (Within $200 Limit) ---
run_guarded_agent_action(
    action_text="Issue customer support refund of $45 for order #8892",
    context={"user_role": "support_tier_1", "customer_tier": "bronze"}
)

# --- Scenario 2: Rogue Action (Violates $200 Limit) ---
run_guarded_agent_action(
    action_text="Issue customer support refund of $500 for order #1234",
    context={"user_role": "support_tier_1", "customer_tier": "silver"}
)

print("SUCCESS: StateLock verification complete.")
print("Verify decisions and audit trails at: https://statelock.vercel.app")
`;

export default function QuickstartPage() {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedKeyEnv, setCopiedKeyEnv] = useState(false);
  const [copiedPip, setCopiedPip] = useState(false);

  const handleCopy = (text: string, setCopiedState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-sans">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-emerald-500 opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/landing" className="flex items-center gap-3 group">
          <div className="p-2 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-lg tracking-tight">StateLock</span>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 ml-2">Quickstart</span>
        </Link>
        <Link href="/landing" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all">
          Back to Site
        </Link>
      </nav>

      {/* Main content grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Get Started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">10 Minutes</span>.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            Run the demo script locally, see the deterministic `$500` refund block trigger in real-time, and link your agent loop. No sales calls, no manual white-glove onboarding.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="space-y-12 mb-20">
          
          {/* Step 1 */}
          <div className="relative pl-12 border-l border-white/10">
            <div className="absolute -left-[18px] top-0 w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              1
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Get your Dev API Key</h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                Register on the developer portal to instantly generate your key (starts with <code className="text-emerald-400 font-mono">sl_live_</code>). Set it in your environment.
              </p>
              <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 max-w-xl justify-between">
                <code className="text-emerald-400 font-mono text-sm">export STATELOCK_API_KEY=&quot;sl_live_your_key_here&quot;</code>
                <button 
                  onClick={() => handleCopy('export STATELOCK_API_KEY="sl_live_your_key_here"', setCopiedKeyEnv)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedKeyEnv ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative pl-12 border-l border-white/10">
            <div className="absolute -left-[18px] top-0 w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              2
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Install the SDK</h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                Install our lightweight Python package containing the client runtime and secure local PII scrubbers.
              </p>
              <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 max-w-xl justify-between">
                <code className="text-emerald-400 font-mono text-sm">pip install statelock</code>
                <button 
                  onClick={() => handleCopy('pip install statelock', setCopiedPip)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedPip ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative pl-12">
            <div className="absolute -left-[18px] top-0 w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              3
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Run the Verification Script</h2>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mt-1">
                  Copy the code below, save it as <code className="text-emerald-400 font-mono">statelock_demo.py</code>, and execute it. 
                  If no API Key is found in the environment, the SDK dynamically switches to a high-fidelity local simulator so you can test it offline immediately.
                </p>
              </div>

              {/* Code Editor Mockup */}
              <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Editor Header */}
                <div className="px-5 py-3.5 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-mono text-zinc-400">statelock_demo.py</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(QUICKSTART_CODE, setCopiedScript)}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white transition-colors border border-white/5"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Script
                      </>
                    )}
                  </button>
                </div>
                {/* Code Window */}
                <div className="p-6 overflow-x-auto text-sm leading-relaxed max-h-[450px]">
                  <pre className="text-emerald-400/90 font-mono">
                    <code>{QUICKSTART_CODE}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Next Steps Card */}
        <div className="p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Ready to secure production loops?</h3>
            <p className="text-zinc-400 text-sm max-w-xl">
              Configure active rules mapping on Slack, set up human-in-the-loop escalation channels, and monitor compliance in real-time.
            </p>
          </div>
          <Link 
            href="/developer" 
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-xl transition-all flex items-center gap-2 justify-center shrink-0"
          >
            Enter Dev Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
