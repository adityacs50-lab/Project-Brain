'use client';

import Image from 'next/image';
import { ShieldCheck, Scale, AlertTriangle, Gavel } from 'lucide-react';

export default function SupremeCourtSection() {
  const agents = [
    {
      role: "Policy Agent",
      icon: <ShieldCheck className="w-4 h-4 text-[#10b981]" />,
      action: "Cross-references enterprise rules"
    },
    {
      role: "Risk Assessor",
      icon: <AlertTriangle className="w-4 h-4 text-[#10b981]" />,
      action: "Flags potential compliance gaps"
    },
    {
      role: "Devil's Advocate",
      icon: <Scale className="w-4 h-4 text-[#10b981]" />,
      action: "Argues counter-factuals"
    },
    {
      role: "Final Judge",
      icon: <Gavel className="w-4 h-4 text-[#10b981]" />,
      action: "Issues deterministic ruling"
    }
  ];

  return (
    <section id="supreme-court" className="bg-[#050505] py-32 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-4">
            The Arbiter
          </p>
          <h2 className="text-4xl md:text-6xl text-white font-semibold tracking-[-0.02em] leading-tight mb-6">
            The Multi-Agent <br className="hidden md:block" /> Supreme Court.
          </h2>
          <p className="text-[#e5e5e5]/60 text-lg md:text-xl font-normal leading-relaxed">
            Where intelligent debate becomes unbreakable policy.
          </p>
        </div>

        {/* Massive Centerpiece Image */}
        <div className="relative w-full max-w-6xl mx-auto mb-20">
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#10b981]/20 via-transparent to-transparent rounded-3xl blur-2xl opacity-50 pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl">
            {/* Minimal macOS style window controls */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
            <Image 
              src="/supreme-court.png" 
              alt="StateLock Supreme Court Dashboard" 
              width={2400} 
              height={1600}
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              priority
            />
          </div>
        </div>

        {/* Agent Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-6 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
              >
                <div className="mt-1 bg-[#10b981]/10 p-2 rounded-lg border border-[#10b981]/20">
                  {agent.icon}
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm mb-1 tracking-tight">
                    {agent.role}
                  </h4>
                  <p className="text-[#e5e5e5]/50 text-xs leading-relaxed">
                    {agent.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
