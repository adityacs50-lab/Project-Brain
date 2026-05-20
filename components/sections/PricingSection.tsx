'use client';

import { Check } from 'lucide-react';

export default function PricingSection() {
  const tiers = [
    {
      name: "Self-Serve",
      price: "$500",
      description: "Fast-moving AI startups, <3 agents",
      features: ["Core gateway", "1 Million Adjudications/mo", "Local rule caching", "Developer community support"]
    },
    {
      name: "Starter",
      price: "$2,500",
      description: "Scaling AI teams, <10 agents",
      features: ["Slack/Teams auto-ingestion", "10 Million Adjudications/mo", "Conflict detection", "Priority developer support"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$10,000+",
      description: "Enterprise scale and compliance",
      features: ["Private VPC / Air-Gapped Helm Charts", "SSO & SAML integration", "Zero-Retention logs", "Dedicated compliance channels (SOC2/HIPAA)"]
    }
  ];

  return (
    <section id="pricing" className="bg-[#050505] py-24 sm:py-28 md:py-36 px-6 sm:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-20">
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-semibold tracking-[-0.02em] leading-tight mb-6">
            Predictable and Transparent.
          </h2>
          <p className="text-[#e5e5e5]/40 text-sm max-w-xl mx-auto px-4 sm:px-0">
            Early beta participants receive a <span className="text-[#10b981]/80 font-medium">40% discount</span> for the first 6 months.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div 
              key={i}
              className={`bg-white/[0.02] border ${tier.popular ? 'border-[#10b981]/30 bg-white/[0.04]' : 'border-white/10'} rounded-2xl p-7 sm:p-8 md:p-10 flex flex-col`}
            >
              <div className="mb-8">
                <h3 className="text-white/60 text-[10px] tracking-[0.2em] uppercase font-bold mb-4">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl text-white font-semibold tracking-tight">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-white/30 text-xs">/mo</span>}
                </div>
                <p className="text-white/40 text-xs mt-3">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {tier.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className="w-3.5 h-3.5 text-[#10b981] mt-0.5" />
                    <span className="text-white/60 text-xs">{f}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full rounded-full py-3.5 text-xs font-bold uppercase tracking-widest transition-all ${
                tier.popular 
                  ? 'bg-[#10b981] text-black hover:bg-[#0e9f6e]' 
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}>
                Join Private Beta
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
