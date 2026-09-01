"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, ExternalLink, Heart } from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { HiddenAdminTrigger } from "@/components/admin/HiddenAdminTrigger";

export function Footer() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  // Secret multi-tap sur le copyright pour ouvrir l'admin
  const handleSecretTap = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 3) {
      router.push("/admin");
      setClickCount(0);
    }
  };

  return (
    <footer className="w-full border-t border-[#F0E6F3] bg-white pt-10 pb-20 md:pb-10 px-4 sm:px-6 lg:px-8 text-xs text-[#6B5D73]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-[#F0E6F3]">
          {/* Col 1 : Marque & Mission */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <UpLogo size={32} showText={true} />
            <p className="text-xs leading-relaxed text-[#6B5D73]">
              Première plateforme de conciergerie privée et d&apos;accompagnement social sécurisé au Gabon.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Services actifs · Libreville &amp; Port-Gentil</span>
            </div>
          </div>

          {/* Col 2 : Découverte */}
          <div className="space-y-2.5">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-[#1D0F24]">
              Explorer
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="hover:text-up-600 transition">
                  Prestataires vérifiés
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-up-600 transition">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/#advantages" className="hover:text-up-600 transition">
                  Services événementiels
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Sécurité & Charte */}
          <div className="space-y-2.5">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-[#1D0F24]">
              Garanties
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#safety" className="hover:text-up-600 transition">
                  Lieux publics obligatoires
                </Link>
              </li>
              <li>
                <span className="text-[#6B5D73]/80">
                  Séquestre Airtel &amp; Moov Money
                </span>
              </li>
              <li>
                <span className="text-[#6B5D73]/80">
                  Vérification KYC stricte
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4 : Pro & Accès */}
          <div className="space-y-2.5">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-[#1D0F24]">
              Partenaires
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/signup?role=companion"
                  className="font-medium text-up-600 hover:text-up-700 transition"
                >
                  Devenir prestataire UP →
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-up-600 transition">
                  Espace connexion membre
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre basse avec Copyright et Bouton Caché Admin */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6B5D73]/80">
          <div
            onClick={handleSecretTap}
            className="cursor-default select-none transition-opacity hover:opacity-90"
            title="UP Gabon"
          >
            © 2026 UP Gabon. Tous droits réservés. Conciergerie d&apos;excellence.
          </div>

          <div className="flex items-center gap-3">
            <HiddenAdminTrigger />
            {/* Bouton discret / caché d'accès Super-Admin */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[10px] text-[#6B5D73]/60 hover:text-up-700 transition-colors p-1 rounded group"
              title="Accès Superviseur & Arbitrage UP"
            >
              <Lock
                size={11}
                className="opacity-40 group-hover:opacity-100 text-up-600 transition-opacity"
              />
              <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                Console interne
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
