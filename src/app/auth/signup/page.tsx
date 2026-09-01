"use client";

import React, { useState, Suspense } from "react";
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
  Compass,
  Sparkles,
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { createClient } from "@/lib/supabase/client";
import { useUpStore } from "@/lib/store";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "companion" || searchParams.get("role") === "prestataire" ? "companion" : "client";

  const setRole = useUpStore((s) => s.setRole);

  const [selectedRole, setSelectedRole] = useState<"client" | "companion">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      const formattedPhone = phone.trim().startsWith("+") ? phone.trim() : `+241${phone.trim()}`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
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
        // Create initial profile in profiles table
        await supabase.from("profiles").upsert({
          id: data.user.id,
          role: selectedRole,
          full_name: fullName.trim(),
          phone: formattedPhone,
          kyc_status: "pending",
        });

        // If companion, create initial companion_details
        if (selectedRole === "companion") {
          await supabase.from("companion_details").upsert({
            companion_id: data.user.id,
            bio: "Nouveau prestataire en attente de vérification KYC.",
            is_online: false,
            hourly_rate_xaf: 25000,
            evening_rate_xaf: 75000,
            zone_preference: "Libreville",
          });
        }

        setRole(selectedRole === "companion" ? "prestataire" : "client");
        document.cookie = `up_role=${selectedRole}; path=/; max-age=86400; SameSite=Lax`;

        setSuccessMessage("Compte créé avec succès ! Redirection en cours...");
        setTimeout(() => {
          if (selectedRole === "companion") {
            router.push("/dashboard/companion");
          } else {
            router.push("/explore");
          }
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Une erreur est survenue lors de l'inscription.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-8 shadow-sm">
      <div className="text-center">
        <div className="inline-block">
          <UpLogo size={44} showText={false} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
          Création de Compte UP
        </h1>
        <p className="mt-1.5 text-xs text-[#6B5D73]">
          Rejoignez la conciergerie privée et d&apos;accompagnement d&apos;élite
        </p>
      </div>

      {/* Role Selection */}
      <div className="mt-6">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-up-700">
          Type de compte
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole("client")}
            className={`flex items-center gap-2 rounded-2xl border p-3 text-left transition ${
              selectedRole === "client"
                ? "border-up-500 bg-up-50 text-[#1D0F24] shadow-xs"
                : "border-[#F0E6F3] bg-[#FAF9FB] text-[#6B5D73] hover:border-up-200 hover:text-[#1D0F24]"
            }`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-xl ${
              selectedRole === "client" ? "bg-up-500 text-white" : "bg-up-100 text-up-700"
            }`}>
              <Compass size={16} />
            </span>
            <div>
              <p className="text-xs font-bold">Client</p>
              <p className="text-[10px] text-[#6B5D73]">Réserver</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("companion")}
            className={`flex items-center gap-2 rounded-2xl border p-3 text-left transition ${
              selectedRole === "companion"
                ? "border-up-500 bg-up-50 text-[#1D0F24] shadow-xs"
                : "border-[#F0E6F3] bg-[#FAF9FB] text-[#6B5D73] hover:border-up-200 hover:text-[#1D0F24]"
            }`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-xl ${
              selectedRole === "companion" ? "bg-up-500 text-white" : "bg-up-100 text-up-700"
            }`}>
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-xs font-bold">Prestataire</p>
              <p className="text-[10px] text-[#6B5D73]">Offrir services</p>
            </div>
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
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
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
              placeholder="Jean Ndong"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 pl-10 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
          >
            Adresse E-mail
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
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
          >
            Numéro Téléphone / Mobile Money
          </label>
          <div className="relative mt-1 flex items-center">
            <Phone size={15} className="absolute left-3.5 text-[#6B5D73]" />
            <span className="absolute left-9 text-xs font-bold text-[#6B5D73]">
              +241
            </span>
            <input
              id="signup-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="074123456"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 pl-18 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
          >
            Mot de passe (6 caractères min.)
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
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 pl-10 pr-3 text-xs text-[#1D0F24] placeholder-[#6B5D73]/50 transition focus:border-up-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-3.5 text-xs font-bold transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Création du compte...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Créer mon compte {selectedRole === "companion" ? "Prestataire" : "Client"}</span>
              <ArrowRight size={15} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-5 border-t border-[#F0E6F3] pt-4 text-center">
        <p className="text-xs text-[#6B5D73]">
          Vous possédez déjà un compte ?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-up-600 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#6B5D73]">
        <ShieldCheck size={13} className="text-emerald-600" />
        <span>Charte éthique et protection des données respectées</span>
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
