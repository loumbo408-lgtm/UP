"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Lock,
  MapPin,
  PhoneCall,
  RefreshCw,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useUpStore, type ClientReservation } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { COMPANIONS } from "@/lib/data";

type Step = "select_operator" | "waiting_ussd" | "escrow_confirmed";

export default function ClientPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: reservationId } = use(params);
  const router = useRouter();
  const hydrated = useHydrated();

  const reservations = useUpStore((s) => s.reservations);
  const setReservationEscrowHeld = useUpStore(
    (s) => s.setReservationEscrowHeld,
  );

  // Find reservation in store, or fallback to mock for direct testing
  const reservation: ClientReservation = reservations.find(
    (r) => r.id === reservationId,
  ) || {
    id: reservationId,
    companionId: "awa-n",
    companionName: "Awa N.",
    companionAvatar: COMPANIONS[0].avatar,
    companionZone: "Glass",
    date: "2026-08-31",
    time: "19:30",
    durationHours: 3,
    venueName: "Radisson Blu — Restaurant O'Mbali",
    venueAddress: "Boulevard de la Mer, Batterie IV, Libreville",
    serviceCategory: "diner_affaires",
    serviceLabel: "Dîner d'affaires prestige",
    companionFee: 75000,
    platformFee: 7500,
    totalAmount: 82500,
    status: "demande_envoyee",
    createdAt: new Date().toISOString(),
  };

  // Payment form state
  const [operator, setOperator] = useState<"airtel_money" | "moov_money">(
    "airtel_money",
  );
  const [phoneNumber, setPhoneNumber] = useState("074123456");
  const [step, setStep] = useState<Step>(
    reservation.status === "sequestre_bloque"
      ? "escrow_confirmed"
      : "select_operator",
  );
  const [countdown, setCountdown] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Escrow details upon success
  const [escrowResult, setEscrowResult] = useState<{
    transactionRef: string;
    otpCode: string;
    heldAt: string;
  }>({
    transactionRef: reservation.escrow?.transactionRef || "",
    otpCode: reservation.escrow?.otpCode || "",
    heldAt: reservation.escrow?.heldAt || "",
  });

  // Countdown timer during USSD wait
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "waiting_ussd" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === "waiting_ussd" && countdown === 0) {
      // Countdown reached zero
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleInitiateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/escrow/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: reservation.id,
          companionId: reservation.companionId,
          companionFee: reservation.companionFee,
          platformFeeRate: 0.1,
          paymentOperator: operator,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec de l'envoi de l'invite USSD.");
      }

      setEscrowResult({
        transactionRef: data.transaction.transactionRef,
        otpCode: data.transaction.otpCode,
        heldAt: data.transaction.heldAt,
      });

      setIsProcessing(false);
      setCountdown(60);
      setStep("waiting_ussd");
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMessage(
        err instanceof Error ? err.message : "Erreur de connexion à l'opérateur.",
      );
    }
  };

  const handleConfirmUssdValidation = () => {
    // Save to Zustand
    setReservationEscrowHeld(reservation.id, {
      transactionRef: escrowResult.transactionRef || `UP-ESCROW-${Date.now()}`,
      paymentOperator: operator,
      phoneNumber,
      otpCode: escrowResult.otpCode || "849201",
      heldAt: escrowResult.heldAt || new Date().toISOString(),
    });

    setStep("escrow_confirmed");
  };

  return (
    <div className="min-h-dvh bg-up-black text-up-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-up-black/85 px-5 py-3.5 backdrop-blur-md">
        <Link
          href="/client/reservations"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-up-surface px-3 py-1.5 text-xs font-medium text-up-gray transition hover:border-white/20 hover:text-up-white"
        >
          <ArrowLeft size={15} />
          <span>Réservations</span>
        </Link>

        <span className="flex items-center gap-1 text-xs font-semibold text-up-gold">
          <ShieldCheck size={15} />
          Tiers de Confiance UP
        </span>
      </header>

      <main className="px-5 py-6 pb-20">
        {/* Entête du flux */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-up-gold/40 bg-up-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-up-gold">
            <Lock size={12} />
            Séquestre Garanti Mobile Money
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-up-white">
            Consignation des Fonds
          </h1>
          <p className="mt-1 text-xs text-up-gray">
            Les fonds sont sécurisés jusqu&apos;à la fin de votre rendez-vous.
          </p>
        </div>

        {/* Récapitulatif de la Mission */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-up-surface p-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-up-black">
              <Image
                src={reservation.companionAvatar}
                alt={reservation.companionName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-up-white">
                {reservation.companionName}
              </p>
              <p className="text-xs text-up-gold-soft">
                {reservation.serviceLabel}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-up-gray">
            <p className="flex items-center gap-2 text-up-white">
              <Calendar size={13} className="text-up-gold" />
              <span>
                {reservation.date} à {reservation.time} ({reservation.durationHours}h)
              </span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={13} className="text-up-gold" />
              <span className="truncate">{reservation.venueName}</span>
            </p>
          </div>

          {/* Grille Tarifaire */}
          <div className="mt-3.5 space-y-1.5 border-t border-white/5 pt-3 text-xs">
            <div className="flex justify-between text-up-gray">
              <span>Honoraires prestataire ({reservation.durationHours}h)</span>
              <span className="font-medium text-up-white">
                {reservation.companionFee.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <div className="flex justify-between text-up-gray">
              <span>Frais conciergerie &amp; Séquestre UP (10%)</span>
              <span className="font-medium text-up-white">
                {reservation.platformFee.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-up-white">
              <span className="text-sm">Total à consigner</span>
              <span className="font-display text-base text-up-gold">
                {reservation.totalAmount.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Étape 1 : Choix de l'Opérateur et Saisie du Numéro */}
        {step === "select_operator" && (
          <form
            onSubmit={handleInitiateEscrow}
            className="mt-6 space-y-4 rounded-3xl border border-up-gold/30 bg-gradient-to-b from-up-surface to-up-black p-5 shadow-xl"
          >
            <h2 className="font-display text-base font-bold text-up-white">
              1. Choisissez votre opérateur Mobile Money
            </h2>

            {/* Sélecteur Opérateur */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setOperator("airtel_money");
                  setPhoneNumber("074123456");
                }}
                className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                  operator === "airtel_money"
                    ? "border-red-500/80 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "border-white/10 bg-up-surface/60 opacity-60 hover:opacity-100"
                }`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-red-600 text-white font-bold text-sm shadow">
                  A
                </span>
                <span className="mt-2 text-xs font-bold text-up-white">
                  Airtel Money
                </span>
                <span className="text-[10px] text-up-gray">074 · 076 · 077</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOperator("moov_money");
                  setPhoneNumber("062123456");
                }}
                className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                  operator === "moov_money"
                    ? "border-cyan-500/80 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "border-white/10 bg-up-surface/60 opacity-60 hover:opacity-100"
                }`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-600 text-white font-bold text-sm shadow">
                  M
                </span>
                <span className="mt-2 text-xs font-bold text-up-white">
                  Moov Money
                </span>
                <span className="text-[10px] text-up-gray">062 · 065 · 066</span>
              </button>
            </div>

            {/* Saisie Numéro */}
            <div>
              <label
                htmlFor="mobile-money-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-up-gold"
              >
                Numéro de téléphone ({operator === "airtel_money" ? "Airtel" : "Moov"})
              </label>
              <div className="relative mt-1.5 flex items-center">
                <span className="absolute left-3.5 text-xs font-semibold text-up-gray">
                  +241
                </span>
                <input
                  id="mobile-money-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  placeholder={
                    operator === "airtel_money" ? "074 00 00 00" : "062 00 00 00"
                  }
                  className="w-full rounded-xl border border-white/10 bg-up-surface py-3 pl-14 pr-4 text-xs font-semibold text-up-white focus:border-up-gold focus:outline-none"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-center text-xs text-red-400">
                {errorMessage}
              </p>
            )}

            {/* Bouton de déclenchement USSD */}
            <button
              type="submit"
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-up-gold py-4 text-xs font-bold text-up-black transition hover:bg-up-gold-soft disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Génération du Push USSD...</span>
                </>
              ) : (
                <>
                  <Smartphone size={16} />
                  <span>
                    Consigner {reservation.totalAmount.toLocaleString("fr-FR")} FCFA via USSD
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-up-gray">
              🔒 Séquestre certifié. Aucun débit définitif sans votre confirmation finale.
            </p>
          </form>
        )}

        {/* Étape 2 : Décompte d'attente de validation USSD sur téléphone */}
        {step === "waiting_ussd" && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-up-gold/50 bg-gradient-to-b from-up-surface via-up-surface to-up-black p-6 text-center shadow-2xl animate-in fade-in">
            {/* Onde de transmission radar animée */}
            <div className="relative mx-auto my-4 grid h-24 w-24 place-items-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-up-gold/20 duration-1000" />
              <span className="absolute h-20 w-20 rounded-full border border-up-gold/40 bg-up-gold/10" />
              <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-up-gold text-up-black shadow-[0_0_20px_rgba(212,175,55,0.6)]">
                <Smartphone size={28} />
              </div>
            </div>

            <span className="inline-block rounded-full bg-up-gold/15 px-3 py-1 text-xs font-semibold text-up-gold">
              Push USSD transmis
            </span>

            <h2 className="mt-3 font-display text-xl font-bold text-up-white">
              Validation sur votre téléphone
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-up-gray">
              Une invite sécurisée a été envoyée au{" "}
              <span className="font-bold text-up-white">
                +241 {phoneNumber}
              </span>
              . Saisissez votre code PIN secret {operator === "airtel_money" ? "Airtel Money" : "Moov Money"} pour confirmer.
            </p>

            {/* Décompte temporel */}
            <div className="my-6 flex items-center justify-center gap-2">
              <Clock size={16} className="text-up-gold" />
              <span className="font-display text-2xl font-bold text-up-white">
                00:{countdown < 10 ? `0${countdown}` : countdown}
              </span>
              <span className="text-xs text-up-gray">restantes</span>
            </div>

            {/* Bouton de simulation / validation directe pour fluidité */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleConfirmUssdValidation}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-up-gold py-3 text-xs font-bold text-up-black transition hover:bg-up-gold-soft"
              >
                <CheckCircle2 size={16} />
                <span>Simuler la validation du PIN USSD</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("select_operator")}
                className="w-full rounded-xl border border-white/10 py-2.5 text-xs text-up-gray hover:text-up-white"
              >
                Changer de numéro / Annuler
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : Confirmation du Séquestre Bloqué (Statut 'held') */}
        {step === "escrow_confirmed" && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-up-surface to-up-black p-6 text-center shadow-2xl animate-in zoom-in-95">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <ShieldCheck size={36} />
            </span>

            <span className="mt-4 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              Statut : HELD (Fonds consignés)
            </span>

            <h2 className="mt-2 font-display text-2xl font-bold text-up-white">
              Séquestre Activé avec Succès !
            </h2>

            <p className="mt-2 text-xs text-up-gray">
              Les {reservation.totalAmount.toLocaleString("fr-FR")} FCFA sont
              consignés sur le compte séquestre UP Gabon (Réf :{" "}
              <span className="font-mono text-up-white">
                {escrowResult.transactionRef || reservation.escrow?.transactionRef || "UP-ESCROW-CONFIRMED"}
              </span>
              ).
            </p>

            {/* Code OTP de fin de mission partagé */}
            <div className="my-6 rounded-2xl border border-up-gold/40 bg-gradient-to-br from-up-gold/20 via-up-black to-up-black p-5 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-up-gold">
                Code secret de fin de mission (OTP)
              </p>
              <p className="my-2 font-mono text-3xl font-bold tracking-[0.25em] text-up-white">
                {escrowResult.otpCode || reservation.escrow?.otpCode || "849201"}
              </p>
              <p className="text-[10px] leading-relaxed text-up-gray">
                ⚠️ Transmettez ce code à{" "}
                <span className="font-semibold text-up-white">
                  {reservation.companionName}
                </span>{" "}
                uniquement lorsque la prestation en lieu public sera terminée pour
                débloquer ses honoraires.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/mission/${reservation.id}/active`}
                className="w-full rounded-xl bg-up-gold py-3 text-xs font-bold text-up-black transition hover:bg-up-gold-soft shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-1.5"
              >
                <Compass size={14} />
                <span>Rejoindre le suivi en direct de la mission</span>
              </Link>
              <Link
                href="/client/reservations"
                className="w-full rounded-xl border border-white/10 py-2.5 text-xs text-up-gray hover:text-up-white"
              >
                Voir mes réservations
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
