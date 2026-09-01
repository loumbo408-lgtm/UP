"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Compass,
  Send,
  RefreshCw,
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { createClient } from "@/lib/supabase/client";
import { useUpStore, type Role } from "@/lib/store";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [selectedRole, setSelectedRole] = useState<"client" | "companion">(
    roleParam === "companion" || roleParam === "prestataire" ? "companion" : "client",
  );

  useEffect(() => {
    if (roleParam === "companion" || roleParam === "prestataire") {
      setSelectedRole("companion");
    } else if (roleParam === "client") {
      setSelectedRole("client");
    }
  }, [roleParam]);

  const setRole = useUpStore((s) => s.setRole);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);

  const handleResendEmail = async () => {
    setResendingEmail(true);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${selectedRole}`,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage("Nouvel e-mail de confirmation envoyé avec succès !");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur lors de l'envoi de l'e-mail.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit comporter au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const formattedPhone = phone.trim()
        ? phone.trim().startsWith("+")
          ? phone.trim()
          : `+241${phone.trim()}`
        : null;

      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${selectedRole}`,
          data: {
            full_name: fullName.trim(),
            role: selectedRole,
            phone: formattedPhone,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        const isAdminEmail = normalizedEmail === "obamstephel20@gmail.com";
        const effectiveUserRole = isAdminEmail ? "admin" : selectedRole;

        // Création du profil en base Supabase
        await supabase.from("profiles").upsert({
          id: data.user.id,
          role: effectiveUserRole,
          full_name: fullName.trim(),
          phone: formattedPhone,
          kyc_status: isAdminEmail ? "verified" : "pending",
        });

        // Si prestataire, initialiser les détails
        if (selectedRole === "companion" && !isAdminEmail) {
          await supabase.from("companion_details").upsert({
            companion_id: data.user.id,
            bio: "Nouveau prestataire en attente de vérification KYC.",
            is_online: false,
            hourly_rate_xaf: 25000,
            evening_rate_xaf: 75000,
            zone_preference: "Libreville",
          });
        }

        // Si l'utilisateur est le Super-Admin
        if (isAdminEmail) {
          setRole("admin");
          document.cookie = "up_role=admin; path=/; max-age=86400; SameSite=Lax";
          document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
          setSuccessMessage("Compte Administrateur validé. Redirection...");
          setTimeout(() => {
            window.location.href = "/dashboard/admin";
          }, 1000);
          return;
        }

        // Si Supabase a validé la session immédiatement (auto-confirm activé)
        if (data.session) {
          if (selectedRole === "companion") {
            setRole("prestataire");
            document.cookie = "up_role=companion; path=/; max-age=86400; SameSite=Lax";
            setSuccessMessage("Compte Prestataire créé ! E-mail de confirmation envoyé. Redirection...");
            setTimeout(() => {
              window.location.href = "/dashboard/companion";
            }, 1200);
          } else {
            setRole("client");
            document.cookie = "up_role=client; path=/; max-age=86400; SameSite=Lax";
            setSuccessMessage("Compte Client créé ! E-mail de confirmation envoyé. Redirection...");
            setTimeout(() => {
              window.location.href = "/client";
            }, 1200);
          }
          return;
        }

        // Supabase attend la confirmation par e-mail : Afficher l'écran dédié
        setIsEmailSent(true);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Une erreur est survenue lors de l'inscription.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Écran d'état : E-mail de confirmation envoyé
  if (isEmailSent) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 shadow-xl text-center animate-in fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-up-50 text-up-600 border border-up-200 shadow-xs">
          <Send size={30} className="text-up-600 animate-pulse" />
        </div>

        <span className="mt-4 inline-block rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          E-mail de confirmation envoyé
        </span>

        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
          Vérifiez votre boîte e-mail
        </h1>

        <p className="mt-2 text-xs text-[#6B5D73] leading-relaxed">
          Un lien de confirmation sécurisé vient d&apos;être envoyé à l&apos;adresse suivante :
        </p>

        <div className="mt-3 rounded-2xl bg-up-50/70 border border-up-200 p-3 text-xs font-bold text-up-800 break-all">
          {email}
        </div>

        <p className="mt-3 text-[11px] text-[#6B5D73] leading-relaxed">
          Cliquez sur le lien dans l&apos;e-mail pour activer définitivement votre compte{" "}
          <strong className="text-[#1D0F24]">
            {selectedRole === "companion" ? "Espace Prestataire" : "Espace Client"}
          </strong>{" "}
          et accéder directement à vos services.
        </p>

        {successMessage && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle2 size={15} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resendingEmail}
            className="w-full flex items-center justify-center gap-2 rounded-full border border-up-200 bg-white hover:bg-up-50 text-up-700 font-bold py-3 text-xs transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={resendingEmail ? "animate-spin" : ""} />
            <span>{resendingEmail ? "Envoi en cours..." : "Renvoyer l'e-mail de confirmation"}</span>
          </button>

          <Link
            href={`/auth/login?role=${selectedRole}&email=${encodeURIComponent(email)}`}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-up-500 hover:bg-up-600 text-white font-bold py-3.5 text-xs shadow-md shadow-up-500/20 active:scale-[0.98] transition"
          >
            <span>Aller à la page de connexion</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-6 border-t border-[#F0E6F3] pt-4 text-[11px] text-[#6B5D73]">
          Vérifiez également votre dossier spams ou courriers indésirables.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 shadow-xl">
      <div className="text-center">
        <div className="inline-block">
          <UpLogo size={44} showText={false} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
          Création de Compte UP
        </h1>
        <p className="mt-1.5 text-xs text-[#6B5D73]">
          Choisissez votre statut et accédez à votre espace dédié
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mt-6">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-up-700 mb-1.5">
          Je m&apos;inscris en tant que :
        </label>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#FAF9FB] p-1 border border-[#F0E6F3]">
          <button
            type="button"
            onClick={() => setSelectedRole("client")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              selectedRole === "client"
                ? "bg-white text-up-700 shadow-xs border border-up-200"
                : "text-[#6B5D73] hover:text-[#1D0F24]"
            }`}
          >
            <Compass size={15} className={selectedRole === "client" ? "text-up-500" : "text-[#6B5D73]"} />
            <span>Client</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("companion")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              selectedRole === "companion"
                ? "bg-white text-up-700 shadow-xs border border-up-200"
                : "text-[#6B5D73] hover:text-[#1D0F24]"
            }`}
          >
            <Sparkles size={15} className={selectedRole === "companion" ? "text-up-500" : "text-[#6B5D73]"} />
            <span>Prestataire Pro</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 animate-in fade-in">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 animate-in fade-in">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="mt-5 space-y-3.5">
        <div>
          <label
            htmlFor="signup-name"
            className="block text-[11px] font-semibold uppercase tracking-wider text-up-700"
          >
            Nom et Prénom
          </label>
          <div className="relative mt-1 flex items-center">
            <User size={15} className="absolute left-3.5 text-[#6B5D73]" />
            <input
              id="signup-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ex: Patrick Mba"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 pl-10 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block text-[11px] font-semibold uppercase tracking-wider text-up-700"
          >
            Adresse E-mail (Confirmation requise)
          </label>
          <div className="relative mt-1 flex items-center">
            <Mail size={15} className="absolute left-3.5 text-[#6B5D73]" />
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@domaine.ga"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 pl-10 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-phone"
            className="block text-[11px] font-semibold uppercase tracking-wider text-up-700"
          >
            Téléphone Mobile Money (Optionnel)
          </label>
          <div className="relative mt-1 flex items-center">
            <Phone size={15} className="absolute left-3.5 text-[#6B5D73]" />
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="074 00 00 00 ou 065 00 00 00"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 pl-10 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-[11px] font-semibold uppercase tracking-wider text-up-700"
          >
            Mot de passe
          </label>
          <div className="relative mt-1 flex items-center">
            <Lock size={15} className="absolute left-3.5 text-[#6B5D73]" />
            <input
              id="signup-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••••• (min 6 caractères)"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 pl-10 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none"
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
              Création du compte...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>
                Créer mon compte {selectedRole === "companion" ? "Prestataire" : "Client"}
              </span>
              <ArrowRight size={15} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-[#F0E6F3] pt-4 text-center">
        <p className="text-xs text-[#6B5D73]">
          Vous avez déjà un compte ?{" "}
          <Link
            href={`/auth/login?role=${selectedRole}`}
            className="font-bold text-up-600 hover:text-up-700 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#6B5D73]">
        <ShieldCheck size={13} className="text-emerald-600" />
        <span>Données protégées · Charte éthique UP Gabon</span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#FAF9FB] px-4 py-12">
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white animate-pulse" />
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
