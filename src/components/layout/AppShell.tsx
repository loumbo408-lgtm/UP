"use client";

import React from "react";
import { Header } from "@/components/navigation/Header";
import { BottomNav } from "@/components/navigation/BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "7xl" | "full";
  className?: string;
}

export function AppShell({
  children,
  showHeader = true,
  showBottomNav = true,
  maxWidth = "7xl",
  className = "",
}: AppShellProps) {
  const maxWClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F2F6F7] text-[#12211F]">
      {showHeader && <Header />}

      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 ${
          maxWClasses[maxWidth]
        } ${showBottomNav ? "pb-24 md:pb-12" : "pb-12"} ${className}`}
      >
        {children}
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
