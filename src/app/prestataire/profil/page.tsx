"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck, LogOut, Repeat, User } from "lucide-react";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { useUpStore } from "@/lib/store";

export default function PrestataireProfilPage() {
  const router = useRouter();
  const clearRole = useUpStore((s) => s.clearRole);

  function changerDeRole() {
    clearRole();
    router.push("/");
  }

  return (
    <>
      <PageHeader eyebrow="Prestataire" title="Profil" />

      <div className="space-y-3 px-5">
        <Card className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-up-gold/15 text-up-gold">
            <User size={22} />
          </span>
          <div>
            <p className="flex items-center gap-1 font-semibold text-up-white">
              Prestataire UP
              <BadgeCheck size={14} className="text-up-gold" />
            </p>
            <p className="text-xs text-up-gray">Profil vérifié</p>
          </div>
        </Card>

        <button
          type="button"
          onClick={changerDeRole}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-up-surface p-4 text-sm text-up-white transition hover:border-white/25"
        >
          <Repeat size={18} className="text-up-gold" />
          Changer de rôle
        </button>

        <button
          type="button"
          onClick={changerDeRole}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-up-surface p-4 text-sm text-up-gray transition hover:text-up-white"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
      </div>
    </>
  );
}
