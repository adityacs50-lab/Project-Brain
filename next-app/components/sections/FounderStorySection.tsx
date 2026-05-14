'use client';

import { motion } from 'framer-motion';

export default function FounderStorySection() {
  return (
    <section id="founder" className="bg-[#050505] py-32 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-8">
          The Origin
        </p>
        
        <div className="space-y-6">
          <p className="text-[#e5e5e5] text-xl md:text-2xl font-light leading-relaxed italic">
            "I saw companies rushing to deploy AI agents with zero real control. 
            StateLock was built to turn company policy into law — ensuring agents 
            amplify intelligence without creating new risks."
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 overflow-hidden grayscale">
             <span className="text-white/20 font-light text-xl">A</span>
          </div>
          <p className="text-white font-medium text-sm">Aditya</p>
          <p className="text-white/30 text-[11px] uppercase tracking-widest mt-1">Founder @ StateLock • 19yo</p>
        </div>
      </div>
    </section>
  );
}
