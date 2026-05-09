"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, useScroll, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- Components ---

const CursorGlow = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 150);
      mouseY.set(e.clientY - 150);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] w-[300px] h-[300px] rounded-full"
      style={{
        x: springX,
        y: springY,
        background: "radial-gradient(circle, rgba(96,255,180,0.08) 0%, transparent 70%)",
      }}
    />
  );
};

const Nav = () => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full h-16 z-50 transition-all duration-300 flex items-center border-b ${
        scrolled 
          ? "bg-black/90 backdrop-blur-md border-zinc-900" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-8 w-full flex justify-between items-center">
        <div className="flex items-center gap-3 font-mono text-sm text-white uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-[#60FFB4] pulse-dot" />
          COMPANY BRAIN
        </div>
        <button className="border border-zinc-700 text-white px-4 py-2 text-sm font-mono hover:border-[#60FFB4] hover:text-[#60FFB4] transition-all duration-200">
          Request Access
        </button>
      </div>
    </motion.nav>
  );
};

const HeroBackground = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, _i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${Math.random() * 15 + 10}s`,
      delay: `${Math.random() * 15}s`,
      opacity: Math.random() * 0.15 + 0.05,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#60FFB4] animate-float-up"
          style={{
            left: p.left,
            top: p.top,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

const HeroCodeBlock = () => {
  const lines = [
    {text: "POST /v1/agent/query", color: "text-zinc-400"},
    {text: "{", color: "text-zinc-500"},
    {text: '  "action": "issue_refund",', color: "text-zinc-300"},
    {text: '  "amount": 10000', color: "text-yellow-500"},
    {text: "}", color: "text-zinc-500"},
    {text: "↓ Company Brain enforces in 47ms", color: "text-[#60FFB4]"},
    {text: "{", color: "text-zinc-500"},
    {text: '  "decision": "DENIED",', color: "text-red-400"},
    {text: '  "rule": "Refunds >$500 require approval.",', color: "text-zinc-300"},
    {text: '  "source": "#finance-ops · 2024-11-03",', color: "text-blue-400"},
    {text: '  "confidence": 0.97', color: "text-yellow-500"},
    {text: "}", color: "text-zinc-500"},
  ];

  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < lines.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, lines.length]);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 font-mono text-sm shadow-2xl mt-16 max-w-2xl">
      <div className="flex gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
      </div>
      <div className="space-y-1">
        {lines.slice(0, visibleCount).map((line, _i) => (
          <div key={i} className={line.color}>
            {line.text}
          </div>
        ))}
        {visibleCount === lines.length && (
          <span className="inline-block w-2 h-4 bg-[#60FFB4] ml-1 blink-cursor" />
        )}
      </div>
    </div>
  );
};

// --- Main Page ---

export default function LandingPage() {
  const reveal = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const marqueeItems = [
    "SLACK", "SALESFORCE", "AWS", "ZENDESK", "LANGCHAIN", "OPENAI", "CREWAI", "ANTHROPIC"
  ];

  return (
    <div className="bg-black text-white selection:bg-[#60FFB4] selection:text-black min-h-screen relative overflow-x-hidden">
      <CursorGlow />
      <Nav />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-[120px]">
        <HeroBackground />
        <div className="max-w-5xl mx-auto px-8 w-full relative z-10">
          <motion.div
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0 }}
            className="inline-block px-3 py-1 rounded-full border border-[#60FFB4]/20 bg-[#60FFB4]/5 text-[#60FFB4] font-mono text-xs mb-8"
          >
            PRIVATE BETA · LIMITED TO 50 COMPANIES
          </motion.div>

          <motion.h1
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-serif italic text-6xl md:text-8xl leading-none tracking-tight text-white max-w-4xl mb-8"
          >
            The Deterministic Control Plane <br />
            for Enterprise AI.
          </motion.h1>

          <motion.p
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-zinc-400 text-lg max-w-xl mb-10 leading-relaxed"
          >
            Most AI agents ignore company policy because it&apos;s trapped in Slack and PDFs. 
            Company Brain extracts your team&apos;s tribal knowledge and enforces it as a real-time API firewall.
          </motion.p>

          <motion.div
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <button className="bg-[#60FFB4] text-black font-semibold px-6 py-3 text-sm hover:bg-[#7affc2] transition-all duration-200 rounded-md">
              Join Private Beta
            </button>
            <button className="border border-zinc-700 text-white px-6 py-3 text-sm font-mono hover:border-zinc-500 transition-all duration-200 rounded-md">
              Read Documentation
            </button>
          </motion.div>

          <motion.div
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.6 }}
            className="-mb-16"
          >
            <HeroCodeBlock />
          </motion.div>
        </div>
      </section>

      {/* Marquee Bar */}
      <section className="border-y border-zinc-900 py-10 overflow-hidden bg-black relative z-10">
        <div className="font-mono text-[10px] text-zinc-600 text-center mb-6 uppercase tracking-[0.2em]">
          BUILT FOR TEAMS USING:
        </div>
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="flex gap-16 items-center animate-marquee">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, _i) => (
              <span key={i} className="font-mono text-sm text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-widest">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-40 max-w-5xl mx-auto px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-serif italic text-white mb-16"
        >
          Why LLMs Fail in the Enterprise.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: "[01]",
              title: "Stale Knowledge",
              body: "Your company policies change in Slack every day. Your AI model was trained 6 months ago."
            },
            {
              id: "[02]",
              title: "No Guardrails",
              body: "Prompt engineering isn't enough. Without a deterministic gateway, your agent will hallucinate a $0 refund into a $10,000 disaster."
            },
            {
              id: "[03]",
              title: "Shadow Logic",
              body: "Tribal knowledge lives in the heads of your senior staff. When they leave, your AI stays dumb."
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -4, borderColor: "#60FFB4" }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 transition-all duration-300 group"
            >
              <div className="font-mono text-xs text-[#60FFB4] mb-4">{card.id}</div>
              <h3 className="text-white font-semibold text-lg mb-3">{card.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-40 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-8 relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[#60FFB4]/30 md:block hidden" />
          
          <div className="md:pl-12">
            <div className="font-mono text-xs text-[#60FFB4] mb-4 uppercase tracking-widest">THE MECHANISM</div>
            <h2 className="text-5xl font-serif italic text-white mb-20">Three steps to enforced intelligence.</h2>

            <div className="space-y-0">
              {[
                {
                  num: "01",
                  title: "Passive Ingestion",
                  body: "Connect our bot to your Slack channels. We use LLMs to extract business rules, permissions, and logic from natural conversations.",
                  code: [
                    '[#finance-ops] @sarah: "Any refund over $500 needs manager sign-off going forward"',
                    '→ Rule extracted: threshold=$500, action=refund, requires=manager_approval ✓'
                  ]
                },
                {
                  num: "02",
                  title: "The Executive Seal",
                  body: "Review extracted rules in a premium dashboard. Your legal/ops team signs off on every logic branch before it goes live.",
                  component: (
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-tighter">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-md"
                      >
                        EXTRACTED
                      </motion.div>
                      <span className="text-zinc-800">→</span>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="px-4 py-2 border border-[#60FFB4] text-[#60FFB4] rounded-md"
                      >
                        REVIEWED
                      </motion.div>
                      <span className="text-zinc-800">→</span>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-md"
                      >
                        LIVE
                      </motion.div>
                    </div>
                  )
                },
                {
                  num: "03",
                  title: "Runtime Enforcement",
                  body: "Every time your AI agent tries to take an action, it hits our /agent/query gateway. We permit or deny the action in <50ms.",
                  code: [
                    '{',
                    '  "decision": "DENIED",',
                    '  "rule": "Refunds >$500 need approval",',
                    '  "confidence": 0.97',
                    '}'
                  ]
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="grid grid-cols-[80px_1fr] gap-8 border-t border-zinc-900 py-12 items-start"
                >
                  <div className="font-mono text-[#60FFB4] text-sm">{step.num}</div>
                  <div>
                    <h3 className="text-2xl font-serif italic text-white mb-3">{step.title}</h3>
                    <p className="text-zinc-400 text-sm mb-6 max-w-2xl">{step.body}</p>
                    {step.code ? (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-400">
                        {step.code.map((line, j) => (
                          <div key={j} className={line.includes("DENIED") ? "text-red-400" : ""}>
                            {line}
                          </div>
                        ))}
                      </div>
                    ) : step.component}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-40 pt-32 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-40">
            {[
              { val: "<50ms", label: "Average response time" },
              { val: "100%", label: "Deterministic accuracy" },
              { val: "0", label: "Hallucinations permitted" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-left"
              >
                <div className="text-7xl font-mono text-white mb-3 tracking-tighter">{stat.val}</div>
                <div className="text-zinc-500 text-xs font-mono uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-40 border-t border-zinc-900">
            <div className="overflow-hidden mb-2">
              <motion.h2 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-7xl font-serif italic text-white"
              >
                Stop Guessing.
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-12">
              <motion.h2 
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-7xl font-serif italic text-[#60FFB4]"
              >
                Start Enforcing.
              </motion.h2>
            </div>
            
            <p className="text-zinc-400 text-lg mb-12 max-w-md mx-auto">
              We are onboarding 5 enterprise partners this month. 
              Secure your spot in the Deterministic Era.
            </p>

            <form className="max-w-md mx-auto flex flex-col gap-3">
              <input type="email" placeholder="Work Email" className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:border-[#60FFB4] focus:outline-none w-full transition-colors" />
              <input type="text" placeholder="Company Name" className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:border-[#60FFB4] focus:outline-none w-full transition-colors" />
              <input type="number" placeholder="How many AI agents in production?" className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:border-[#60FFB4] focus:outline-none w-full transition-colors" />
              <button className="w-full bg-[#60FFB4] text-black font-semibold py-4 rounded-lg hover:bg-[#7affc2] transition-colors mt-2" style={{ animation: 'pulseGreen 3s ease-in-out infinite' }}>
                Secure My Spot →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
              &copy; 2025 COMPANY BRAIN
            </div>
            <div className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
              BUILT FOR THE DETERMINISTIC ERA
            </div>
          </div>
          <div className="text-center font-mono text-xs text-zinc-800 mt-12 tracking-widest">
            Built by Aditya · Chhatrapati Sambhajinagar, India 🇮🇳
          </div>
        </div>
      </footer>
    </div>
  );
}
