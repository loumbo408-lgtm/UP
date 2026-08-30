"use client";

import { Power } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function DisponibilitePage() {
  const available = useUpStore((s) => s.available);
  const setAvailable = useUpStore((s) => s.setAvailable);
  const hydrated = useHydrated();
  const on = hydrated && available;

  return (
    <>
      <PageHeader
        eyebrow="Prestataire"
        title="Disponibilité"
        subtitle="Activez pour apparaître dans le radar des clients."
      />

      <div className="px-5">
        <button
          type="button"
          onClick={() => setAvailable(!available)}
          className={`flex w-full items-center justify-between rounded-2xl border p-5 transition ${
            on
              ? "border-up-gold/50 bg-up-gold/10"
              : "border-white/10 bg-up-surface"
          }`}
        >
          <span className="flex items-center gap-4">
            <span
              className={`grid h-11 w-11 place-items-center rounded-xl ${
                on ? "bg-up-gold/20 text-up-gold" : "bg-white/5 text-up-gray"
              }`}
            >
              <Power size={22} />
            </span>
            <span className="text-left">
              <span className="block text-base font-semibold text-up-white">
                {on ? "En ligne" : "Hors ligne"}
              </span>
              <span className="block text-xs text-up-gray">
                {on ? "Vous recevez des demandes" : "Vous êtes invisible"}
              </span>
            </span>
          </span>

          <span
            className={`relative h-7 w-12 rounded-full transition ${
              on ? "bg-up-gold" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-up-black transition-all ${
                on ? "left-[1.375rem]" : "left-0.5"
              }`}
            />
          </span>
        </button>
      </div>
    </>
  );
}
