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
    companionAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
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
    <div className="min-h-dvh bg-[#FAF9FB] text-[#1D0F24]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#F0E6F3] bg-white/90 px-5 py-3.5 backdrop-blur-md">
        <Link
          href="/client/reservations"
          className="flex items-center gap-2 rounded-full border border-[#F0E6F3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#6B5D73] transition hover:text-[#1D0F24] shadow-xs"
        >
          <ArrowLeft size={15} />
          <span>Réservations</span>
        </Link>

        <span className="flex items-center gap-1.5 text-xs font-bold text-up-700">
          <ShieldCheck size={16} className="text-up-500" />
          Tiers de Confiance UP
        </span>
      </header>

      <main className="max-w-xl mx-auto px-5 py-6 pb-20">
        {/* Entête du flux */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-up-700">
            <Lock size={12} />
            Séquestre Garanti Mobile Money
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-[#1D0F24]">
            Consignation des Fonds
          </h1>
          <p className="mt-1 text-xs text-[#6B5D73]">
            Les fonds sont sécurisés jusqu&apos;à la fin de votre rendez-vous.
          </p>
        </div>

        {/* Récapitulatif de la Mission */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#F0E6F3] pb-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-up-50 border border-up-200">
              <Image
                src={reservation.companionAvatar}
                alt={reservation.companionName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-[#1D0F24]">
                {reservation.companionName}
              </p>
              <p className="text-xs font-semibold text-up-700">
                {reservation.serviceLabel}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-[#6B5D73]">
            <p className="flex items-center gap-2 text-[#1D0F24]">
              <Calendar size={13} className="text-up-500" />
              <span>
                {reservation.date} à {reservation.time} ({reservation.durationHours}h)
              </span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={13} className="text-up-500" />
              <span className="truncate">{reservation.venueName}</span>
            </p>
          </div>

          {/* Grille Tarifaire */}
          <div className="mt-3.5 space-y-1.5 border-t border-[#F0E6F3] pt-3 text-xs">
            <div className="flex justify-between text-[#6B5D73]">
              <span>Honoraires prestataire ({reservation.durationHours}h)</span>
              <span className="font-semibold text-[#1D0F24]">
                {reservation.companionFee.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <div className="flex justify-between text-[#6B5D73]">
              <span>Frais conciergerie &amp; Séquestre UP (10%)</span>
              <span className="font-semibold text-[#1D0F24]">
                {reservation.platformFee.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <div className="flex justify-between border-t border-[#F0E6F3] pt-2 font-bold text-[#1D0F24]">
              <span className="text-sm">Total à consigner</span>
              <span className="font-display text-base font-bold text-up-700">
                {reservation.totalAmount.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Étape 1 : Choix de l'Opérateur et Saisie du Numéro */}
        {step === "select_operator" && (
          <form
            onSubmit={handleInitiateEscrow}
            className="mt-6 space-y-4 rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs"
          >
            <h2 className="font-display text-base font-bold text-[#1D0F24]">
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
                    ? "border-red-500 bg-red-50 shadow-xs"
                    : "border-[#F0E6F3] bg-[#FAF9FB] hover:border-up-200"
                }`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-red-600 text-white font-bold text-sm shadow">
                  A
                </span>
                <span className="mt-2 text-xs font-bold text-[#1D0F24]">
                  Airtel Money
                </span>
                <span className="text-[10px] text-[#6B5D73]">074 · 076 · 077</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOperator("moov_money");
                  setPhoneNumber("062123456");
                }}
                className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                  operator === "moov_money"
                    ? "border-cyan-500 bg-cyan-50 shadow-xs"
                    : "border-[#F0E6F3] bg-[#FAF9FB] hover:border-up-200"
                }`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-600 text-white font-bold text-sm shadow">
                  M
                </span>
                <span className="mt-2 text-xs font-bold text-[#1D0F24]">
                  Moov Money
                </span>
                <span className="text-[10px] text-[#6B5D73]">062 · 065 · 066</span>
              </button>
            </div>

            {/* Saisie Numéro */}
            <div>
              <label
                htmlFor="mobile-money-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-[#6B5D73]"
              >
                Numéro de téléphone ({operator === "airtel_money" ? "Airtel" : "Moov"})
              </label>
              <div className="relative mt-1.5 flex items-center">
                <span className="absolute left-3.5 text-xs font-semibold text-[#6B5D73]">
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
                  className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] py-3 pl-14 pr-4 text-xs font-semibold text-[#1D0F24] focus:border-up-500 focus:outline-none"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-center text-xs text-red-700">
                {errorMessage}
              </p>
            )}

            {/* Bouton de déclenchement USSD */}
            <button
              type="submit"
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-up-500 hover:bg-up-600 py-3.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition disabled:opacity-50"
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

            <p className="text-center text-[10px] text-[#6B5D73]">
              🔒 Séquestre certifié. Aucun débit définitif sans votre confirmation finale.
            </p>
          </form>
        )}

        {/* Étape 2 : Décompte d'attente de validation USSD sur téléphone */}
        {step === "waiting_ussd" && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[#F0E6F3] bg-white p-6 text-center shadow-xs animate-in fade-in">
            {/* Onde de transmission radar animée */}
            <div className="relative mx-auto my-4 grid h-24 w-24 place-items-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-up-500/20 duration-1000" />
              <span className="absolute h-20 w-20 rounded-full border border-up-200 bg-up-50" />
              <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-up-500 text-white shadow-md shadow-up-500/30">
                <Smartphone size={28} />
              </div>
            </div>

            <span className="inline-block rounded-full bg-up-50 border border-up-200 px-3 py-1 text-xs font-semibold text-up-700">
              Push USSD transmis
            </span>

            <h2 className="mt-3 font-display text-xl font-bold text-[#1D0F24]">
              Validation sur votre téléphone
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-[#6B5D73]">
              Une invite sécurisée a été envoyée au{" "}
              <span className="font-bold text-[#1D0F24]">
                +241 {phoneNumber}
              </span>
              . Saisissez votre code PIN secret {operator === "airtel_money" ? "Airtel Money" : "Moov Money"} pour confirmer.
            </p>

            {/* Décompte temporel */}
            <div className="my-6 flex items-center justify-center gap-2">
              <Clock size={16} className="text-up-500" />
              <span className="font-display text-2xl font-bold text-[#1D0F24]">
                00:{countdown < 10 ? `0${countdown}` : countdown}
              </span>
              <span className="text-xs text-[#6B5D73]">restantes</span>
            </div>

            {/* Bouton de simulation / validation directe pour fluidité */}
            <div className="space-y-2 border-t border-[#F0E6F3] pt-4">
              <button
                type="button"
                onClick={handleConfirmUssdValidation}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
              >
                <CheckCircle2 size={16} />
                <span>Simuler la validation du PIN USSD</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("select_operator")}
                className="w-full rounded-full border border-[#F0E6F3] py-2.5 text-xs font-semibold text-[#6B5D73] hover:text-[#1D0F24] transition"
              >
                Changer de numéro / Annuler
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : Confirmation du Séquestre Bloqué (Statut 'held') */}
        {step === "escrow_confirmed" && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-xs animate-in zoom-in-95">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
              <ShieldCheck size={36} />
            </span>

            <span className="mt-4 inline-block rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              Statut : HELD (Fonds consignés)
            </span>

            <h2 className="mt-2 font-display text-2xl font-bold text-[#1D0F24]">
              Séquestre Activé avec Succès !
            </h2>

            <p className="mt-2 text-xs text-[#6B5D73]">
              Les {reservation.totalAmount.toLocaleString("fr-FR")} FCFA sont
              consignés sur le compte séquestre UP Gabon (Réf :{" "}
              <span className="font-mono text-[#1D0F24] font-bold">
                {escrowResult.transactionRef || reservation.escrow?.transactionRef || "UP-ESCROW-CONFIRMED"}
              </span>
              ).
            </p>

            {/* Code OTP de fin de mission partagé */}
            <div className="my-6 rounded-2xl border border-up-200 bg-up-50 p-5 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-up-700">
                Code secret de fin de mission (OTP)
              </p>
              <p className="my-2 font-mono text-3xl font-bold tracking-[0.25em] text-up-700">
                {escrowResult.otpCode || reservation.escrow?.otpCode || "849201"}
              </p>
              <p className="text-[10px] leading-relaxed text-[#6B5D73]">
                ⚠️ Transmettez ce code à{" "}
                <span className="font-semibold text-[#1D0F24]">
                  {reservation.companionName}
                </span>{" "}
                uniquement lorsque la prestation en lieu public sera terminée pour
                débloquer ses honoraires.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/mission/${reservation.id}/active`}
                className="w-full rounded-full bg-up-500 hover:bg-up-600 py-3.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
              >
                <Compass size={14} />
                <span>Rejoindre le suivi en direct de la mission</span>
              </Link>
              <Link
                href="/client/reservations"
                className="w-full rounded-full border border-[#F0E6F3] py-2.5 text-xs font-semibold text-[#6B5D73] hover:text-[#1D0F24] transition"
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
