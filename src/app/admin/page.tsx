"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { createClient } from "@/lib/supabase/client";
import { useUpStore } from "@/lib/store";

export default function AdminPortalPage() {
  const router = useRouter();
  const setRole = useUpStore((s) => s.setRole);

  const [mode, setMode] = useState<"login" | "create" | "emergency">("login");
  const [email, setEmail] = useState("obamstephel20@gmail.com");
  const [password, setPassword] = useState("");
  const [emergencyCode, setEmergencyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const setAdminCookiesAndRedirect = () => {
    document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
    document.cookie = "up_role=admin; path=/; max-age=86400; SameSite=Lax";
    setRole("admin");
    setSuccessMsg("Authentification Super-Admin réussie ! Accès au tableau de bord...");
    setTimeout(() => {
      window.location.href = "/dashboard/admin";
    }, 800);
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

    // Mode Code d'urgence
    if (mode === "emergency") {
      if (
        emergencyCode === "UP2026" ||
        emergencyCode === "up_gabon_admin_secure" ||
        emergencyCode === "admin"
      ) {
        setAdminCookiesAndRedirect();
        setIsLoading(false);
        return;
      } else {
        setErrorMsg("Code de sécurité d'urgence invalide.");
        setIsLoading(false);
        return;
      }
    }

    // Seul l'email officiel administrateur est autorisé
    if (normalizedEmail !== "obamstephel20@gmail.com") {
      setErrorMsg("Cet email n'est pas autorisé pour l'administration de l'application.");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "create") {
        // Création initiale du compte Supabase avec le mot de passe choisi par l'admin
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              full_name: "Super Administrateur UP",
              role: "admin",
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              role: "admin",
              full_name: "Super Administrateur UP",
              kyc_status: "verified",
            });
          } catch {
            // ignore
          }

          setAdminCookiesAndRedirect();
        }
      } else {
        // Connexion standard par mot de passe
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error(
              "Mot de passe incorrect. Si vous n'avez pas encore défini votre mot de passe, cliquez sur 'Créer / Définir MDP'.",
            );
          }
          throw error;
        }

        if (data?.user) {
          setAdminCookiesAndRedirect();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur d'authentification administrateur.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FAF9FB] px-4 py-12 text-[#1D0F24]">
      <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-up-50 text-up-600 border border-up-200 shadow-xs">
            <ShieldCheck size={28} />
          </div>

          <span className="mt-4 inline-block rounded-full bg-up-50 text-up-700 border border-up-200 px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Console de Gouvernance
          </span>

          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
            Administration UP Gabon
          </h1>
          <p className="mt-1 text-xs text-[#6B5D73]">
            Espace d&apos;arbitrage des séquestres, modération KYC et supervision
          </p>
        </div>

        {/* Sélecteur de mode */}
        <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-[#FAF9FB] p-1 border border-[#F0E6F3]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`rounded-xl py-2 text-center text-xs font-bold transition ${
              mode === "login"
                ? "bg-white text-up-700 shadow-xs"
                : "text-[#6B5D73] hover:text-[#1D0F24]"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setErrorMsg(null);
            }}
            className={`rounded-xl py-2 text-center text-xs font-bold transition ${
              mode === "create"
                ? "bg-white text-up-700 shadow-xs"
                : "text-[#6B5D73] hover:text-[#1D0F24]"
            }`}
          >
            Créer MDP
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("emergency");
              setErrorMsg(null);
            }}
            className={`rounded-xl py-2 text-center text-xs font-bold transition ${
              mode === "emergency"
                ? "bg-white text-up-700 shadow-xs"
                : "text-[#6B5D73] hover:text-[#1D0F24]"
            }`}
          >
            Code UP
          </button>
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 animate-in fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-700 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="mt-6 space-y-4">
          {mode === "emergency" ? (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-up-700 mb-1.5">
                Code d&apos;accès de secours UP
              </label>
              <div className="relative flex items-center">
                <KeyRound size={16} className="absolute left-3.5 text-[#6B5D73]" />
                <input
                  type="password"
                  required
                  value={emergencyCode}
                  onChange={(e) => setEmergencyCode(e.target.value)}
                  placeholder="Code de sécurité UP (ex: UP2026)"
                  className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-3 pl-10 pr-3 text-xs text-[#1D0F24] font-mono tracking-widest focus:border-up-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-up-700 mb-1.5">
                  E-mail Administrateur Officiel
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-up-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-up-200 bg-up-50/50 py-3 pl-10 pr-3 text-xs font-semibold text-[#1D0F24] focus:border-up-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-up-700 mb-1.5">
                  {mode === "create" ? "Définir votre mot de passe" : "Mot de passe"}
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-[#6B5D73]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "create"
                        ? "Créez votre mot de passe (min 6 caractères)"
                        : "Votre mot de passe"
                    }
                    className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-3 pl-10 pr-3 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                  />
                </div>
                {mode === "create" && (
                  <p className="mt-1 text-[10px] text-[#6B5D73]">
                    Vous pourrez utiliser ce mot de passe à chaque prochaine connexion.
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-up-500 hover:bg-up-600 text-white font-bold py-3.5 text-xs shadow-md shadow-up-500/20 active:scale-[0.98] transition disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authentification en cours...</span>
            ) : mode === "create" ? (
              <>
                <span>Créer mon compte Admin &amp; Accéder</span>
                <ArrowRight size={14} />
              </>
            ) : (
              <>
                <span>Accéder à la Console Admin</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-[#F0E6F3] pt-4 text-center">
          <Link
            href="/"
            className="text-xs text-[#6B5D73] hover:text-up-700 transition"
          >
            ← Retour à l&apos;accueil du site
          </Link>
        </div>
      </div>
    </div>
  );
}
