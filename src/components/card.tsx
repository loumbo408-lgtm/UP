import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#F0E6F3] bg-white shadow-xs p-4 ${className}`}
    >
      {children}
    </div>
  );
}
