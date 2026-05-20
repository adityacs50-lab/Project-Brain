'use client';

import { Database, Users, Zap } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: <Database className="w-5 h-5 text-[#10b981]" />,
      title: "Write Your Rules",
      description: "Tell us what your AI is not allowed to do in plain English. For example: 'Never issue refunds over $200 without human approval.'"
    },
    {
      number: "02",
      icon: <Zap className="w-5 h-5 text-[#10b981]" />,
      title: "Agent Asks Permission",
      description: "Before your AI agent takes any critical action (like sending an email or moving money), it checks with StateLock."
    },
    {
      number: "03",
      icon: <Users className="w-5 h-5 text-[#10b981]" />,
      title: "Instant Decision",
      description: "StateLock instantly compares the action against your rules. It either allows the action, blocks it immediately, or alerts a human to review it."
    }
  ];

  return (
    <section id="how-it-works" className="bg-[#050505] py-24 sm:py-28 md:py-36 px-6 sm:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-4">
            The Mechanism
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-semibold tracking-[-0.02em] leading-tight">
            How StateLock Works.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting lines for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative group text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:border-[#10b981]/30 transition-colors duration-500">
                <div className="absolute -top-3 -right-3 bg-[#050505] border border-white/10 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono text-white/40">
                  {step.number}
                </div>
                {step.icon}
              </div>
              <h3 className="text-xl text-white font-semibold mb-4 tracking-tight">
                {step.title}
              </h3>
              <p className="text-[#e5e5e5]/50 leading-relaxed text-sm max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
