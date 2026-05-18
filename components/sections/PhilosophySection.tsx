'use client';

import { ShieldAlert, Clock, GitCommit } from 'lucide-react';

export default function PhilosophySection() {
  const problems = [
    {
      icon: <Clock className="w-5 h-5 text-[#10b981]" />,
      title: "Bloated Compliance Costs",
      description: "Manual auditing of runaway AI actions drains engineering hours and inflates compliance overhead. StateLock automates enforcement at the gateway, slashing operational auditing costs by up to 80%."
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-[#10b981]" />,
      title: "Catastrophic Regulatory Fines",
      description: "Prompt engineering is theater. A single hallucination-induced policy breach can trigger multi-million dollar GDPR, HIPAA, or SEC compliance penalties. StateLock's deterministic gateway mathematically eliminates this risk."
    },
    {
      icon: <GitCommit className="w-5 h-5 text-[#10b981]" />,
      title: "Silent Data Leaks & Errors",
      description: "Without hard runtime barriers, agents can silently leak customer PII, download unauthorized tables, or execute destructive actions, costing millions in remediation, liability, and reputational damage."
    }
  ];

  return (
    <section id="problem" className="bg-[#050505] py-20 md:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12 md:mb-20">
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-4">
            The Governance Gap
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-semibold tracking-[-0.02em] leading-tight">
            Why current agents fail <br className="hidden md:block" /> in the enterprise.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, idx) => (
            <div 
              key={idx}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
            >
              <div className="bg-[#10b981]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-8 border border-[#10b981]/20">
                {problem.icon}
              </div>
              <h3 className="text-xl text-white font-semibold mb-4 tracking-tight">
                {problem.title}
              </h3>
              <p className="text-[#e5e5e5]/60 leading-relaxed text-sm">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
