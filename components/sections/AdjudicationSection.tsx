'use client';

import Image from 'next/image';
import { ShieldCheck, Scale, AlertTriangle, Gavel } from 'lucide-react';

export default function AdjudicationSection() {
  const agents = [
    {
      role: "Policy Analyzer",
      icon: <ShieldCheck className="w-4 h-4 text-[#10b981]" />,
      action: "Cross-references actions against explicit rules"
    },
    {
      role: "Threshold Guard",
      icon: <AlertTriangle className="w-4 h-4 text-[#10b981]" />,
      action: "Enforces exact mathematical limits"
    },
    {
      role: "Semantic Matcher",
      icon: <Scale className="w-4 h-4 text-[#10b981]" />,
      action: "Verifies natural-language policies"
    },
    {
      role: "Enforcement Gateway",
      icon: <Gavel className="w-4 h-4 text-[#10b981]" />,
      action: "Issues binding allow/deny decisions"
    }
  ];

  return (
    <section id="adjudication" className="bg-[#050505] py-24 sm:py-28 md:py-36 px-6 sm:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-4">
            The Arbiter
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl text-white font-semibold tracking-[-0.02em] leading-tight mb-6">
            The Determinative <br className="hidden md:block" /> Adjudication Engine.
          </h2>
          <p className="text-[#e5e5e5]/60 text-base sm:text-lg md:text-xl font-normal leading-relaxed">
            Where complex operational decisions meet real-time, unbreakable policy enforcement.
          </p>
        </div>

        {/* Massive Centerpiece Image */}
        <div className="relative w-full max-w-6xl mx-auto mb-10 md:mb-12">
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#10b981]/10 via-transparent to-transparent rounded-3xl blur-3xl opacity-30 pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl">
            {/* Minimal macOS style window controls */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
            <Image 
              src="/adjudication-dashboard.png" 
              alt="StateLock Adjudication Dashboard" 
              width={2400} 
              height={1600}
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              priority
            />
          </div>
        </div>

        {/* Benefit Explanation */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20 px-2 sm:px-0">
          <p className="text-[#e5e5e5]/50 text-xs sm:text-sm md:text-base leading-relaxed italic">
            &ldquo;Every action is verified against active policies locally at the edge in &lt;3ms, with live &lt;150ms WebSocket active sync. Cryptographically logged and fail-closed by default for absolute enterprise compliance.&rdquo;
          </p>
        </div>

        {/* Agent Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-6 sm:p-7 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#10b981]/20 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="mt-1 bg-[#10b981]/10 p-2 rounded-lg border border-[#10b981]/20 group-hover:scale-110 transition-transform">
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
