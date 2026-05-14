'use client';

import { Brain, Github, Twitter, Globe } from 'lucide-react';

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] py-20 px-6 border-t border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-10">
          <Brain className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-xl tracking-tight">StateLock</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-10 mb-12">
          {['Problem', 'Supreme Court', 'How it Works', 'Pricing', 'FAQ'].map((link) => (
            <a 
              key={link} 
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-white/40 hover:text-white text-xs font-medium tracking-wide uppercase transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6 mb-12">
          {[
            { Icon: Github, href: "#" },
            { Icon: Twitter, href: "#" },
            { Icon: Globe, href: "#" }
          ].map(({ Icon, href }, i) => (
            <a 
              key={i} 
              href={href} 
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-300"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>

        <div className="text-white/20 text-[10px] tracking-[0.2em] uppercase font-bold">
          &copy; {currentYear} StateLock Inc. &bull; Made with mathematical certainty.
        </div>
      </div>
    </footer>
  );
}
