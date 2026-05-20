'use client';

import { ShieldAlert, Clock, GitCommit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollReveal, EASE } from '@/components/ui/animations';

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: EASE },
  }),
};

export default function PhilosophySection() {
  const { ref: headerRef, isInView: headerInView } = useScrollReveal();
  const { ref: gridRef, isInView: gridInView } = useScrollReveal(0.1);

  const problems = [
    {
      icon: <Clock className="w-5 h-5 text-[#10b981]" />,
      title: "Your AI agent just issued a $50K refund",
      description: "AI agents make decisions in milliseconds. Without guardrails, a single hallucination can approve refunds, delete data, or send emails your team never authorized. By the time a human notices, the damage is done."
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-[#10b981]" />,
      title: "\"We added a prompt to say don't do that\"",
      description: "Prompt engineering isn't a safety system — it's a suggestion. One jailbreak, one edge case, and your agent blows past every policy you wrote in natural language. Compliance teams won't accept 'we told the AI to be careful' as a defense."
    },
    {
      icon: <GitCommit className="w-5 h-5 text-[#10b981]" />,
      title: "The audit log says: ¯\\_(ツ)_/¯",
      description: "When regulators ask why your AI approved that transaction, you need a deterministic paper trail — not a chat log. Most agent frameworks have zero audit infrastructure. StateLock logs every decision with a cryptographic receipt."
    }
  ];

  return (
    <section id="problem" className="bg-[#050505] py-24 sm:py-28 md:py-36 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 28 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center mb-12 md:mb-20"
        >
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-4">
            The Problem
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-semibold tracking-[-0.02em] leading-tight">
            AI agents are making decisions <br className="hidden md:block" /> no one approved.
          </h2>
        </motion.div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              animate={gridInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-7 sm:p-8 md:p-10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
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
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
