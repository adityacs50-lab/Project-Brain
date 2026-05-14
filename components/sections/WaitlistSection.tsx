'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [agentsCount, setAgentsCount] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          company: company.trim(), 
          agents_count: agentsCount, 
          notes: notes.trim() 
        }),
      });
      const result = await res.json();

      if (result.success) {
        setStatus('success');
        setEmail('');
        setCompany('');
        setAgentsCount('');
        setNotes('');
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <section id="apply" className="bg-[#050505] py-40 px-6 overflow-hidden relative border-t border-white/5">
      
      {/* Very subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#10b981] opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10b981]/20 bg-[#10b981]/5 mb-10">
          <div className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[#10b981] text-[10px] font-bold tracking-[0.2em] uppercase">
            Only 23 Spots Remaining
          </span>
        </div>

        <h2 className="text-5xl md:text-7xl text-white font-semibold tracking-[-0.05em] leading-[1.1] mb-8">
          Ready for Agents You <br className="hidden md:block" /> Can Actually Trust?
        </h2>

        <p className="text-[#e5e5e5]/40 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-16">
          Deploy AI with mathematical certainty instead of hope. Join the waitlist for our next onboarding batch.
        </p>

        <div className="max-w-xl mx-auto">
          {status === 'success' ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center shadow-2xl">
              <CheckCircle2 className="w-10 h-10 text-[#10b981] mb-4" />
              <p className="text-white font-medium">Application Received</p>
              <p className="text-white/40 text-xs mt-2 text-center leading-relaxed">
                We&apos;ll reach out within 24 hours to schedule your onboarding.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work Email"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white text-sm outline-none focus:border-[#10b981]/30 focus:bg-white/[0.05] transition-all"
              />
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company Name"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white text-sm outline-none focus:border-[#10b981]/30 focus:bg-white/[0.05] transition-all"
              />
              <input
                type="number"
                required
                value={agentsCount}
                onChange={(e) => setAgentsCount(e.target.value)}
                placeholder="Number of AI Agents"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white text-sm outline-none focus:border-[#10b981]/30 focus:bg-white/[0.05] transition-all"
              />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific use case? (Optional)"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white text-sm outline-none focus:border-[#10b981]/30 focus:bg-white/[0.05] transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="md:col-span-2 w-full bg-[#10b981] text-black rounded-xl py-4.5 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0e9f6e] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Secure My Spot
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              {errorMsg && (
                <p className="md:col-span-2 text-red-400 text-[10px] uppercase font-bold tracking-widest text-center mt-2">{errorMsg}</p>
              )}
            </form>
          )}
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6">
          <p className="text-white/20 text-[11px] max-w-sm leading-relaxed text-center italic">
            &quot;Built from a hostel room in India by 19-year-old Aditya. Obsessed with making AI agents safe for real companies.&quot;
          </p>
          <div className="flex items-center gap-8 opacity-40">
            {['No Sales Calls', 'Early Beta (40% Off)', 'Deterministic Era'].map((tag) => (
              <span key={tag} className="text-white text-[9px] font-bold uppercase tracking-[0.2em]">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
