'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "How is StateLock different from prompt engineering?",
    answer: "Prompt engineering is suggestive. StateLock is a hard runtime enforcement layer. We don’t ask the model to behave — we mathematically guarantee it through our deterministic engine."
  },
  {
    question: "Is the Supreme Court actually multiple agents?",
    answer: "Yes. It uses a specialized multi-agent system that debates high-stakes decisions using your company’s real policies and historical data to reach a binding verdict."
  },
  {
    question: "What is the performance overhead?",
    answer: "Our gateway is built for high-scale production. Standard decisions are returned in under 50ms. Full Supreme Court reviews (only triggered for high-risk actions) take 200–400ms."
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
    <div className="border-b border-white/5">
      <button
        onClick={onClick}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <span className={`text-lg transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
          {question}
        </span>
        <div className="text-white/20 group-hover:text-white transition-colors">
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-8' : 'max-h-0'}`}>
        <p className="text-[#e5e5e5]/40 leading-relaxed text-base max-w-3xl">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#050505] py-32 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#10b981] text-xs font-semibold tracking-widest uppercase mb-4">
            Details
          </p>
          <h2 className="text-3xl md:text-5xl text-white font-semibold tracking-[-0.02em] leading-tight">
            Common Questions.
          </h2>
        </div>

        <div className="flex flex-col">
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
