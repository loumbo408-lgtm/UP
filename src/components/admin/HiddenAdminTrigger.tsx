"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useUpStore } from "@/lib/store";

export function HiddenAdminTrigger() {
  const router = useRouter();
  const setRole = useUpStore((s) => s.setRole);

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("OBAMESTEPHEL20@GMAIL.COM");
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, key }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Échec d'authentification administrateur.");
      }

      setSuccess(true);
      setRole("admin");

      setTimeout(() => {
        setIsOpen(false);
        router.push("/dashboard/admin");
      }, 700);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bouton Cradé / Caché : pastille discrète et minimaliste */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-1.5 opacity-25 hover:opacity-100 transition-opacity text-[11px] text-[#6B5D73] hover:text-up-700 py-1 px-2 rounded-lg"
        title="Accès Supervision"
        aria-label="Accès Administration Sécurisé"
      >
        <Lock size={11} className="text-up-500" />
        <span className="text-[10px] font-medium tracking-wide">UP SecOps</span>
      </button>

      {/* Modale d'authentification Administrateur */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 shadow-2xl">
            {/* Bouton Fermer */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-[#6B5D73] hover:bg-gray-100 transition"
            >
              <X size={18} />
            </button>

            {/* Entête */}
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-up-50 text-up-500 border border-up-200">
                <Shield size={22} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-[#1D0F24]">
                  Console Super-Admin UP
                </h3>
                <p className="text-xs text-[#6B5D73]">
                  Contrôle d&apos;accès serveur réservé
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>Session Super-Admin validée. Redirection...</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1D0F24] uppercase tracking-wider">
                  Email Administrateur Officiel
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="mt-1.5 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] px-3.5 py-2.5 text-xs font-semibold text-[#1D0F24] cursor-not-allowed opacity-90"
                />
                <p className="mt-1 text-[10px] text-[#6B5D73]">
                  Identité réservée : OBAMESTEPHEL20@GMAIL.COM
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D0F24] uppercase tracking-wider">
                  Clé de Sécurité / Code PIN
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Code de supervision serveur..."
                  autoFocus
                  required
                  className="mt-1.5 w-full rounded-xl border border-[#F0E6F3] bg-white px-3.5 py-2.5 text-xs text-[#1D0F24] placeholder-[#6B5D73]/60 focus:border-up-500 focus:outline-none transition shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !key.trim()}
                className="mt-2 w-full rounded-full bg-up-500 hover:bg-up-600 text-white font-bold text-xs py-3 shadow-md shadow-up-500/20 active:scale-[0.98] disabled:opacity-40 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Vérification serveur...</span>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Déverrouiller la plateforme</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
