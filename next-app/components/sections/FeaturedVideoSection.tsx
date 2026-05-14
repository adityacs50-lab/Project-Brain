'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function FeaturedVideoSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="rounded-3xl overflow-hidden aspect-video relative"
        >
          <video
            suppressHydrationWarning
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Bottom overlay content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div
              className="liquid-glass rounded-2xl p-6 md:p-8 max-w-lg"
              style={{
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <p className="text-white/50 text-xs tracking-widest uppercase mb-3">The Engine in Action</p>
              <p className="text-white text-sm md:text-base leading-relaxed">
                Slack messages and institutional knowledge flow into StateLock. 
                Our engine synthesizes them into version-controlled rules, while the 
                Multi-Agent Supreme Court resolves conflicts to enforce company truth 
                with 100% accountability.
              </p>
            </div>
            <motion.a
              href="#capabilities"
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Capabilities
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
