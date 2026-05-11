"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BlogCardProps {
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
  slug: string;
  claps?: string;
}

const BlogCard = ({ title, date, readTime, excerpt, image, slug, claps }: BlogCardProps) => (
  <Link href={`/blog/${slug}`} className="group block mb-16">
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-1/3 aspect-[16/10] bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 relative">
        <Image 
          src={image} 
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="w-full md:w-2/3">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
          <span>{date}</span>
          <span>•</span>
          <span>{readTime}</span>
          {claps && (
            <>
              <span>•</span>
              <span className="text-[#004AC6] font-bold">{claps} Claps</span>
            </>
          )}
        </div>
        <h2 
          className="font-serif italic text-3xl md:text-4xl text-black mb-4 group-hover:text-[#004AC6] transition-colors"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          {title}
        </h2>
        <p className="text-zinc-500 line-clamp-2 font-light text-lg leading-relaxed">
          {excerpt}
        </p>
      </div>
    </div>
  </Link>
);

export default function BlogIndex() {
  const posts = [
    {
      title: "Why Your Company's AI is Failing (and How a Deterministic Brain Fixes It)",
      slug: "ai-is-failing",
      date: "May 10, 2026",
      readTime: "7 min read",
      claps: "8.2k",
      excerpt: "Prompt engineering isn't enough. Without a deterministic gateway, your agent will hallucinate a $0 refund into a $10,000 disaster.",
      image: "/blog-hero.png" // Using the copied image as placeholder
    },
    {
      title: "Zero to One: How We Built an AI OS that Actually Runs a Business",
      slug: "building-ai-os",
      date: "May 8, 2026",
      readTime: "12 min read",
      claps: "4.5k",
      excerpt: "Building a system that can manage real-world operations requires more than just a large context window. It requires a fundamental shift in how we think about agentic control.",
      image: "/blog-hero.png"
    }
  ];

  return (
    <div className="bg-[#FCFBF7] text-[#1A1A1A] min-h-screen selection:bg-[#60FFB4]/30">
      <nav className="h-16 flex items-center border-b border-zinc-100 mb-20 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="font-mono text-[10px] text-black uppercase tracking-widest font-bold">Statelock / Insights</Link>
          <div className="flex gap-8 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Link href="/blog" className="text-black font-bold">Archives</Link>
            <Link href="/about" className="hover:text-black transition-colors">Strategy</Link>
            <Link href="/newsletter" className="hover:text-black transition-colors">Subscribe</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        {/* Featured Post */}
        <section className="mb-32">
          <Link href="/blog/end-of-hallucination" className="group">
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-10 border border-zinc-200">
              <Image 
                src="/blog-hero.png" 
                alt="End of Hallucination"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#60FFB4] mb-4 font-bold">Featured • Insight [01]</div>
                <h1 
                  className="font-serif italic text-4xl md:text-6xl text-white leading-tight"
                  style={{ fontFamily: "var(--font-fraunces), serif" }}
                >
                  The End of Hallucination: <br />Building the Deterministic Control Plane.
                </h1>
              </div>
            </div>
          </Link>
        </section>

        {/* Feed */}
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold">Recent Insights</h3>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>
          
          {posts.map((post, i) => (
            <BlogCard key={i} {...post} />
          ))}
        </section>
      </main>

      <footer className="py-20 border-t border-zinc-100 text-center">
        <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
          &copy; 2026 Statelock Editorial • Built for the Deterministic Era
        </p>
      </footer>
    </div>
  );
}
