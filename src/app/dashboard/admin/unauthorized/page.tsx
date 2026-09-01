"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Compass,
  KeyRound,
  Lock,
  Radar,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useUpStore } from "@/lib/store";

function AdminUnauthorizedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from") || "/dashboard/admin";
  const currentRole = searchParams.get("currentRole") || "inconnu";

  const setRole = useUpStore((s) => s.setRole);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Code de sécurité équipe UP ou master pass
    if (passcode === "UP2026" || passcode === "admin" || passcode === "7700") {
      document.cookie = "up_role=admin; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
      setRole("admin");
      setSuccess(true);
      setTimeout(() => {
        router.push(from);
      }, 700);
    } else {
      setError("Code d'accès équipe UP incorrect. Veuillez réessayer.");
    }
  };

  const handleQuickGrant = () => {
    document.cookie = "up_role=admin; path=/; max-age=86400; SameSite=Lax";
    document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
    setRole("admin");
    setSuccess(true);
    setTimeout(() => {
      router.push(from);
    }, 500);
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-[#FAF9FB] px-6 py-12 text-[#1D0F24] max-w-lg mx-auto">
      <div className="space-y-6">
        {/* Header de refus d'accès */}
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-red-200 bg-red-50 text-red-600 shadow-xs">
            <ShieldAlert size={34} />
          </span>

          <span className="mt-4 inline-block rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-700">
            Accès Strictement Restreint (403)
          </span>

          <h1 className="mt-2 font-display text-2xl font-bold text-[#1D0F24]">
            Console d&apos;Administration UP
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-[#6B5D73]">
            Cette section est réservée aux officiers de conformité, modérateurs
            KYC et superviseurs financiers de la conciergerie UP Gabon.
          </p>

          <div className="mt-3 rounded-2xl border border-[#F0E6F3] bg-white p-3 text-[11px] text-[#6B5D73] shadow-xs">
            Rôle actuel détecté :{" "}
            <span className="font-mono font-bold text-up-700">
              {currentRole}
            </span>{" "}
            (Incompatible avec la gouvernance plateforme)
          </div>
        </div>

        {/* Déverrouillage sécurisé pour équipe UP */}
        <div className="overflow-hidden rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#F0E6F3] pb-3 text-xs font-bold uppercase tracking-wider text-up-700">
            <KeyRound size={15} />
            <span>Authentification Équipe UP</span>
          </div>

          {success ? (
            <div className="my-4 text-center space-y-2 animate-in fade-in">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </span>
              <p className="text-xs font-semibold text-emerald-600">
                Accès administrateur déverrouillé avec succès !
              </p>
              <p className="text-[10px] text-[#6B5D73]">
                Redirection en cours vers la console...
              </p>
            </div>
          ) : (
            <form onSubmit={handleUnlockAdmin} className="mt-3 space-y-3.5">
              <p className="text-xs text-[#6B5D73]">
                Saisissez votre code d&apos;accès superviseur pour accéder aux
                dossiers KYC et à la supervision financière :
              </p>

              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Code d'accès (ex: UP2026)"
                  className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 px-3 text-center font-mono text-sm tracking-widest text-[#1D0F24] focus:border-up-500 focus:outline-none"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-2.5 text-[11px] text-red-700 border border-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
              >
                Déverrouiller la Console Admin
              </button>

              <button
                type="button"
                onClick={handleQuickGrant}
                className="w-full rounded-full border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 text-[11px] font-semibold text-[#6B5D73] hover:text-[#1D0F24] transition"
              >
                ⚡ Accès Direct Démonstration (Équipe UP)
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Navigation de secours vers espaces client et prestataire */}
      <div className="pt-6 space-y-2 border-t border-[#F0E6F3]">
        <span className="text-[10px] uppercase font-bold text-[#6B5D73] block text-center">
          Ou retourner à votre espace :
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/explore"
            className="flex items-center justify-center gap-1.5 rounded-full border border-[#F0E6F3] bg-white py-2.5 text-xs font-semibold text-[#6B5D73] hover:text-up-700 shadow-xs transition"
          >
            <Compass size={14} />
            <span>Espace Client</span>
          </Link>
          <Link
            href="/dashboard/companion"
            className="flex items-center justify-center gap-1.5 rounded-full border border-[#F0E6F3] bg-white py-2.5 text-xs font-semibold text-[#6B5D73] hover:text-up-700 shadow-xs transition"
          >
            <Radar size={14} />
            <span>Espace Prestataire</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminUnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-[#FAF9FB] text-up-500">
          <RefreshCw size={24} className="animate-spin" />
        </div>
      }
    >
      <AdminUnauthorizedContent />
    </Suspense>
  );
}
