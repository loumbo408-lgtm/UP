"use client";

import { Check, Crown, Sparkles } from "lucide-react";

const avantages = [
  "Accès prioritaire aux profils les mieux notés",
  "Frais de conciergerie offerts sur toutes vos réservations",
  "Ligne directe conciergerie privée dédiée 24/7",
  "Prestations confidentielles et réservation prioritaire",
];

export default function VipPage() {
  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-12">
      <div className="px-1 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
          <Sparkles size={13} />
          Privilèges Exclusifs
        </span>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FAFAF9]">
          Abonnement UP VIP
        </h1>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          L&apos;expérience prestige et discrète, sans compromis.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-[rgba(212,175,55,0.3)] bg-gradient-to-b from-[#151518] to-[#0B0B0D] p-6 shadow-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 py-1.5 text-xs font-semibold text-[#D4AF37]">
          <Crown size={14} />
          Membre VIP Gabon
        </span>

        <p className="mt-4 font-display text-3xl font-bold text-[#FAFAF9]">
          25 000{" "}
          <span className="text-sm font-normal text-[#A1A1AA]">
            FCFA / mois
          </span>
        </p>

        <ul className="mt-6 space-y-3.5 border-t border-white/10 pt-5">
          {avantages.map((a) => (
            <li
              key={a}
              className="flex items-start gap-3 text-xs text-[#FAFAF9]"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-[#D4AF37]" />
              <span>{a}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] py-4 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
        >
          <Crown size={15} />
          <span>Souscrire à l&apos;offre VIP</span>
        </button>
      </div>
    </div>
  );
}
