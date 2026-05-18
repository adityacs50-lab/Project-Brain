'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "How is StateLock different from prompt engineering?",
    answer: "Prompt engineering is suggestive. StateLock is a hard runtime enforcement layer. We don’t ask the model to behave — we mathematically guarantee it through our deterministic engine."
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
    answer: "StateLock supports both cloud and on-premise deployments. Your policies and internal data never leave your control unless explicitly configured."
  }
];

function FAQItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className={`border transition-all duration-300 rounded-2xl mb-4 overflow-hidden ${
      isOpen 
        ? 'border-[#10b981]/30 bg-white/[0.03] shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
        : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10'
    }`}>
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
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
          <p className="text-[#e5e5e5]/60 leading-relaxed text-sm md:text-base font-normal">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#050505] py-20 md:py-32 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-3">
            Details
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-semibold tracking-[-0.02em] leading-tight">
            Common Questions.
          </h2>
        </div>

        <div className="flex flex-col gap-1">
          {faqs.map((faq, i) => (
            <FAQItem 
              key={i} 
              {...faq} 
              isOpen={openIndex === i} 
              onClick={() => setOpenIndex(openIndex === i ? null : i)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
