"use client";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 z-0 h-full w-full pointer-events-none opacity-[0.15]",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60FFB4" stopOpacity="0" />
              <stop offset="50%" stopColor="#60FFB4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#60FFB4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-100 100 L1100 1100"
            stroke="url(#gradient)"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M-100 300 L1100 1300"
            stroke="url(#gradient)"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M-100 500 L1100 1500"
            stroke="url(#gradient)"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
};
