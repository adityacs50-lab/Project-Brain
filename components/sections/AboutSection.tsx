'use client';

import { useRef, type ElementType } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Crosshair, Shield, ClipboardCheck, Activity } from 'lucide-react';

interface Capability {
  Icon: ElementType;
  title: string;
  description: string;
}

const capabilities: Capability[] = [
  {
    Icon: Zap,
    title: 'Logic Extraction',
    description:
      'Automatically converts messy Slack threads into structured YAML rules using Gemini 1.5 Flash. No manual tagging, no spreadsheets — the AI reads your team\'s decisions and distills them into executable policy.',
  },
  {
    Icon: Crosshair,
    title: 'Semantic Search',
    description:
      'Finds the exact right policy using high-dimensional pgvector embeddings. Your AI agents don\'t guess — they query StateLock and retrieve the precise rule for any scenario in milliseconds.',
  },
  {
    Icon: Shield,
    title: 'Conflict Resolution',
    description:
      'Automatically detects and flags contradictory policies. When one Slack thread says "refund everything" and another says "no refunds," StateLock surfaces the conflict before agents act on bad data.',
  },
  {
    Icon: ClipboardCheck,
    title: 'Decision Audit Log',
    description:
      'A premium dashboard for reviewing, editing, and auditing every decision your AI agents make. Full traceability — every agent action links back to the exact rule and source conversation that authorized it.',
  },
  {
    Icon: Activity,
    title: 'System Health Monitoring',
    description:
      'Real-time metrics on system confidence and performance. See exactly how well your knowledge base covers incoming queries, where the gaps are, and which rules need human review.',
  },
];

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      id="capabilities"
      className="bg-black pt-32 md:pt-44 pb-10 md:pb-14 px-6 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-white/40 text-sm tracking-widest uppercase mb-6"
        >
          Core Capabilities
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight mb-16"
        >
          The AI that{' '}
          <span className="text-white/60">understands</span>{' '}
          your business.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + index * 0.1 }}
              className="liquid-glass rounded-2xl p-6 md:p-8"
            >
              <cap.Icon className="w-6 h-6 text-white/60 mb-4" strokeWidth={1.5} />
              <h3 className="text-white text-lg font-medium mb-3 tracking-tight">{cap.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{cap.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
