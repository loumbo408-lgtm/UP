"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Compass,
  RefreshCw,
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { createClient } from "@/lib/supabase/client";
import { useUpStore, type Role } from "@/lib/store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Rôle sélectionné par l'utilisateur ("client" ou "companion" / "prestataire")
  const initialRole =
    searchParams.get("role") === "companion" ||
    searchParams.get("role") === "prestataire"
      ? "companion"
      : "client";

  const isConfirmed = searchParams.get("confirmed") === "true";
  const initialEmail = searchParams.get("email") || "";

  const setRole = useUpStore((s) => s.setRole);

  const [selectedSpace, setSelectedSpace] = useState<"client" | "companion">(initialRole);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    isConfirmed ? "E-mail validé avec succès ! Connectez-vous à votre espace." : null,
  );
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    if (searchParams.get("role") === "companion") {
      setSelectedSpace("companion");
    }
  }, [searchParams]);

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setErrorMessage("Veuillez saisir votre adresse e-mail pour recevoir le lien.");
      return;
    }
    setResendingEmail(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${selectedSpace}`,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage("Un nouvel e-mail de confirmation a été envoyé à votre adresse.");
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Impossible de renvoyer l'e-mail de confirmation.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Identifiant ou mot de passe incorrect.");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMessage(
            "Votre adresse e-mail n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception ou cliquer ci-dessous pour renvoyer le lien.",
          );
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        const userEmail = (data.user.email || "").toLowerCase().trim();
        const isAdminEmail = userEmail === "obamstephel20@gmail.com";

        // Récupération du rôle réel enregistré en base
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const registeredRole = isAdminEmail
          ? "admin"
          : profile?.role || selectedSpace;

        // Cas 1 : Super Administrateur
        if (registeredRole === "admin" || isAdminEmail) {
          setRole("admin");
          document.cookie = "up_role=admin; path=/; max-age=86400; SameSite=Lax";
          document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
          try {
            if (profile?.role !== "admin") {
              await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
            }
          } catch {
            // ignore
          }
          setSuccessMessage("Connexion Administrateur validée. Redirection...");
          setTimeout(() => {
            window.location.href = "/dashboard/admin";
          }, 600);
          return;
        }

        // Cas 2 : Prestataire de services UP
        if (registeredRole === "companion" || registeredRole === "prestataire") {
          setRole("prestataire");
          document.cookie = "up_role=companion; path=/; max-age=86400; SameSite=Lax";

          if (selectedSpace === "client") {
            setInfoMessage(
              "Votre identifiant correspond à un compte Prestataire. Redirection vers votre Espace Prestataire...",
            );
          } else {
            setSuccessMessage("Connexion réussie ! Accès à votre Espace Prestataire...");
          }

          setTimeout(() => {
            window.location.href = "/dashboard/companion";
          }, 700);
          return;
        }

        // Cas 3 : Client UP
        setRole("client");
        document.cookie = "up_role=client; path=/; max-age=86400; SameSite=Lax";

        if (selectedSpace === "companion") {
          setInfoMessage(
            "Votre identifiant correspond à un compte Client. Redirection vers votre Espace Client...",
          );
        } else {
          setSuccessMessage("Connexion réussie ! Accès à votre Espace Client...");
        }

        setTimeout(() => {
          window.location.href = "/client";
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Une erreur inattendue est survenue. Veuillez réessayer.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 shadow-xl">
      <div className="text-center">
        <div className="inline-block">
          <UpLogo size={44} showText={false} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
          Connexion Espace UP
        </h1>
        <p className="mt-1 text-xs text-[#6B5D73]">
          Sélectionnez votre espace pour accéder à votre espace dédié
        </p>
      </div>

      {/* Sélecteur d'espace : Client ou Prestataire */}
      <div className="mt-6">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-up-700 mb-1.5">
          Espace de destination
        </label>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#FAF9FB] p-1 border border-[#F0E6F3]">
          <button
            type="button"
            onClick={() => {
              setSelectedSpace("client");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              selectedSpace === "client"
                ? "bg-white text-up-700 shadow-xs border border-up-200"
                : "text-[#6B5D73] hover:text-[#1D0F24]"
            }`}
          >
            <Compass size={15} className={selectedSpace === "client" ? "text-up-500" : "text-[#6B5D73]"} />
            <span>Espace Client</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedSpace("companion");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              selectedSpace === "companion"
                ? "bg-white text-up-700 shadow-xs border border-up-200"
                : "text-[#6B5D73] hover:text-[#1D0F24]"
            }`}
          >
            <Sparkles size={15} className={selectedSpace === "companion" ? "text-up-500" : "text-[#6B5D73]"} />
            <span>Espace Pro</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {errorMessage.includes("confirmée") && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resendingEmail}
              className="mt-1 inline-flex items-center gap-1.5 self-start text-[11px] font-bold text-up-700 underline underline-offset-2 hover:text-up-900"
            >
              <RefreshCw size={12} className={resendingEmail ? "animate-spin" : ""} />
              <span>{resendingEmail ? "Envoi en cours..." : "Renvoyer l'e-mail de confirmation"}</span>
            </button>
          )}
        </div>
      )}

      {infoMessage && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 animate-in fade-in">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <span>{infoMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-700 animate-in fade-in">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-[11px] font-semibold uppercase tracking-wider text-up-700"
          >
            Identifiant (Adresse E-mail)
          </label>
          <div className="relative mt-1.5 flex items-center">
            <Mail
              size={16}
              className="absolute left-3.5 text-[#6B5D73]"
            />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@domaine.ga"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-3 pl-10 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none focus:ring-1 focus:ring-up-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-[11px] font-semibold uppercase tracking-wider text-up-700"
            >
              Mot de passe
            </label>
          </div>
          <div className="relative mt-1.5 flex items-center">
            <Lock
              size={16}
              className="absolute left-3.5 text-[#6B5D73]"
            />
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-3 pl-10 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none focus:ring-1 focus:ring-up-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-3.5 text-xs font-bold transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Connexion en cours...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>
                {selectedSpace === "companion"
                  ? "Accéder à l'Espace Prestataire"
                  : "Accéder à l'Espace Client"}
              </span>
              <ArrowRight size={15} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-[#F0E6F3] pt-4 text-center space-y-2">
        <p className="text-xs text-[#6B5D73]">
          Pas encore de compte {selectedSpace === "companion" ? "Prestataire" : "Client"} ?{" "}
          <Link
            href={`/auth/signup?role=${selectedSpace}`}
            className="font-bold text-up-600 hover:text-up-700 hover:underline"
          >
            Créer un compte {selectedSpace === "companion" ? "Pro" : "Client"}
          </Link>
        </p>

        <div>
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resendingEmail}
            className="text-[11px] text-[#6B5D73] hover:text-up-700 underline"
          >
            Renvoyer l&apos;e-mail de confirmation
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#6B5D73]">
        <ShieldCheck size={13} className="text-emerald-600" />
        <span>Connexion sécurisée SSL 256-bit · UP Gabon</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#FAF9FB] px-4 py-12">
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white animate-pulse" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
