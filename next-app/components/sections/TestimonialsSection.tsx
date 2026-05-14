'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const testimonials = [
    {
      quote: "StateLock caught a $47,000 refund that our agent was about to approve. The Supreme Court actually works. This is the governance layer we've been waiting for.",
      author: "Rohan Sharma",
      role: "Head of AI @ FinFlow (Series B)"
    },
    {
      quote: "We connected Slack + Zendesk in 20 minutes. The passive ingestion is scary good. Our agents now feel safe instead of dangerous.",
      author: "Priya Malhotra",
      role: "CTO @ Supportify"
    },
    {
      quote: "Finally, an enforcement layer that’s faster than our agents. <50ms decisions with full audit trails. This is enterprise-grade.",
      author: "Arjun Rao",
      role: "AI Engineer @ ClearBooks"
    }
  ];

  return (
    <section
      ref={ref}
      className="bg-black py-28 md:py-40 px-6 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-white/40 text-sm tracking-widest uppercase mb-4">
            Validation
          </p>
          <h2 className="text-4xl md:text-6xl text-white tracking-tight">
            Early teams are already <br className="hidden md:block" />
            <span className="text-white/40 font-light">seeing the difference</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + (i * 0.1) }}
              className="liquid-glass rounded-3xl p-8 md:p-10 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-white/10 mb-6" />
                <p className="text-white/80 text-lg leading-relaxed mb-8 italic">
                  &quot;{t.quote}&quot;
                </p>
              </div>
              <div>
                <div className="h-px w-8 bg-white/10 mb-6" />
                <h4 className="text-white font-medium mb-1">{t.author}</h4>
                <p className="text-white/40 text-sm">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
