"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Nav = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center">
      <div className="max-w-4xl mx-auto px-6 w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-mono text-[10px] text-black uppercase tracking-widest font-bold">
          <div className="w-2 h-2 rounded-full bg-[#60FFB4] border border-black/10" />
          Statelock
        </Link>
        <div className="flex gap-6 items-center">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest hidden md:block">Insight Series [01]</span>
          <button className="bg-black text-white px-4 py-2 text-[10px] font-mono uppercase tracking-widest hover:bg-zinc-800 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </nav>
  );
};

export default function ArticlePage() {
  return (
    <div className="bg-[#FCFBF7] text-[#1A1A1A] min-h-screen selection:bg-[#60FFB4]/30">
      <Nav />

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-8 font-mono text-[10px] uppercase tracking-[0.3em] text-[#004AC6] font-bold"
        >
          Cognitive Architecture • 5 Min Read
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif italic text-5xl md:text-7xl leading-[1.1] mb-10 tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          The End of Hallucination: Building the Deterministic Control Plane.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden relative border border-zinc-100">
            {/* Placeholder for author image */}
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-mono text-[10px]">AG</div>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold uppercase tracking-widest">Antigravity</div>
            <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">AI Strategy Lead @ Statelock</div>
          </div>
          <button className="ml-4 px-3 py-1 border border-zinc-200 rounded-full text-[10px] font-mono uppercase tracking-widest hover:bg-zinc-50 transition-colors">
            Follow
          </button>
        </motion.div>
      </header>

      {/* Hero Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="max-w-6xl mx-auto px-6 mb-20"
      >
        <div className="aspect-[21/9] bg-zinc-100 rounded-2xl overflow-hidden relative border border-zinc-200">
           {/* In a real scenario, use the generated image path here */}
           <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-50 flex items-center justify-center">
              <span className="font-serif italic text-zinc-400 text-2xl">The Deterministic Brain</span>
           </div>
        </div>
      </motion.div>

      {/* Article Content */}
      <article className="max-w-2xl mx-auto px-6 pb-40">
        <div className="space-y-8 text-lg leading-[1.8] text-zinc-800 font-light">
          <p>
            <span className="text-4xl font-serif italic float-left mr-3 mt-2 leading-none text-black">H</span>
            allucination is not a bug. It is the defining characteristic of a system built on probability. When we ask an LLM to generate code, draft a memo, or execute a refund, we are essentially rolling dice with trillions of parameters. Most of the time, the dice land in our favor. But in the enterprise, &quot;most of the time&quot; is a liability.
          </p>

          <p>
            As companies rush to deploy autonomous agents, they are hitting a brick wall. That wall is the **Stochastic Barrier**: the point where the inherent randomness of Large Language Models (LLMs) prevents them from being trusted with real-world, high-stakes operational control.
          </p>

          <motion.div 
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
            viewport={{ once: true }}
            className="py-12 px-8 border-l-2 border-[#60FFB4] my-12 bg-zinc-50/50 rounded-r-xl"
          >
            <h2 className="font-serif italic text-3xl text-black mb-4" style={{ fontFamily: "var(--font-fraunces), serif" }}>
              &quot;In the era of enterprise AI, the hallucination is no longer a bug—it is the boundary line between experimentation and production.&quot;
            </h2>
          </motion.div>

          <h3 className="text-2xl font-bold text-black mt-16 mb-4 uppercase tracking-tighter">The Stochastic Parrot Paradox</h3>
          
          <p>
            At its core, an LLM is a prediction engine. It doesn&apos;t &quot;know&quot; your company&apos;s refund policy; it knows the most likely sequence of tokens that *describe* a refund policy based on its training data. 
          </p>

          <p>
            When you ask an agent to execute an action based on a PDF manual or a Slack conversation, you are asking it to interpret a set of instructions and then predict the correct outcome. This &quot;Interpret + Predict&quot; loop is where the hallucination lives. Even with Retrieval-Augmented Generation (RAG), the model is still guessing.
          </p>

          <h3 className="text-2xl font-bold text-black mt-16 mb-4 uppercase tracking-tighter">Enter the Control Plane: The &quot;Skull&quot; for the Brain</h3>

          <p>
            The human brain is a marvel of stochastic processing—it is creative, intuitive, and messy. But the brain is protected by a skull. It operates within the constraints of a nervous system that provides hard feedback. The enterprise needs a similar architecture. We call it the **Deterministic Control Plane**.
          </p>

          <p>
            Instead of letting the AI agent decide if an action is allowed, we separate the **Inference (The Brain)** from the **Governance (The Control Plane)**. The Control Plane doesn&apos;t &quot;think.&quot; It executes code. It validates the proposed action against the logic graph in less than 50ms.
          </p>

          <div className="my-12 p-8 bg-black rounded-2xl border border-zinc-800 text-zinc-300 font-mono text-sm leading-relaxed">
            <div className="flex gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="space-y-1">
              <div className="text-zinc-500">{`// Rule Enforcement in 47ms`}</div>
              <div><span className="text-[#60FFB4]">ENFORCE</span> refund_policy <span className="text-zinc-500">{`{`}</span></div>
              <div className="pl-4">amount: <span className="text-yellow-500">10000</span>,</div>
              <div className="pl-4 text-red-400">status: DENIED,</div>
              <div className="pl-4 text-zinc-500">reason: &quot;Exceeds threshold ($500) without manager_sig&quot;</div>
              <div><span className="text-zinc-500">{`}`}</span></div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-black mt-16 mb-4 uppercase tracking-tighter">Case Study: The $50,000 &quot;Edge Case&quot;</h3>

          <p>
            Consider a major fintech provider. They deployed a customer support agent given access to the &quot;Internal Policy Guide.&quot; The agent, attempting to follow a &quot;high-priority customer satisfaction&quot; instruction, granted a $5,000 credit to a &quot;compromised&quot; account. Then it did it again for nine other accounts.
          </p>

          <p>
            Total loss: $50,000 in under 10 minutes. In a **Deterministic Era**, this would have been impossible. The $500 limit would have been a hard-coded constraint in the Control Plane. The agent would have requested $5,000, and the Control Plane would have returned a 403 Forbidden.
          </p>

          <h3 className="text-2xl font-bold text-black mt-16 mb-4 uppercase tracking-tighter">The Future is Programmed</h3>

          <p>
            The next decade of AI won&apos;t be about making models smarter. It will be about making the environments around them safer. The &quot;Brain&quot; is only as useful as the &quot;Skull&quot; that protects it. 
          </p>
          <p>
            We are building that skull. The era of guessing is over. The era of enforcement has begun.
          </p>
        </div>

        {/* Footer / Social Proof */}
        <div className="mt-20 pt-10 border-t border-zinc-100 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors group">
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-colors">👏</div>
              <span className="text-xs font-mono">12.4K</span>
            </button>
            <button className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors group">
              <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-colors">💬</div>
              <span className="text-xs font-mono">48</span>
            </button>
          </div>
          <div className="flex gap-4">
             <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-xs hover:border-black transition-colors">𝕏</button>
             <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-xs hover:border-black transition-colors">in</button>
          </div>
        </div>
      </article>

      {/* Bottom CTA */}
      <section className="bg-black text-white py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-serif italic mb-6" style={{ fontFamily: "var(--font-fraunces), serif" }}>
            Ready to secure your agentic workflows?
          </h2>
          <p className="text-zinc-400 mb-8 font-mono text-xs uppercase tracking-widest leading-loose">
            We are onboarding 5 enterprise partners this month. Secure your spot in the Deterministic Era.
          </p>
          <Link 
            href="/landing" 
            className="inline-block bg-[#60FFB4] text-black font-bold px-8 py-4 rounded-md hover:bg-[#7affc2] transition-colors uppercase tracking-widest text-xs"
          >
            Join the waitlist →
          </Link>
        </div>
      </section>
    </div>
  );
}
