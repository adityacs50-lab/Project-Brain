'use client';

import { useState } from 'react';
import { ArrowRight, Brain, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = {
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      company: (form.elements.namedItem('company') as HTMLInputElement).value.trim(),
      agents_count: (form.elements.namedItem('agents_count') as HTMLInputElement).value.trim(),
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim(),
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      role: (form.elements.namedItem('role') as HTMLSelectElement).value,
    };

    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setFormState('success');
        form.reset();
      } else {
        setFormState('error');
        setErrorMsg(result.error || 'Something went wrong.');
      }
    } catch {
      setFormState('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <>
      <section className="min-h-screen relative flex flex-col items-center justify-center bg-[#050505] selection:bg-[#10b981]/30 overflow-hidden">
        
        {/* Subtle, premium background lighting (not flashy) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#10b981] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        {/* Navbar */}
        <nav className="absolute top-0 w-full z-20 px-6 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-lg tracking-tight">StateLock</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#problem" className="text-[#e5e5e5]/60 hover:text-[#e5e5e5] text-sm font-medium transition-colors">The Problem</a>
              <a href="#supreme-court" className="text-[#e5e5e5]/60 hover:text-[#e5e5e5] text-sm font-medium transition-colors">Supreme Court</a>
              <a href="#how-it-works" className="text-[#e5e5e5]/60 hover:text-[#e5e5e5] text-sm font-medium transition-colors">How It Works</a>
              <a href="#pricing" className="text-[#e5e5e5]/60 hover:text-[#e5e5e5] text-sm font-medium transition-colors">Pricing</a>
            </div>

            <button
              onClick={() => { setShowModal(true); setFormState('idle'); setErrorMsg(''); }}
              className="px-5 py-2 text-[#10b981] text-sm font-medium border border-[#10b981]/20 hover:border-[#10b981]/40 hover:bg-[#10b981]/5 rounded-full transition-all"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-32 max-w-5xl mx-auto">
          {/* Minimal Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#e5e5e5]/70 text-[11px] font-medium tracking-wide uppercase">
              Private Beta — Limited Spots
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[92px] text-white font-semibold tracking-[-0.05em] leading-[1.0] mb-8">
            AI Agents that <br className="hidden md:block" /> Never Break the Rules.
          </h1>

          <p className="text-[#e5e5e5]/60 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mb-14">
            A deterministic governance layer for your enterprise. No hallucinations. No expensive mistakes. Just mathematically enforced intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-24">
            <button
              onClick={() => { setShowModal(true); setFormState('idle'); setErrorMsg(''); }}
              className="w-full sm:w-auto bg-[#10b981] hover:bg-[#0e9f6e] text-black font-bold rounded-full px-10 py-4.5 text-base transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              Join Private Beta
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setShowModal(true); setFormState('idle'); setErrorMsg(''); }}
              className="w-full sm:w-auto bg-transparent border border-white/10 hover:border-white/30 hover:bg-white/5 text-[#e5e5e5] font-semibold rounded-full px-10 py-4.5 text-base transition-all"
            >
              View Live Demo
            </button>
          </div>

          {/* Minimal Social Proof */}
          <div className="w-full px-6 mb-16">
            <p className="text-center text-[#e5e5e5]/20 text-[10px] font-medium tracking-[0.2em] uppercase mb-10">
              Trusted by forward-thinking teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale-[40%]">
              {['Slack', 'Gmail', 'Zendesk', 'Postgres', 'Salesforce', 'OpenAI', 'AWS'].map((brand) => (
                <span key={brand} className="text-white font-semibold text-sm md:text-lg tracking-tight">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Request Access Modal - Premium Styling */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10 w-full max-w-md shadow-2xl z-10">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {formState === 'success' ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">Request Received</h3>
                <p className="text-[#e5e5e5]/60 text-sm leading-relaxed">
                  We&apos;ll review your application and reach out within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-white text-xl font-semibold mb-2">Request Access</h3>
                <p className="text-[#e5e5e5]/50 text-sm mb-8">
                  We&apos;re currently onboarding a limited number of enterprise partners.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-[#e5e5e5]/60 text-xs font-medium mb-1.5">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[#e5e5e5]/60 text-xs font-medium mb-1.5">Work Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-[#e5e5e5]/60 text-xs font-medium mb-1.5">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="agents_count" className="block text-[#e5e5e5]/60 text-xs font-medium mb-1.5">AI Agents</label>
                      <input
                        type="number"
                        id="agents_count"
                        name="agents_count"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-[#e5e5e5]/60 text-xs font-medium mb-1.5">Role</label>
                      <select
                        id="role"
                        name="role"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[#e5e5e5] text-sm outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-all appearance-none"
                        defaultValue=""
                      >
                        <option value="" disabled className="bg-[#0a0a0a]">Select role</option>
                        <option value="founder" className="bg-[#0a0a0a]">Founder</option>
                        <option value="engineering" className="bg-[#0a0a0a]">Engineering</option>
                        <option value="product" className="bg-[#0a0a0a]">Product</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-[#e5e5e5]/60 text-xs font-medium mb-1.5">Use Case (Optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-all resize-none"
                    />
                  </div>

                  {errorMsg && <p className="text-red-400 text-xs mt-2">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className="w-full bg-[#10b981] hover:bg-[#0e9f6e] text-black font-semibold rounded-lg py-3 text-sm transition-colors mt-6 flex justify-center items-center"
                  >
                    {formState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
