import React from "react";
import Link from "next/link";

export interface UpLogoProps {
  size?: number;
  variant?: "gold" | "white" | "teal" | "dark";
  showText?: boolean;
  textSubtitle?: string;
  className?: string;
  href?: string;
}

export function UpLogo({
  size = 36,
  variant = "gold",
  showText = true,
  textSubtitle = "CONCIERGERIE PRIVÉE",
  className = "",
  href = "/",
}: UpLogoProps) {
  // Color mapping
  const colorMap = {
    gold: "text-[#D4AF37]",
    white: "text-[#FAFAF9]",
    teal: "text-[#108A8A]",
    dark: "text-[#151518]",
  };

  const badgeBg = {
    gold: "bg-[#D4AF37]/10 border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]",
    white: "bg-white/10 border-white/20",
    teal: "bg-[#108A8A]/15 border-[#108A8A]/30",
    dark: "bg-white/5 border-white/10",
  };

  const logoSvg = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl border transition-all duration-300 ${badgeBg[variant]}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-[65%] h-[65%] transition-colors duration-200 ${colorMap[variant]}`}
        aria-hidden="true"
      >
        <g fill="currentColor">
          {/* Arrow Head & Central Column */}
          <path d="M256 104 C248 104 240 108 234 116 L188 174 C180 184 187 200 200 200 H234 V338 C234 350 244 360 256 360 C268 360 278 350 278 338 V200 H312 C325 200 332 184 324 174 L278 116 C272 108 264 104 256 104 Z" />
          {/* Left Pillar */}
          <rect x="136" y="168" width="46" height="116" rx="23" />
          {/* Right Pillar */}
          <rect x="330" y="168" width="46" height="116" rx="23" />
          {/* Bottom U-Curve Bridge */}
          <path d="M136 256 C136 348 190 404 256 404 C322 404 376 348 376 256 H330 C330 324 294 358 256 358 C218 358 182 324 182 256 H136 Z" />
        </g>
      </svg>
    </div>
  );

  const content = (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      role="img"
      aria-label="UP Conciergerie Privée Logo"
    >
      {logoSvg}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-display text-2xl font-bold tracking-tight text-[#FAFAF9]">
              UP
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          </div>
          {textSubtitle && (
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#A1A1AA]">
              {textSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center group transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      >
        {content}
      </Link>
    );
  }

  return content;
}
