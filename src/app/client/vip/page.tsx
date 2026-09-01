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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-up-700">
          <Sparkles size={13} />
          Privilèges Exclusifs
        </span>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
          Abonnement UP VIP
        </h1>
        <p className="mt-1 text-xs text-[#6B5D73]">
          L&apos;expérience prestige et discrète, sans compromis.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[#F0E6F3] bg-white p-8 shadow-xs">
        <span className="inline-flex items-center gap-2 rounded-full border border-up-200 bg-up-50 px-3.5 py-1.5 text-xs font-semibold text-up-700">
          <Crown size={14} />
          Membre VIP Gabon
        </span>

        <p className="mt-4 font-display text-3xl font-bold text-[#1D0F24]">
          25 000{" "}
          <span className="text-sm font-normal text-[#6B5D73]">
            FCFA / mois
          </span>
        </p>

        <ul className="mt-6 space-y-3.5 border-t border-[#F0E6F3] pt-5">
          {avantages.map((a) => (
            <li
              key={a}
              className="flex items-start gap-3 text-xs text-[#1D0F24]"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{a}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-4 text-xs font-bold transition-all"
        >
          <Crown size={15} />
          <span>Souscrire à l&apos;offre VIP</span>
        </button>
      </div>
    </div>
  );
}
