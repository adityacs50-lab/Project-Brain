"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, useScroll, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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

const Nav = ({ onWaitlistClick }: { onWaitlistClick: () => void }) => {
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
        <Link href="/landing" className="flex items-center gap-3 font-mono text-sm text-white uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-[#FF3800] pulse-dot" />
          COMPANY BRAIN
        </Link>
        <button 
          onClick={onWaitlistClick}
          className="border border-zinc-700 text-white px-4 py-2 text-sm font-mono hover:border-[#FF3800] hover:text-[#FF3800] transition-all duration-200"
        >
          Request Access
        </button>
      </div>
    </motion.nav>
  );
};

const HeroBackground = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 80 }).map(() => ({
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
          className="absolute w-1 h-1 rounded-full bg-[#FF3800] animate-float-up"
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
    {text: "POST /v1/agent/execute", color: "text-zinc-400"},
    {text: "{", color: "text-zinc-500"},
    {text: '  "action": "wire_transfer",', color: "text-zinc-300"},
    {text: '  "amount": 50000,', color: "text-yellow-500"},
    {text: '  "target": "external_vendor_42"', color: "text-zinc-300"},
    {text: "}", color: "text-zinc-500"},
    {text: "↓ Supreme Court Adjudicating (32ms)", color: "text-[#FF3800]"},
    {text: "{", color: "text-zinc-500"},
    {text: '  "status": "HALTED",', color: "text-red-500"},
    {text: '  "reason": "Policy Violation: Vendor not in Whitelist.",', color: "text-zinc-300"},
    {text: '  "kernel_log": "Rule #904 [Procurement-V2]",', color: "text-blue-400"},
    {text: '  "governance": "Deterministic Enforcement"', color: "text-zinc-500"},
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
        {lines.slice(0, visibleCount).map((line, i) => (
          <div key={i} className={line.color}>
            {line.text}
          </div>
        ))}
        {visibleCount === lines.length && (
          <span className="inline-block w-2 h-4 bg-[#FF3800] ml-1 blink-cursor" />
        )}
      </div>
    </div>
  );
};

// --- Main Page ---

export default function LandingPage() {
  const waitlistRef = useRef<HTMLDivElement>(null);

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const reveal = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const marqueeItems = [
    "SLACK", "GMAIL", "OUTLOOK", "ZENDESK", "POSTGRES", "SALESFORCE", "AWS", "SNOWFLAKE", "OPENAI"
  ];

  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [agentsCount, setAgentsCount] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, agents_count: agentsCount, notes }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setCompany("");
        setAgentsCount("");
        setNotes("");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-black text-white selection:bg-[#60FFB4] selection:text-black min-h-screen relative overflow-x-hidden">
      <CursorGlow />
      <Nav onWaitlistClick={scrollToWaitlist} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-[120px]">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/deterministic_os_kernel_hero.png" 
            alt="Deterministic OS Kernel" 
            fill 
            className="object-cover opacity-30 mix-blend-screen"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        <HeroBackground />
        <div className="max-w-5xl mx-auto px-8 w-full relative z-10">
          <motion.div
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0 }}
            className="inline-block px-3 py-1 rounded-full border border-[#FF3800]/20 bg-[#FF3800]/5 text-[#FF3800] font-mono text-xs mb-8"
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
            The Deterministic OS <br />
            for Agentic Enterprises.
          </motion.h1>

          <motion.p
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-zinc-400 text-lg max-w-xl mb-10 leading-relaxed"
          >
            We build the missing layer between raw company data and reliable AI automation. 
            Company Brain synthesizes your **Slack, Email, Tickets, and Databases** into a deterministic **Executable Skills File** that agents use to work safely.
          </motion.p>

          <motion.div
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <button 
              onClick={scrollToWaitlist}
              className="bg-[#FF3800] text-white font-semibold px-6 py-3 text-sm hover:bg-[#ff5522] transition-all duration-200 rounded-md"
            >
              Join Private Beta
            </button>
            <Link href="/blog" className="border border-zinc-700 text-white px-6 py-3 text-sm font-mono hover:border-zinc-500 transition-all duration-200 rounded-md flex items-center gap-2">
              Read the Insights <span className="text-[#FF3800] animate-pulse">●</span>
            </Link>
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
            {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
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

        <div className="grid grid-cols-12 gap-6 mt-16">
          {[
            {
              id: "[01]",
              title: "Stale Knowledge",
              body: "Your company policies change in Slack every day. Your AI model was trained 6 months ago.",
              span: "col-span-12 md:col-span-8"
            },
            {
              id: "[02]",
              title: "No Guardrails",
              body: "Prompt engineering isn't enough. Without a deterministic gateway, your agent will hallucinate a $10,000 disaster.",
              span: "col-span-12 md:col-span-4"
            },
            {
              id: "[03]",
              title: "Lack of Governance",
              body: "Memory isn't enough. Without the Multi-Agent Supreme Court, your agents operate in a vacuum without accountability or conflict resolution.",
              span: "col-span-12"
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -4, borderColor: "#FF3800" }}
              className={`${card.span} bg-zinc-950 border border-zinc-800 rounded-2xl p-10 transition-all duration-300 group relative overflow-hidden`}
            >
              <div className="font-mono text-xs text-[#FF3800] mb-4">{card.id}</div>
              <h3 className="text-white font-semibold text-2xl mb-4 italic font-serif">{card.title}</h3>
              <p className="text-zinc-500 text-lg leading-relaxed">{card.body}</p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3800]/5 blur-3xl rounded-full" />
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
                  title: "Passive Ingestion (Omni-Source)",
                  body: "Connect Slack, Gmail, Zendesk, and your SQL databases. We extract tribal knowledge and operational constraints across every fragmented silo.",
                  code: [
                    '[Zendesk] Ticket #882: "Client needs a manual credit for downtime."',
                    '→ Rule extracted: action=apply_credit, max=$200, requires=uptime_verification ✓'
                  ]
                },
                {
                  num: "02",
                  title: "Multi-Agent Supreme Court",
                  body: "Every high-stakes decision is adjudicated by a specialized cluster of agents. They resolve conflicts and ensure absolute compliance with your core business logic.",
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

          <div ref={waitlistRef} className="text-center pt-40 border-t border-zinc-900">
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
                className="text-5xl md:text-7xl font-serif italic text-[#FF3800]"
              >
                Start Enforcing.
              </motion.h2>
            </div>
            
            <p className="text-zinc-400 text-lg mb-12 max-w-md mx-auto">
              We are onboarding 5 enterprise partners this month. 
              Secure your spot in the Deterministic Era.
            </p>

            {status === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-950 border border-[#60FFB4]/30 rounded-xl p-8 text-center max-w-md mx-auto"
              >
                <p className="text-[#60FFB4] font-mono text-lg mb-2">✓ You&apos;re on the list.</p>
                <p className="text-zinc-500 text-sm">Check your email. We&apos;ll reach out within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-3">
                <input 
                  type="email" 
                  required
                  placeholder="Work Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:border-[#FF3800] focus:outline-none w-full transition-colors" 
                />
                <input 
                  type="text" 
                  required
                  placeholder="Company Name" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:border-[#FF3800] focus:outline-none w-full transition-colors" 
                />
                <input 
                  type="number" 
                  required
                  placeholder="How many AI agents in production?" 
                  value={agentsCount}
                  onChange={(e) => setAgentsCount(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:border-[#FF3800] focus:outline-none w-full transition-colors" 
                />
                <textarea 
                  placeholder="How can we help? (Optional)" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:border-[#FF3800] focus:outline-none w-full transition-colors min-h-[100px] resize-none" 
                />
                {status === "error" && (
                  <p className="text-red-500 text-xs font-mono mt-1 text-left">
                    Error: {errorMessage}
                  </p>
                )}
                <button 
                  disabled={status === "loading"}
                  className="w-full bg-[#FF3800] text-white font-semibold py-4 rounded-lg hover:bg-[#ff5522] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ animation: status === "idle" ? 'pulseRed 3s ease-in-out infinite' : 'none' }}
                >
                  {status === "loading" ? "Securing..." : "Secure My Spot →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Latest Insights Section */}
      <section className="py-40 border-t border-zinc-900 bg-zinc-950/30">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <div className="font-mono text-xs text-[#60FFB4] mb-4 uppercase tracking-widest">THE KNOWLEDGE BASE</div>
              <h2 className="text-5xl font-serif italic text-white">Latest Insights.</h2>
            </div>
            <Link href="/blog" className="text-zinc-500 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors mb-2">View All Posts →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/blog/end-of-hallucination" className="group">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#60FFB4]/50 transition-all duration-300">
                <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                  <Image src="/blog-hero.png" alt="End of Hallucination" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="p-8">
                  <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">May 10 • 5 Min Read</div>
                  <h3 className="text-2xl font-serif italic text-white mb-4 group-hover:text-[#60FFB4] transition-colors">The End of Hallucination: Building the Deterministic Control Plane.</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">Moving from probabilistic prompting to deterministic programming for enterprise-grade reliability.</p>
                </div>
              </div>
            </Link>
            
            <div className="space-y-6">
              {[
                { title: "Why Your Company's AI is Failing", slug: "ai-is-failing", date: "May 10" },
                { title: "Zero to One: Building an AI OS", slug: "building-ai-os", date: "May 8" },
                { title: "The 7 Powers of the Company Brain", slug: "seven-powers", date: "May 6" }
              ].map((post, i) => (
                <Link key={i} href={`/blog/${post.slug}`} className="block p-6 bg-zinc-900/20 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all group">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-lg text-zinc-300 group-hover:text-white transition-colors leading-snug">{post.title}</h4>
                    <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest pt-1">{post.date}</span>
                  </div>
                </Link>
              ))}
            </div>
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
