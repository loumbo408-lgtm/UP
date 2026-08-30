"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  LogOut,
  MapPin,
  MessageSquare,
  Power,
  Radar,
  Radio,
  RefreshCw,
  Repeat,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { PersonaShell } from "@/components/persona-shell";
import { prestataireNav } from "@/lib/nav";
import { useUpStore, type RadarDemand } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { SECURE_PUBLIC_VENUES } from "@/lib/data";

export default function CompanionDashboardPage() {
  const hydrated = useHydrated();

  const available = useUpStore((s) => s.available);
  const setAvailable = useUpStore((s) => s.setAvailable);
  const balance = useUpStore((s) => s.prestataireBalance);
  const gains = useUpStore((s) => s.prestataireGains);
  const radarDemands = useUpStore((s) => s.radarDemands);
  const acceptRadarDemand = useUpStore((s) => s.acceptRadarDemand);
  const declineRadarDemand = useUpStore((s) => s.declineRadarDemand);
  const withdrawEarnings = useUpStore((s) => s.withdrawEarnings);
  const clearRole = useUpStore((s) => s.clearRole);

  const isOnline = hydrated && available;

  // Real Supabase profile state
  const [profileName, setProfileName] = useState<string>("Prestataire UP");
  const [profileAvatar, setProfileAvatar] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  );
  const [profileZone, setProfileZone] = useState<string>("Libreville");

  useEffect(() => {
    async function loadCompanionData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*, companion_details(*)")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            setProfileName(profile.full_name || user.user_metadata?.full_name || "Prestataire UP");
            if (profile.avatar_url) {
              setProfileAvatar(profile.avatar_url);
            }
            const details = Array.isArray(profile.companion_details)
              ? profile.companion_details[0]
              : profile.companion_details;
            if (details?.zone_preference) {
              setProfileZone(details.zone_preference);
            }
          }
        }
      } catch {
        // ignore
      }
    }
    loadCompanionData();
  }, []);

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [operator, setOperator] = useState<"airtel_money" | "moov_money">(
    "airtel_money",
  );
  const [withdrawPhone, setWithdrawPhone] = useState("074123456");
  const [withdrawAmount, setWithdrawAmount] = useState("50000");
  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(
    null,
  );

  // Accept notification modal
  const [acceptedDemand, setAcceptedDemand] = useState<RadarDemand | null>(null);

  // OTP release modal for companion
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpProcessing, setOtpProcessing] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpErrorMsg, setOtpErrorMsg] = useState<string | null>(null);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(withdrawAmount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > balance) {
      return;
    }

    setIsWithdrawProcessing(true);

    setTimeout(() => {
      withdrawEarnings(parsedAmount, operator, withdrawPhone);
      setIsWithdrawProcessing(false);
      setWithdrawSuccessMsg(
        `Virement de ${parsedAmount.toLocaleString("fr-FR")} FCFA validé vers votre compte ${operator === "airtel_money" ? "Airtel Money" : "Moov Money"} (+241 ${withdrawPhone}).`,
      );
    }, 700);
  };

  const handleAccept = (demand: RadarDemand) => {
    acceptRadarDemand(demand.id);
    setAcceptedDemand(demand);
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpErrorMsg(null);
    setOtpProcessing(true);

    try {
      const response = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: "mission-live-test",
          otpCode: enteredOtp.trim(),
          clientConfirmed: true,
          companionConfirmed: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Code OTP invalide.");
      }

      setOtpProcessing(false);
      setOtpSuccessMsg(
        `Félicitations ! Les ${data.payout.amountReleasedXaf.toLocaleString("fr-FR")} FCFA ont été crédités sur votre solde disponible.`,
      );
    } catch (err: unknown) {
      setOtpProcessing(false);
      setOtpErrorMsg(
        err instanceof Error ? err.message : "Erreur lors de la validation du code OTP.",
      );
    }
  };

  return (
    <PersonaShell items={prestataireNav}>
      <div className="min-h-dvh bg-up-black text-up-white pb-10">
        {/* 1. En-tête avec profil et interrupteur lumineux */}
        <header className="border-b border-white/5 bg-up-surface/90 px-5 pt-6 pb-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <Link
              href="/prestataire/profil"
              className="flex items-center gap-3 group"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-up-gold/40 transition group-hover:border-up-gold">
                <Image
                  src={profileAvatar}
                  alt={profileName}
                  fill
                  className="object-cover object-top"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-up-surface bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display text-base font-bold text-up-white group-hover:text-up-gold transition">
                    {profileName}
                  </h1>
                  <BadgeCheck size={16} className="text-up-gold" />
                </div>
                <div className="flex items-center gap-2 text-xs text-up-gray">
                  <span className="flex items-center gap-0.5 text-up-gold">
                    <Star size={12} className="fill-up-gold" />
                    5.0
                  </span>
                  <span>·</span>
                  <span>Libreville · {profileZone}</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/prestataire/profil"
                className="flex items-center gap-1.5 rounded-xl border border-up-gold/30 bg-up-gold/10 px-3 py-1.5 text-xs font-semibold text-up-gold transition hover:bg-up-gold/20"
              >
                <span>Tarifs &amp; Profil</span>
              </Link>
              <Link
                href="/"
                onClick={() => clearRole()}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-up-gray hover:text-up-white"
              >
                <Repeat size={13} className="text-up-gold" />
                <span>Rôle</span>
              </Link>
            </div>
          </div>

          {/* Interrupteur lumineux DISPONIBLE CE SOIR / HORS LIGNE */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`group flex w-full items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                isOnline
                  ? "border-up-gold/60 bg-gradient-to-r from-up-gold/20 via-up-surface to-up-surface shadow-[0_0_25px_rgba(212,175,55,0.25)]"
                  : "border-white/10 bg-up-surface/60 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-3.5 text-left">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl transition ${
                    isOnline
                      ? "bg-up-gold text-up-black shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                      : "bg-white/5 text-up-gray"
                  }`}
                >
                  <Power size={20} className={isOnline ? "animate-pulse" : ""} />
                </div>
                <div>
                  <span
                    className={`block text-xs font-bold uppercase tracking-wider ${
                      isOnline ? "text-up-gold" : "text-up-gray"
                    }`}
                  >
                    {isOnline ? "● DISPONIBLE CE SOIR (EN LIGNE)" : "○ HORS LIGNE"}
                  </span>
                  <span className="block text-[11px] text-up-gray">
                    {isOnline
                      ? "Vous apparaissez en priorité sur le radar client"
                      : "Activez pour recevoir des demandes ce soir"}
                  </span>
                </div>
              </div>

              {/* Bouton switch physique stylisé */}
              <span
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
                  isOnline ? "bg-up-gold" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-up-black transition-all duration-300 shadow-md ${
                    isOnline ? "left-[1.375rem]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </header>

        <main className="px-5 py-5 space-y-6">
          {/* 2. Section Financière */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                <Wallet size={14} />
                Espace Financier
              </span>
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-up-gold/30 bg-up-gold/10 px-2.5 py-1 text-[11px] font-semibold text-up-gold hover:bg-up-gold/20"
              >
                <CheckCircle2 size={12} />
                <span>Saisir code OTP client</span>
              </button>
            </div>

            {/* Carte de Solde Disponible */}
            <div className="overflow-hidden rounded-3xl border border-up-gold/40 bg-gradient-to-br from-up-gold/25 via-up-surface to-up-surface p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-up-gold-soft">
                  Solde disponible
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck size={11} />
                  Séquestre garanti UP
                </span>
              </div>

              <p className="mt-2 font-display text-4xl font-bold tracking-tight text-up-white">
                {hydrated ? balance.toLocaleString("fr-FR") : "125 000"}{" "}
                <span className="text-base font-normal text-up-gray">FCFA</span>
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsWithdrawModalOpen(true);
                    setWithdrawSuccessMsg(null);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-up-gold px-4 py-3 text-xs font-bold text-up-black transition hover:bg-up-gold-soft shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  <ArrowUpRight size={16} />
                  <span>Demander un virement Mobile Money</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-[11px] text-up-gray">
                <div>
                  <span>Missions ce mois :</span>{" "}
                  <span className="font-semibold text-up-white">6 honorées</span>
                </div>
                <div className="text-right">
                  <span>Délai virement :</span>{" "}
                  <span className="font-semibold text-emerald-400">Instantané</span>
                </div>
              </div>
            </div>

            {/* Historique des missions rémunérées */}
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-up-gray">
                Historique des versements
              </p>
              {gains.slice(0, 3).map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-up-surface p-3.5 text-xs"
                >
                  <div>
                    <p className="font-medium text-up-white">{g.label}</p>
                    <p className="text-[10px] text-up-gray">{g.date}</p>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      g.montant.startsWith("+") ? "text-up-gold" : "text-up-gray"
                    }`}
                  >
                    {g.montant} FCFA
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Radar des Demandes Entrantes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                <Radar size={14} className={isOnline ? "animate-spin" : ""} />
                Radar des Demandes Entrantes
              </span>
              <span className="rounded-full bg-up-gold/15 px-2.5 py-0.5 text-[10px] font-bold text-up-gold">
                {radarDemands.filter((d) => d.status === "pending").length}{" "}
                nouvelles
              </span>
            </div>

            {/* Liste des cartes de demandes */}
            <div className="space-y-3.5">
              {!hydrated ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-up-surface p-4 animate-pulse space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-white/10 rounded-lg" />
                      <div className="h-4 w-20 bg-up-gold/20 rounded-lg" />
                    </div>
                    <div className="h-3 w-48 bg-white/5 rounded-lg" />
                    <div className="h-8 w-full bg-white/5 rounded-xl" />
                  </div>
                </div>
              ) : (
                radarDemands.map((demand) => {
                const isAccepted = demand.status === "accepted";
                const isDeclined = demand.status === "declined";

                if (isDeclined) return null;

                return (
                  <article
                    key={demand.id}
                    className={`overflow-hidden rounded-3xl border p-4 transition-all duration-300 ${
                      isAccepted
                        ? "border-emerald-500/50 bg-gradient-to-b from-emerald-950/25 to-up-surface"
                        : "border-up-gold/35 bg-up-surface shadow-xl hover:border-up-gold/60"
                    }`}
                  >
                    {/* Header de la demande */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-up-white text-sm">
                            {demand.clientName}
                          </span>
                          {demand.clientVerified && (
                            <BadgeCheck size={15} className="text-up-gold" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-up-gold-soft">
                          {demand.service}
                        </p>
                      </div>

                      {/* Montant Net à gagner */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-up-gray block">
                          Net à gagner
                        </span>
                        <span className="font-display text-base font-bold text-up-gold">
                          {demand.netEarnings.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Détails de la mission */}
                    <div className="mt-3 space-y-1.5 text-xs text-up-gray">
                      <p className="flex items-center gap-2 text-up-white">
                        <Clock size={13} className="text-up-gold" />
                        <span>
                          {demand.date} à {demand.time} ({demand.durationHours}h)
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={13} className="text-up-gold" />
                        <span>
                          {demand.venueName} ·{" "}
                          <span className="text-up-gray">{demand.venueZone}</span>
                        </span>
                      </p>
                      {demand.notes && (
                        <p className="rounded-xl bg-white/5 p-2.5 text-[11px] italic text-up-gray border border-white/5">
                          &laquo; {demand.notes} &raquo;
                        </p>
                      )}
                    </div>

                    {/* Boutons d'Action */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      {isAccepted ? (
                        <div className="flex flex-col gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-400">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <CheckCircle2 size={15} />
                            Mission acceptée ! Client notifié du séquestre.
                          </span>
                          <div className="flex gap-2 mt-1">
                            <Link
                              href={`/mission/${demand.id}/active`}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-up-gold py-2 text-xs font-bold text-up-black hover:bg-up-gold-soft"
                            >
                              <Compass size={13} />
                              <span>Suivre la mission en direct</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setIsOtpModalOpen(true)}
                              className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-up-black hover:bg-emerald-400"
                            >
                              Fin / OTP
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccept(demand)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black transition hover:bg-up-gold-soft shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                          >
                            <Check size={14} />
                            <span>Accepter la mission</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => declineRadarDemand(demand.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-xs font-medium text-up-gray hover:text-up-white hover:border-white/20"
                          >
                            <X size={14} />
                            <span>Décliner</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
            </div>
          </section>
        </main>

        {/* Modal de Demande de Virement Mobile Money */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl border border-up-gold/50 bg-up-surface p-6 text-center shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                  <Wallet size={16} />
                  Virement Mobile Money
                </span>
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="text-up-gray hover:text-up-white"
                >
                  <X size={18} />
                </button>
              </div>

              {withdrawSuccessMsg ? (
                <div className="my-5 text-center space-y-3">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={30} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-up-white">
                    Virement Effectué !
                  </h3>
                  <p className="text-xs text-up-gray">{withdrawSuccessMsg}</p>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="mt-4 w-full rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleWithdrawSubmit}
                  className="mt-4 space-y-4 text-left"
                >
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-up-gold">
                      Opérateur de destination
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOperator("airtel_money");
                          setWithdrawPhone("074123456");
                        }}
                        className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                          operator === "airtel_money"
                            ? "border-red-500 bg-red-950/40 text-up-white"
                            : "border-white/10 bg-up-black/40 text-up-gray"
                        }`}
                      >
                        Airtel Money (074/076/077)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOperator("moov_money");
                          setWithdrawPhone("062123456");
                        }}
                        className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                          operator === "moov_money"
                            ? "border-cyan-500 bg-cyan-950/40 text-up-white"
                            : "border-white/10 bg-up-black/40 text-up-gray"
                        }`}
                      >
                        Moov Money (062/065/066)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="companion-withdraw-phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-up-gray"
                    >
                      Numéro Mobile Money
                    </label>
                    <div className="relative mt-1 flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-up-gray">
                        +241
                      </span>
                      <input
                        id="companion-withdraw-phone"
                        type="tel"
                        value={withdrawPhone}
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/10 bg-up-black/60 py-2.5 pl-14 pr-3 text-xs text-up-white focus:border-up-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="companion-withdraw-amount"
                      className="block text-xs font-semibold uppercase tracking-wider text-up-gray"
                    >
                      Montant du virement (FCFA)
                    </label>
                    <input
                      id="companion-withdraw-amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={balance}
                      min={1000}
                      required
                      className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/60 p-2.5 text-xs font-bold text-up-white focus:border-up-gold focus:outline-none"
                    />
                    <span className="text-[10px] text-up-gray mt-1 block">
                      Solde max : {balance.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-medium text-up-gray hover:text-up-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isWithdrawProcessing ||
                        parseInt(withdrawAmount, 10) > balance
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-up-gold py-3 text-xs font-bold text-up-black hover:bg-up-gold-soft disabled:opacity-50"
                    >
                      {isWithdrawProcessing ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                      <span>Transférer</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal de Saisie OTP de fin de mission */}
        {isOtpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl border border-up-gold/50 bg-up-surface p-6 text-center shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                  <ShieldCheck size={16} />
                  Validation des Honoraires
                </span>
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="text-up-gray hover:text-up-white"
                >
                  <X size={18} />
                </button>
              </div>

              {otpSuccessMsg ? (
                <div className="my-5 text-center space-y-3">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={30} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-up-white">
                    Honoraires Débloqués !
                  </h3>
                  <p className="text-xs text-up-gray">{otpSuccessMsg}</p>
                  <button
                    type="button"
                    onClick={() => setIsOtpModalOpen(false)}
                    className="mt-4 w-full rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleOtpVerification}
                  className="mt-4 space-y-4 text-left"
                >
                  <p className="text-xs text-up-gray">
                    Saisissez le code OTP à 4 chiffres que le client vous a
                    communiqué à la fin de votre prestation pour débloquer
                    instantanément vos honoraires.
                  </p>

                  <div>
                    <label
                      htmlFor="companion-otp-input"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-up-gold"
                    >
                      Code OTP (4 chiffres)
                    </label>
                    <input
                      id="companion-otp-input"
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="4829"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-up-black/60 py-3 text-center font-mono text-xl font-bold tracking-[0.25em] text-up-white focus:border-up-gold focus:outline-none"
                    />
                  </div>

                  {otpErrorMsg && (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                      {otpErrorMsg}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(false)}
                      className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-medium text-up-gray hover:text-up-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={otpProcessing || (enteredOtp.length !== 4 && enteredOtp.length !== 6)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-up-black hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {otpProcessing ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      <span>Débloquer fonds</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </PersonaShell>
  );
}
