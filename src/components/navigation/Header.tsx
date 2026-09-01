"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, Sparkles, LogIn } from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { UserDrawer } from "@/components/navigation/UserDrawer";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoSecretTap = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 3) {
      router.push("/dashboard/admin/login");
      setLogoClicks(0);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const navLinks = [
    { href: "/explore", label: "Explorer les profils" },
    { href: "/#advantages", label: "Services & Avantages" },
    { href: "/#how-it-works", label: "Comment ça marche" },
    { href: "/#safety", label: "Sécurité & Lieux Publics" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#F0E6F3] bg-white/95 backdrop-blur-md transition-all shadow-[0_2px_15px_rgba(136,7,168,0.03)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Brand UP Violet Royal avec Secret Tap Super-Admin */}
          <div
            onClick={handleLogoSecretTap}
            className="cursor-pointer select-none transition active:scale-95"
            title="UP Conciergerie Privée"
          >
            <UpLogo size={36} variant="violet" showText={true} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#6B5D73]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-up-600 ${
                    isActive ? "text-up-600 font-semibold" : ""
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
                className="flex items-center gap-2 rounded-full border border-up-200 bg-up-50/70 px-3.5 sm:px-4 py-2 text-xs font-semibold text-up-700 shadow-xs transition hover:border-up-400 hover:bg-up-100 active:scale-95"
                aria-label="Ouvrir le menu utilisateur"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-up-500 text-white">
                  <User size={13} />
                </span>
                <span className="hidden sm:inline">Mon Espace</span>
                <Menu size={16} className="text-up-700" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F0E6F3] bg-white px-3.5 py-2 text-xs font-semibold text-[#1D0F24] shadow-xs transition hover:border-up-300 hover:text-up-700 hover:bg-up-50/50"
                >
                  <LogIn size={13} className="text-up-600" />
                  <span>Se connecter</span>
                </Link>
                <Link
                  href="/auth/signup?role=companion"
                  className="inline-flex items-center gap-1.5 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] px-3.5 py-2 text-xs font-bold transition"
                >
                  <Sparkles size={13} />
                  <span>S&apos;inscrire</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer */}
      <UserDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
