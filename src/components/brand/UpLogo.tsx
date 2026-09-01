import React from "react";
import Link from "next/link";

export interface UpLogoProps {
  size?: number;
  variant?: "violet" | "white" | "night";
  showText?: boolean;
  textSubtitle?: string;
  className?: string;
  href?: string;
}

export function UpLogo({
  size = 38,
  variant = "violet",
  showText = true,
  textSubtitle = "CONCIERGERIE PRIVÉE",
  className = "",
  href = "/",
}: UpLogoProps) {
  // Styles selon la variante
  const containerStyle =
    variant === "white"
      ? "bg-white text-[#8807A8] shadow-sm border border-[#E7ACF5]"
      : variant === "night"
      ? "bg-[#1D0F24] text-white shadow-md shadow-[#1D0F24]/30"
      : "bg-[#8807A8] text-white shadow-sm shadow-[#8807A8]/20";

  const textTitleColor =
    variant === "white"
      ? "text-white"
      : "text-[#1D0F24]";

  const textSubColor =
    variant === "white"
      ? "text-white/80"
      : "text-[#6B5D73]";

  const logoDisplay = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl transition-all duration-200 group-hover:scale-105 ${containerStyle}`}
      style={{ width: size, height: size }}
    >
      {/* Symbole officiel UP : Flèche montante et arche en Blanc pur ou Violet Royal */}
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[66%] h-[66%]"
        aria-hidden="true"
      >
        <g fill="currentColor">
          {/* Flèche Montante Supérieure */}
          <path d="M256 104 C248 104 240 108 234 116 L188 174 C180 184 187 200 200 200 H234 V338 C234 350 244 360 256 360 C268 360 278 350 278 338 V200 H312 C325 200 332 184 324 174 L278 116 C272 108 264 104 256 104 Z" />
          {/* Piliers latéraux */}
          <rect x="136" y="168" width="46" height="116" rx="23" />
          <rect x="330" y="168" width="46" height="116" rx="23" />
          {/* Arche inférieure en U */}
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
      {logoDisplay}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-display text-2xl font-bold tracking-tight ${textTitleColor}`}>
              UP
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#8807A8] shadow-[0_0_8px_#8807A8]" />
          </div>
          {textSubtitle && (
            <span className={`mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] ${textSubColor}`}>
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
        className="inline-flex items-center group transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8807A8]"
      >
        {content}
      </Link>
    );
  }

  return content;
}
