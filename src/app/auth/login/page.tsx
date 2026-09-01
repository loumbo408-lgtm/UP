"use client";

import React, { useState, Suspense } from "react";
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
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { createClient } from "@/lib/supabase/client";
import { useUpStore } from "@/lib/store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/explore";

  const setRole = useUpStore((s) => s.setRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Adresse e-mail ou mot de passe incorrect.");
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Fetch role from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const userRole = profile?.role || "client";
        setRole(userRole === "companion" ? "prestataire" : (userRole as any));
        document.cookie = `up_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;

        if (userRole === "admin") {
          document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
          router.push("/dashboard/admin");
        } else if (userRole === "companion") {
          router.push("/dashboard/companion");
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Une erreur inattendue est survenue. Veuillez réessayer.",
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
          Connexion Espace Membre
        </h1>
        <p className="mt-1.5 text-xs text-[#6B5D73]">
          Accédez à vos réservations et missions en toute discrétion
        </p>
      </div>

      {errorMessage && (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 animate-in fade-in">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-[11px] font-semibold uppercase tracking-wider text-up-700"
          >
            Adresse E-mail
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
              <span>Se connecter</span>
              <ArrowRight size={15} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-[#F0E6F3] pt-4 text-center">
        <p className="text-xs text-[#6B5D73]">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-up-600 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
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
