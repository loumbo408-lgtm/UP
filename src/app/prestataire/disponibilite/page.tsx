"use client";

import { Power, Sparkles } from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function DisponibilitePage() {
  const available = useUpStore((s) => s.available);
  const setAvailable = useUpStore((s) => s.setAvailable);
  const hydrated = useHydrated();
  const on = hydrated && available;

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-12">
      <div className="px-1 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
          <Sparkles size={13} />
          Radar &amp; Présence
        </span>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FAFAF9]">
          Disponibilité Immédiate
        </h1>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          Activez votre visibilité pour apparaître sur le radar des clients à proximité.
        </p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setAvailable(!available)}
          className={`flex w-full items-center justify-between rounded-[28px] border p-6 transition-all duration-300 ${
            on
              ? "border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/20 via-[#151518] to-[#151518] shadow-[0_0_25px_rgba(212,175,55,0.25)]"
              : "border-white/10 bg-[#151518] hover:border-white/20"
          }`}
        >
          <span className="flex items-center gap-4">
            <span
              className={`grid h-14 w-14 place-items-center rounded-2xl transition ${
                on
                  ? "bg-[#D4AF37] text-[#0B0B0D] shadow-[0_0_15px_#D4AF37]"
                  : "bg-white/5 text-[#A1A1AA]"
              }`}
            >
              <Power size={26} />
            </span>
            <span className="text-left">
              <span className="flex items-center gap-2 text-base font-bold text-[#FAFAF9]">
                {on ? "En ligne · Disponible" : "Hors ligne · Invisible"}
                {on && (
                  <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E] animate-ping" />
                )}
              </span>
              <span className="block text-xs text-[#A1A1AA] mt-0.5">
                {on
                  ? "Vous recevez les alertes de réservation radar"
                  : "Votre profil est masqué du flux temps réel"}
              </span>
            </span>
          </span>

          <span
            className={`relative h-8 w-14 rounded-full transition-colors ${
              on ? "bg-[#D4AF37]" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-[#0B0B0D] transition-all shadow-md ${
                on ? "left-7" : "left-1"
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
