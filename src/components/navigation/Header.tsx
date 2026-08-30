"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, Sparkles, ShieldCheck } from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { UserDrawer } from "@/components/navigation/UserDrawer";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const navLinks = [
    { href: "/explore", label: "Explorer" },
    { href: "/#positioning", label: "Concept" },
    { href: "/#how-it-works", label: "Fonctionnement" },
    { href: "/#safety", label: "Sécurité" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[rgba(212,175,55,0.22)] bg-[#0B0B0D]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Brand */}
          <UpLogo size={36} showText={true} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#A1A1AA]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition hover:text-[#FAFAF9] ${
                    isActive ? "text-[#D4AF37] font-semibold" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons / User Menu */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.22)] bg-[#151518] px-3.5 py-2 text-xs font-semibold text-[#FAFAF9] transition hover:border-[#D4AF37] hover:bg-[#202024]"
                aria-label="Ouvrir le menu utilisateur"
              >
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
                  <User size={14} />
                </span>
                <span className="hidden sm:inline">Mon Espace</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex items-center rounded-xl border border-white/10 bg-[#151518] px-3.5 py-2 text-xs font-semibold text-[#FAFAF9] transition hover:border-white/20 hover:bg-[#202024]"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup?role=client"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <Sparkles size={13} />
                  <span>S&apos;inscrire</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#151518] text-[#A1A1AA] transition hover:border-white/20 hover:text-[#FAFAF9] md:hidden"
              aria-label="Menu principal"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <UserDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
