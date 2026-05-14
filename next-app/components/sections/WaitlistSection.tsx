'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
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
        body: JSON.stringify({ name: 'Final CTA', email: email.trim(), company: '', role: 'waitlist' }),
      });
      const result = await res.json();

      if (result.success) {
        setStatus('success');
        setEmail('');
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

        <h2 className="text-4xl md:text-6xl text-white font-semibold tracking-[-0.04em] mb-8">
          Ready for Agents You <br /> Can Actually Trust?
        </h2>

        <p className="text-[#e5e5e5]/40 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-16">
          We are onboarding only <span className="text-white font-medium italic">5 new companies</span> this month. 
          Deploy AI with mathematical certainty instead of hope.
        </p>

        <div className="max-w-md mx-auto">
          {status === 'success' ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-[#10b981] mb-4" />
              <p className="text-white font-medium">Application Received</p>
              <p className="text-white/40 text-xs mt-2 text-center leading-relaxed">
                We&apos;ll reach out within 24 hours to schedule your onboarding.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                placeholder="your@company.com"
                className="w-full bg-white/[0.03] border border-white/10 rounded-full pl-8 pr-48 py-5 text-white text-sm outline-none focus:border-[#10b981]/30 focus:bg-white/[0.05] transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="absolute right-2 top-2 bottom-2 bg-white text-black rounded-full px-8 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#10b981] transition-all disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Secure My Spot
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
              {errorMsg && (
                <p className="absolute -bottom-8 left-6 text-red-400 text-[10px] uppercase font-bold tracking-widest">{errorMsg}</p>
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
