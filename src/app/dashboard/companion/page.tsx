"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  KeyRound,
  MapPin,
  Radio,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useUpStore, type RadarDemand } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

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

  const isOnline = hydrated && available;

  // Real Supabase profile state
  const [profileName, setProfileName] = useState<string>("Prestataire UP");
  const [profileZone, setProfileZone] = useState<string>("Libreville");
  const [profileHourlyRate, setProfileHourlyRate] = useState<number>(25000);

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
            setProfileName(
              profile.full_name || user.user_metadata?.full_name || "Prestataire UP",
            );
            const details = Array.isArray(profile.companion_details)
              ? profile.companion_details[0]
              : profile.companion_details;
            if (details?.zone_preference) {
              setProfileZone(details.zone_preference);
            }
            if (details?.hourly_rate_xaf) {
              setProfileHourlyRate(details.hourly_rate_xaf);
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
  const [operator, setOperator] = useState<"airtel_money" | "moov_money">("airtel_money");
  const [withdrawPhone, setWithdrawPhone] = useState("074123456");
  const [withdrawAmount, setWithdrawAmount] = useState("50000");
  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // Accept notification modal
  const [acceptedDemand, setAcceptedDemand] = useState<RadarDemand | null>(null);

  // OTP release modal for companion
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
        `Virement de ${parsedAmount.toLocaleString("fr-FR")} FCFA validé vers votre compte ${
          operator === "airtel_money" ? "Airtel Money" : "Moov Money"
        } (+241 ${withdrawPhone}).`,
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
        `Félicitations ! Les ${data.payout.amountReleasedXaf.toLocaleString(
          "fr-FR",
        )} FCFA ont été crédités sur votre solde disponible.`,
      );
    } catch (err: unknown) {
      setOtpProcessing(false);
      setOtpErrorMsg(
        err instanceof Error ? err.message : "Erreur lors de la validation du code OTP.",
      );
    }
  };

  // Colonne latérale de widgets
  const rightSidebarContent = (
    <div className="space-y-6">
      {/* 1. Interrupteur de Disponibilité Directe */}
      <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
        <h3 className="font-display text-sm font-bold text-[#1D0F24]">
          Statut de Présence
        </h3>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setAvailable(!available)}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
              isOnline
                ? "border-emerald-500 bg-emerald-50/60 shadow-xs"
                : "border-[#F0E6F3] bg-[#FAF9FB] opacity-85"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                  isOnline
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-up-50 text-[#6B5D73]"
                }`}
              >
                <Radio size={20} className={isOnline ? "animate-pulse" : ""} />
              </div>
              <div>
                <p className="font-display text-xs font-bold text-[#1D0F24]">
                  {isOnline ? "DISPONIBLE EN DIRECT" : "EN PAUSE (HORS LIGNE)"}
                </p>
                <p className="text-[10px] text-[#6B5D73]">
                  {isOnline
                    ? "Visible sur le radar client de Libreville"
                    : "Aucune notification radar reçue"}
                </p>
              </div>
            </div>

            <div
              className={`h-6 w-11 rounded-full transition-colors p-0.5 ${
                isOnline ? "bg-emerald-500" : "bg-up-200"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  isOnline ? "translate-x-5 shadow-xs" : "translate-x-0"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 2. Statut d'Agrément & KYC Officiel */}
      <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-[#1D0F24]">
            Agrément Professionnel
          </h3>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-0.5 text-[10px] font-bold">
            <BadgeCheck size={12} />
            KYC Vérifié
          </span>
        </div>

        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-[#FAF9FB] p-2.5 border border-[#F0E6F3]">
            <span className="text-[#6B5D73]">Zone d&apos;activité</span>
            <span className="font-bold text-[#1D0F24]">{profileZone}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#FAF9FB] p-2.5 border border-[#F0E6F3]">
            <span className="text-[#6B5D73]">Tarif horaire de base</span>
            <span className="font-bold text-up-700">
              {profileHourlyRate.toLocaleString("fr-FR")} FCFA/h
            </span>
          </div>
        </div>

        <Link
          href="/prestataire/profil"
          className="mt-4 block w-full rounded-full border border-up-200 py-2.5 text-center text-xs font-bold text-[#1D0F24] transition hover:border-up-500 hover:text-up-700"
        >
          Modifier mes tarifs et services
        </Link>
      </div>

      {/* 3. Guide Déontologique & Lieux Publics */}
      <div className="rounded-3xl border border-up-200 bg-up-50/70 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-up-700">
          <ShieldCheck size={20} />
          <h3 className="font-display text-sm font-bold text-[#1D0F24]">
            Charte du Prestataire UP
          </h3>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#6B5D73]">
          Les prestations doivent s&apos;effectuer exclusivement dans les établissements publics certifiés de Libreville. Aucun lieu privé ou isolé n&apos;est toléré.
        </p>
        <Link
          href="/#safety"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-up-700 hover:underline"
        >
          <span>Consulter les règles complètes</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );

  return (
    <DashboardShell
      role="prestataire"
      pageTitle={`Espace Prestataire · ${profileName.split(" ")[0]}`}
      pageSubtitle="Gérez vos demandes de présence en direct, missions et revenus au Gabon."
      actionButton={{
        label: "Clôturer avec code OTP",
        href: "#otp",
        icon: KeyRound,
      }}
      rightSidebar={rightSidebarContent}
    >
      {/* ===================================================================
          1. SECTION REVENUS & SOLDE MOBILE MONEY (VIOLET ROYAL & BLANC)
          =================================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Carte Solde Disponible */}
        <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5D73]">
              Solde Disponible
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-50 text-up-600">
              <Wallet size={20} />
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#1D0F24]">
              {balance.toLocaleString("fr-FR")}
            </span>
            <span className="font-semibold text-xs text-[#6B5D73]">FCFA</span>
          </div>

          <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
            <CheckCircle2 size={12} />
            <span>Séquestres libérés prêts pour virement</span>
          </p>

          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="mt-5 w-full rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-3 text-xs font-bold transition"
          >
            Retirer vers Airtel / Moov Money
          </button>
        </div>

        {/* Carte Derniers Gains & Historique */}
        <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B5D73]">
                Dernières Missions Validées
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-50 text-up-700">
                <Calendar size={18} />
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {gains.slice(0, 2).map((gain) => (
                <div
                  key={gain.id}
                  className="flex items-center justify-between rounded-xl bg-[#FAF9FB] p-2.5 text-xs border border-[#F0E6F3]"
                >
                  <div>
                    <p className="font-bold text-[#1D0F24]">{gain.label}</p>
                    <p className="text-[10px] text-[#6B5D73]">{gain.date}</p>
                  </div>
                  <span className="font-bold text-emerald-600">{gain.montant}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/prestataire/gains"
            className="mt-4 flex items-center justify-between text-xs font-bold text-up-700 hover:underline pt-2 border-t border-[#F0E6F3]"
          >
            <span>Consulter l&apos;historique complet des gains</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ===================================================================
          2. SECTION RADAR DES DEMANDES EN DIRECT
          =================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#1D0F24] flex items-center gap-2">
              <Radio size={20} className="text-up-500" />
              <span>Demandes d&apos;Accompagnement en Direct</span>
            </h2>
            <p className="text-xs text-[#6B5D73]">
              Notifications de réservations transmises par les clients vérifiés à Libreville
            </p>
          </div>

          <span className="rounded-full bg-up-50 text-up-700 border border-up-200 px-3 py-1 text-xs font-bold">
            {radarDemands.length} en attente
          </span>
        </div>

        {radarDemands.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {radarDemands.map((demand) => (
              <div
                key={demand.id}
                className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-4 hover:border-up-300 transition"
              >
                <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#1D0F24]">
                      {demand.clientName}
                    </span>
                    {demand.clientVerified && (
                      <BadgeCheck size={14} className="text-emerald-500" />
                    )}
                  </div>
                  <span className="font-bold text-sm text-up-700">
                    +{demand.netEarnings.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#6B5D73]">
                  <p className="flex items-center gap-2 text-[#1D0F24] font-semibold">
                    <Clock size={13} className="text-up-500" />
                    <span>{demand.date} · {demand.time} ({demand.durationHours}h)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 size={13} className="text-up-500" />
                    <span className="truncate">{demand.venueName}</span>
                  </p>
                  <p className="flex items-center gap-2 text-[11px]">
                    <MapPin size={13} className="text-[#6B5D73]" />
                    <span>{demand.venueZone}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(demand)}
                    className="flex-1 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-2.5 text-xs font-bold transition"
                  >
                    Accepter la mission
                  </button>
                  <button
                    type="button"
                    onClick={() => declineRadarDemand(demand.id)}
                    className="rounded-full border border-up-200 px-4 py-2.5 text-xs font-semibold text-[#6B5D73] hover:text-red-600 hover:border-red-200"
                  >
                    Décliner
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-up-50 text-up-600">
              <Radio size={24} />
            </span>
            <h4 className="mt-3 font-display text-base font-bold text-[#1D0F24]">
              Radar actif en veille
            </h4>
            <p className="mt-1 text-xs text-[#6B5D73] max-w-sm mx-auto">
              Gardez votre statut en ligne activé. Dès qu&apos;un client sélectionne votre profil pour un dîner d&apos;affaires ou événement, la notification apparaîtra ici.
            </p>
          </div>
        )}
      </section>

      {/* ===================================================================
          3. VALIDATION DE FIN DE MISSION AVEC CODE OTP
          =================================================================== */}
      <section id="otp" className="rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#F0E6F3] pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-50 text-up-600">
            <KeyRound size={20} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#1D0F24]">
              Clôturer une Mission &amp; Débloquer le Séquestre
            </h3>
            <p className="text-xs text-[#6B5D73]">
              Saisissez le code OTP à 6 chiffres communiqué par le client à la fin de la rencontre
            </p>
          </div>
        </div>

        <form onSubmit={handleOtpVerification} className="mt-6 space-y-4 max-w-md">
          {otpSuccessMsg && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
              {otpSuccessMsg}
            </div>
          )}
          {otpErrorMsg && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-700">
              {otpErrorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1D0F24] mb-1.5">
              Code OTP de libération (fourni par le client)
            </label>
            <input
              type="text"
              maxLength={6}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              placeholder="ex: 482910"
              required
              className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-center font-mono text-base font-bold tracking-widest text-[#1D0F24] focus:border-up-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={otpProcessing || enteredOtp.length < 6}
            className="w-full rounded-full bg-up-500 hover:bg-up-600 py-3.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition disabled:opacity-50"
          >
            {otpProcessing ? "Validation en cours..." : "Valider la fin de mission & Débloquer les fonds"}
          </button>
        </form>
      </section>

      {/* Modal de Retrait Mobile Money */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-4">
              <h3 className="font-display text-lg font-bold text-[#1D0F24]">
                Retrait Mobile Money
              </h3>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-[#6B5D73] hover:text-[#1D0F24]"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawSuccessMsg ? (
              <div className="mt-6 text-center space-y-4">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={32} />
                </span>
                <p className="text-xs font-semibold text-[#1D0F24]">
                  {withdrawSuccessMsg}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsWithdrawModalOpen(false);
                    setWithdrawSuccessMsg(null);
                  }}
                  className="w-full rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-xs"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1D0F24] mb-1.5">
                    Opérateur
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOperator("airtel_money")}
                      className={`rounded-xl border py-2.5 font-bold transition ${
                        operator === "airtel_money"
                          ? "border-up-500 bg-up-50 text-up-700"
                          : "border-[#F0E6F3] text-[#6B5D73]"
                      }`}
                    >
                      Airtel Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperator("moov_money")}
                      className={`rounded-xl border py-2.5 font-bold transition ${
                        operator === "moov_money"
                          ? "border-up-500 bg-up-50 text-up-700"
                          : "border-[#F0E6F3] text-[#6B5D73]"
                      }`}
                    >
                      Moov Money
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1D0F24] mb-1.5">
                    Numéro Gabon (+241)
                  </label>
                  <input
                    type="tel"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] font-bold focus:border-up-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1D0F24] mb-1.5">
                    Montant à retirer (FCFA)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={balance}
                    min={1000}
                    required
                    className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] font-bold focus:border-up-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-[#6B5D73]">
                    Solde maximum retirable : {balance.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isWithdrawProcessing || balance <= 0}
                  className="w-full rounded-full bg-up-500 hover:bg-up-600 py-3.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition disabled:opacity-50"
                >
                  {isWithdrawProcessing ? "Traitement du virement..." : "Confirmer le virement"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Acceptation de mission */}
      {acceptedDemand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={30} />
            </span>
            <h3 className="font-display text-lg font-bold text-[#1D0F24]">
              Mission Acceptée avec Succès !
            </h3>
            <p className="text-xs text-[#6B5D73] leading-relaxed">
              Vous avez accepté la demande de <strong>{acceptedDemand.clientName}</strong> pour le <strong>{acceptedDemand.date}</strong> à <strong>{acceptedDemand.time}</strong> au <strong>{acceptedDemand.venueName}</strong>.
            </p>
            <p className="rounded-xl bg-up-50 p-3 text-[11px] text-up-700 font-semibold border border-up-200">
              Gain net garanti sous séquestre : {acceptedDemand.netEarnings.toLocaleString("fr-FR")} FCFA
            </p>
            <button
              type="button"
              onClick={() => setAcceptedDemand(null)}
              className="w-full rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-xs transition"
            >
              Compris, j&apos;y serai
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
