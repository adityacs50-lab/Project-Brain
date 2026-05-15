"use client";

import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  MessageSquare, 
  Lock
} from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-emerald-500/30">
      {/* Standalone Nav */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="font-bold text-xl tracking-tight">StateLock <span className="text-emerald-500 font-mono text-xs ml-2 opacity-50 uppercase tracking-widest">Docs</span></span>
        </Link>
        <Link href="/developer" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all">
          Back to Portal
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-8 sticky top-32 h-fit">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Getting Started</p>
            <nav className="flex flex-col gap-3">
               <a href="#introduction" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Introduction</a>
               <a href="#slack-connect" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Connecting Slack</a>
               <a href="#rule-approval" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Approving Rules</a>
               <a href="#sdk-usage" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Using the SDK</a>
            </nav>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Platform</p>
            <nav className="flex flex-col gap-3">
               <a href="#supreme-court" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">The Supreme Court</a>
               <a href="#pricing" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Pricing & Plans</a>
               <a href="#compliance" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Compliance & Security</a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-24 pb-40">
          
          {/* Intro */}
          <section id="introduction" className="space-y-6">
            <h1 className="text-6xl font-black tracking-tighter">Getting Started.</h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
              StateLock provides a deterministic governance layer for autonomous AI agents. We prevent hallucinations in high-stakes environments by enforcing approved corporate policies at the runtime gateway.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-10">
               <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-3">
                  <Zap className="w-6 h-6 text-emerald-500" />
                  <p className="text-sm font-bold">Passive Ingestion</p>
                  <p className="text-xs text-zinc-500">Rules are extracted automatically from your existing team communication.</p>
               </div>
               <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <p className="text-sm font-bold">Human Verification</p>
                  <p className="text-xs text-zinc-500">Every extracted rule requires a human &quot;Seal of Approval&quot; before activation.</p>
               </div>
               <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  <p className="text-sm font-bold">Deterministic Enforcement</p>
                  <p className="text-xs text-zinc-500">The Supreme Court enforces active rules with zero hallucination risk.</p>
               </div>
            </div>
          </section>

          {/* Slack Connect */}
          <section id="slack-connect" className="space-y-8 border-t border-white/5 pt-20">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">01</div>
               <h2 className="text-4xl font-black tracking-tight">Connecting Slack.</h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              StateLock listens to your organization&apos;s decision-making channels to extract governance patterns. 
            </p>
            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 space-y-6">
               <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500 mt-1">1</div>
                  <p className="text-zinc-300">Invite the <b>@StateLock</b> bot to your #engineering, #ops, or #finance channels.</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500 mt-1">2</div>
                  <p className="text-zinc-300">Whenever a policy decision is made (e.g. &quot;We shouldn&apos;t refund more than $50&quot;), StateLock&apos;s ingestion engine flags it as a logic candidate.</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500 mt-1">3</div>
                  <p className="text-zinc-300">The extracted logic appears in your <b>Review Queue</b> within minutes.</p>
               </div>
            </div>
          </section>

          {/* Rule Approval */}
          <section id="rule-approval" className="space-y-8 border-t border-white/5 pt-20">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">02</div>
               <h2 className="text-4xl font-black tracking-tight">Approving Rules.</h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              No rule is enforced until a human administrator gives it the **Executive Seal**.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <MessageSquare className="w-5 h-5 text-emerald-500" />
                     The Review Queue
                  </h4>
                  <p className="text-sm text-zinc-500">Navigate to <b>/review</b> to see rules waiting for validation. You can edit the extracted text to ensure it matches your precise requirements.</p>
               </div>
               <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <Lock className="w-5 h-5 text-emerald-500" />
                     Hard Rule Enforcement
                  </h4>
                  <p className="text-sm text-zinc-500">Manual &quot;Hard Rules&quot; (e.g. absolute budget caps) always override semantic suggestions. This is the core of StateLock&apos;s deterministic safety.</p>
               </div>
            </div>
          </section>

          {/* SDK Usage */}
          <section id="sdk-usage" className="space-y-8 border-t border-white/5 pt-20">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">03</div>
               <h2 className="text-4xl font-black tracking-tight">Using the SDK.</h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Implement governance in your agentic workflows with 5 lines of code.
            </p>
            <div className="bg-zinc-900 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
              <div className="p-8">
                <pre className="text-emerald-400/90 font-mono text-sm leading-relaxed overflow-x-auto">
                  <code>{`# 1. Install via pip
# pip install statelock

from statelock import StateLock

# 2. Initialize with your API Key
sl = StateLock(api_key="sk_live_...")

# 3. Enforce governance at the runtime gateway
result = sl.enforce(
    action="Refund $450 to customer #123",
    context={"user_role": "support"}
)

if result.is_permitted():
    # Proceed with action
    pass`}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="space-y-8 border-t border-white/5 pt-20">
             <div className="text-center space-y-4 mb-16">
                <h2 className="text-5xl font-black tracking-tight">Scale-Ready Pricing.</h2>
                <p className="text-zinc-500">Enterprise governance that grows with your agent population.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Starter */}
                <div className="p-10 bg-white/[0.03] border border-white/5 rounded-[40px] space-y-8 flex flex-col">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Starter</p>
                      <h3 className="text-4xl font-black">$2,500 <span className="text-sm text-zinc-500">/mo</span></h3>
                   </div>
                   <ul className="space-y-4 flex-1">
                      <li className="flex items-center gap-3 text-sm text-zinc-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 5 Active Agents</li>
                      <li className="flex items-center gap-3 text-sm text-zinc-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 Slack Channel Link</li>
                      <li className="flex items-center gap-3 text-sm text-zinc-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Standard Adjudication</li>
                   </ul>
                   <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all">Get Started</button>
                </div>

                {/* Growth */}
                <div className="p-10 bg-emerald-600 rounded-[40px] space-y-8 flex flex-col shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <Zap className="w-20 h-20" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Growth</p>
                      <h3 className="text-4xl font-black">$8,000 <span className="text-sm text-emerald-100">/mo</span></h3>
                   </div>
                   <ul className="space-y-4 flex-1">
                      <li className="flex items-center gap-3 text-sm text-emerald-50"><CheckCircle2 className="w-4 h-4 text-white" /> Up to 25 Active Agents</li>
                      <li className="flex items-center gap-3 text-sm text-emerald-50"><CheckCircle2 className="w-4 h-4 text-white" /> 5 Slack Channel Links</li>
                      <li className="flex items-center gap-3 text-sm text-emerald-50"><CheckCircle2 className="w-4 h-4 text-white" /> Custom Logic Graphs</li>
                      <li className="flex items-center gap-3 text-sm text-emerald-50"><CheckCircle2 className="w-4 h-4 text-white" /> SOC2 Compliance Logs</li>
                   </ul>
                   <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-black transition-all shadow-xl">Approach Sales</button>
                </div>

                {/* Enterprise */}
                <div className="p-10 bg-white/[0.03] border border-white/5 rounded-[40px] space-y-8 flex flex-col">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Custom</p>
                      <h3 className="text-4xl font-black">Enterprise</h3>
                   </div>
                   <ul className="space-y-4 flex-1">
                      <li className="flex items-center gap-3 text-sm text-zinc-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Agents</li>
                      <li className="flex items-center gap-3 text-sm text-zinc-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full Knowledge Moat</li>
                      <li className="flex items-center gap-3 text-sm text-zinc-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 Dedicated Support</li>
                   </ul>
                   <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all">Contact Sales</button>
                </div>
             </div>
          </section>

          {/* Footer */}
          <section className="text-center space-y-6 pt-20">
             <div className="flex justify-center mb-8">
               <ShieldCheck className="w-16 h-16 text-emerald-500" />
             </div>
             <h3 className="text-3xl font-black">Secure Your Agentic Future.</h3>
             <p className="text-zinc-500">Join the waitlist for private beta access.</p>
             <button className="px-10 py-5 bg-emerald-600 rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/10">Get Early Access</button>
          </section>

        </main>
      </div>
    </div>
  );
}
