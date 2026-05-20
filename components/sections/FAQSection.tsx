'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal, EASE } from '@/components/ui/animations';

const faqs = [
  {
    question: "How is StateLock different from prompt engineering?",
    answer: "Prompt engineering is suggestive. StateLock is a hard runtime enforcement layer. We don't ask the model to behave — we mathematically guarantee it through our deterministic engine."
  },
  {
    question: "How does the Adjudication Engine resolve policy conflicts?",
    answer: "It uses our safety-first deterministic precedence hierarchy (where restrictions strictly override permissions) to resolve overlapping rules instantly without manual intervention."
  },
  {
    question: "What is the performance overhead?",
    answer: "Our gateway is built for high-scale production. Decision verification is returned in under 50ms, ensuring zero impact on your core user experience."
  },
  {
    question: "Do I need to rewrite my existing agents?",
    answer: "No. StateLock acts as a middleware gateway. You simply add one API call before your agents execute any external tool or action."
  },
  {
    question: "Where is my data stored?",
    answer: "StateLock supports cloud, Private VPC, and fully air-gapped on-premise deployments. With Zero-Retention Mode enabled, we cryptographically log SHA-256 transaction signatures, ensuring zero readable corporate or customer data hits our persistent databases."
  }
];

function FAQItem({ question, answer, isOpen, onClick, index, inView }: { 
  question: string; answer: string; isOpen: boolean; onClick: () => void; index: number; inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
      className={`border transition-all duration-300 rounded-2xl mb-4 overflow-hidden ${
        isOpen 
          ? 'border-[#10b981]/30 bg-white/[0.03] shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
          : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full px-5 py-5 sm:px-6 sm:py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-sm sm:text-base md:text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-[#10b981]' : 'text-white/80 group-hover:text-white'}`}>
          {question}
        </span>
        <div className={`shrink-0 ml-4 p-1.5 rounded-lg border transition-all ${
          isOpen 
            ? 'border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]' 
            : 'border-white/5 text-white/40 group-hover:text-white'
        }`}>
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span key="minus" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Minus className="w-3.5 h-3.5" />
              </motion.span>
            ) : (
              <motion.span key="plus" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Plus className="w-3.5 h-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
              <p className="text-[#e5e5e5]/60 leading-relaxed text-sm md:text-base font-normal">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref, isInView } = useScrollReveal(0.1);

  return (
    <section id="faq" className="bg-[#050505] py-24 sm:py-28 md:py-36 px-6 sm:px-8 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-3">
            Details
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-semibold tracking-[-0.02em] leading-tight">
            Common Questions.
          </h2>
        </motion.div>

        <div ref={ref} className="flex flex-col gap-1">
          {faqs.map((faq, i) => (
            <FAQItem 
              key={i} 
              {...faq} 
              index={i}
              inView={isInView}
              isOpen={openIndex === i} 
              onClick={() => setOpenIndex(openIndex === i ? null : i)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
