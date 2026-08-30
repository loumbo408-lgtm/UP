"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { useUpStore, type Role } from "@/lib/store";

export default function AiguillagePage() {
  const router = useRouter();
  const setRole = useUpStore((s) => s.setRole);

  function choisir(role: Role) {
    setRole(role);
    router.push(role === "client" ? "/explore" : "/dashboard/companion");
  }

  return (
    <main className="flex min-h-dvh flex-col justify-between px-6 pb-12 pt-16">
      <div>
        <div className="flex items-end gap-2">
          <span className="font-display text-5xl font-bold leading-none tracking-tight text-up-white">
            UP
          </span>
          <span className="mb-1.5 h-2 w-2 rounded-full bg-up-gold shadow-[0_0_14px_4px_rgba(212,175,55,0.5)]" />
        </div>
        <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-up-gray">
          Conciergerie privée &amp; accompagnement social. Le prestige, à la
          demande — partout au Gabon.
        </p>
      </div>

      <div className="space-y-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-up-gray">
          Je souhaite…
        </p>

        {/* Option 1 : Client */}
        <button
          type="button"
          onClick={() => choisir("client")}
          className="group flex w-full items-center justify-between rounded-2xl border border-up-gold/30 bg-gradient-to-br from-up-gold/15 to-transparent p-5 text-left transition hover:border-up-gold/60"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-up-gold/15 text-up-gold">
              <Compass size={22} />
            </span>
            <span>
              <span className="block text-base font-semibold text-up-white">
                Trouver un profil
              </span>
              <span className="block text-xs text-up-gray">
                Réserver un accompagnement premium
              </span>
            </span>
          </span>
          <ArrowRight
            size={18}
            className="text-up-gold transition group-hover:translate-x-1"
          />
        </button>

        {/* Option 2 : Prestataire */}
        <button
          type="button"
          onClick={() => choisir("prestataire")}
          className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-up-surface p-5 text-left transition hover:border-white/25"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-up-white">
              <Sparkles size={22} />
            </span>
            <span>
              <span className="block text-base font-semibold text-up-white">
                Proposer mes services
              </span>
              <span className="block text-xs text-up-gray">
                Recevoir des demandes autour de moi
              </span>
            </span>
          </span>
          <ArrowRight
            size={18}
            className="text-up-gray transition group-hover:translate-x-1 group-hover:text-up-white"
          />
        </button>

        {/* Option 3 : Équipe UP Supervision & Modération Admin */}
        <button
          type="button"
          onClick={() => {
            setRole("admin");
            document.cookie = "up_role=admin; path=/; max-age=86400; SameSite=Lax";
            document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
            router.push("/dashboard/admin");
          }}
          className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-up-surface/60 p-4 text-left transition hover:border-up-gold/40"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-up-gold/10 text-up-gold">
              <ShieldCheck size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-up-white">
                Supervision &amp; Modération UP
              </span>
              <span className="block text-[11px] text-up-gray">
                Console équipe, KYC &amp; Séquestres
              </span>
            </span>
          </span>
          <ArrowRight
            size={18}
            className="text-up-gray transition group-hover:translate-x-1 group-hover:text-up-gold"
          />
        </button>

        <p className="pt-2 text-center text-[11px] text-up-gray">
          Vous pourrez changer de rôle à tout moment depuis votre profil.
        </p>
      </div>
    </main>
  );
}
