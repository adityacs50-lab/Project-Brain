'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Database, Users, Zap, Terminal } from 'lucide-react';

export default function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const mechanisms = [
    {
      icon: <Database className="w-6 h-6 text-emerald-400" />,
      title: "01 — Policy Sync",
      description: "Connect your tools once. We extract rules, tribal knowledge, and constraints from Slack and sync them into executable rules.",
      example: {
        label: "Example:",
        input: "Ticket: \"Client needs manual credit for downtime\"",
        output: "→ Rule created: apply_credit max $200 | requires uptime verification"
      }
    },
    {
      icon: <Users className="w-6 h-6 text-purple-400" />,
      title: "02 — Adjudication Engine",
      description: "High-stakes or overlapping decisions are verified using a safety-first deterministic precedence hierarchy to resolve contradictions instantly."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "03 — Gateway Enforcement",
      description: "Every agent action hits our lightning-fast gateway (/agent/query). Decisions are returned in <50ms — Permit or Deny. Fail-closed by default."
    }
  ];

  const jsonSnippet = `{
  "decision": "DENIED",
  "rule": "Refunds > $500 require manager approval",
  "reason": "Exceeds policy cap",
  "confidence": 1.0
}`;

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="bg-black py-28 md:py-40 px-6 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 md:mb-24"
        >
          <p className="text-white/40 text-sm tracking-widest uppercase mb-4 text-center">
            The Architecture of Certainty
          </p>
          <h2 className="text-4xl md:text-6xl text-white tracking-tight text-center leading-tight">
            The Mechanism: <br className="hidden md:block" />
            <span className="text-white/40 font-light">Three Layers of Enforced Intelligence</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
            {mechanisms.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 + (i * 0.1) }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 bg-white/5 rounded-2xl p-4 h-fit">
                  {m.icon}
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold mb-3 tracking-tight">
                    {m.title}
                  </h3>
                  <p className="text-white/50 text-base leading-relaxed mb-4">
                    {m.description}
                  </p>
                  {m.example && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
                      <p className="text-white/30 text-[10px] tracking-widest uppercase font-bold">{m.example.label}</p>
                      <p className="text-white/60 text-sm italic">{m.example.input}</p>
                      <p className="text-emerald-400/80 text-sm font-mono">{m.example.output}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="liquid-glass rounded-3xl p-1 overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="bg-[#0D0D0D] rounded-[1.4rem] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-white/40" />
                  <span className="text-white/40 text-xs font-mono tracking-tight">/agent/query</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                </div>
              </div>
              <div className="p-8">
                <pre className="text-emerald-400/90 font-mono text-sm leading-relaxed">
                  {jsonSnippet}
                </pre>
              </div>
              <div className="grid grid-cols-3 border-t border-white/5 divide-x divide-white/5 text-center">
                <div className="py-4 px-2">
                  <p className="text-white font-medium text-xs">&lt;50ms</p>
                  <p className="text-white/20 text-[10px] uppercase tracking-widest mt-1">Latency</p>
                </div>
                <div className="py-4 px-2">
                  <p className="text-white font-medium text-xs">100%</p>
                  <p className="text-white/20 text-[10px] uppercase tracking-widest mt-1">Deterministic</p>
                </div>
                <div className="py-4 px-2">
                  <p className="text-white font-medium text-xs">0</p>
                  <p className="text-white/20 text-[10px] uppercase tracking-widest mt-1">Hallucinations</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
