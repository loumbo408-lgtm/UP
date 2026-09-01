"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useUpStore, type ClientReservation } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function ReservationsPage() {
  const hydrated = useHydrated();
  const reservations = useUpStore((s) => s.reservations);
  const cancelReservation = useUpStore((s) => s.cancelReservation);
  const completeMissionWithOtp = useUpStore((s) => s.completeMissionWithOtp);

  // Release OTP modal state
  const [selectedResForRelease, setSelectedResForRelease] =
    useState<ClientReservation | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null);

  const hasReservations = hydrated && reservations.length > 0;

  const handleReleaseEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResForRelease) return;

    setReleaseError(null);
    setIsReleasing(true);

    try {
      const response = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: selectedResForRelease.id,
          transactionRef: selectedResForRelease.escrow?.transactionRef,
          otpCode: enteredOtp.trim(),
          clientConfirmed: true,
          companionConfirmed: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Code OTP invalide ou échec de libération.",
        );
      }

      completeMissionWithOtp(
        selectedResForRelease.id,
        data.payout.payoutRef,
        data.payout.amountReleasedXaf,
      );

      setReleaseSuccess(
        `Mission clôturée avec succès ! Les ${data.payout.amountReleasedXaf.toLocaleString(
          "fr-FR",
        )} FCFA ont été versés à ${selectedResForRelease.companionName}.`,
      );
      setIsReleasing(false);
    } catch (err: unknown) {
      setIsReleasing(false);
      setReleaseError(
        err instanceof Error ? err.message : "Erreur lors de la validation.",
      );
    }
  };

  return (
    <DashboardShell
      role="client"
      pageTitle="Mes Réservations"
      pageSubtitle="Suivi en temps réel de vos missions, séquestres et codes OTP de clôture."
      actionButton={{
        label: "Nouvelle réservation",
        href: "/explore",
        icon: Compass,
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {hasReservations ? (
          <div className="space-y-4">
            {reservations.map((res) => {
              const isCancelled = res.status === "annulee";
              const isHeld = res.status === "sequestre_bloque";
              const isFinished = res.status === "terminee";
              const isPendingPayment = res.status === "demande_envoyee";

              return (
                <div
                  key={res.id}
                  className={`overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
                    isCancelled
                      ? "border-[#F0E6F3] bg-white opacity-70"
                      : isHeld
                      ? "border-up-300 bg-white shadow-md shadow-up-500/10"
                      : isFinished
                      ? "border-[#F0E6F3] bg-white shadow-xs"
                      : "border-[#F0E6F3] bg-white shadow-xs"
                  }`}
                >
                  {/* Entête carte réservation */}
                  <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        isCancelled
                          ? "bg-gray-100 text-[#6B5D73]"
                          : isHeld
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                          : isFinished
                          ? "border border-up-200 bg-up-50 text-up-700"
                          : "border border-amber-300 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isCancelled
                        ? "Annulée"
                        : isHeld
                        ? "Séquestre consigné (HELD)"
                        : isFinished
                        ? "Mission clôturée · Honoraires versés"
                        : "Demande envoyée · En attente"}
                    </span>

                    <span className="font-display text-sm font-bold text-[#1D0F24]">
                      {res.totalAmount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>

                  {/* Détails du prestataire */}
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#1D0F24]">
                      <Image
                        src={res.companionAvatar}
                        alt={res.companionName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/companion/${res.companionId}`}
                        className="font-display text-base font-bold text-[#1D0F24] hover:text-up-700 transition"
                      >
                        {res.companionName}
                      </Link>
                      <p className="text-xs font-medium text-up-700">
                        {res.serviceLabel}
                      </p>
                    </div>
                  </div>

                  {/* Infos Date, Heure & Lieu */}
                  <div className="mt-4 space-y-2 rounded-2xl bg-[#FAF9FB] p-3 text-xs text-[#6B5D73] border border-[#F0E6F3]">
                    <p className="flex items-center gap-2 text-[#1D0F24] font-semibold">
                      <Calendar size={14} className="text-up-500" />
                      <span>
                        {res.date} · {res.time} ({res.durationHours}h)
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-up-500" />
                      <span className="truncate">{res.venueName}</span>
                    </p>
                    {res.notes && (
                      <p className="border-t border-[#F0E6F3] pt-1.5 text-[11px] italic text-[#6B5D73]">
                        &laquo; {res.notes} &raquo;
                      </p>
                    )}
                  </div>

                  {/* Encadré Séquestre & Code OTP si séquestre actif */}
                  {isHeld && res.escrow && (
                    <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
                          <ShieldCheck size={16} />
                          Fonds garantis sous séquestre UP
                        </span>
                        <span className="font-mono text-[11px] text-[#6B5D73]">
                          {res.escrow.transactionRef}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-3 border border-emerald-200">
                        <span className="text-xs font-medium text-[#6B5D73]">
                          Code OTP de clôture :
                        </span>
                        <span className="font-mono text-base font-bold tracking-widest text-up-700">
                          {res.escrow.otpCode}
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] text-[#6B5D73]">
                        Communiquez ce code au prestataire à la fin de la rencontre pour débloquer ses honoraires.
                      </p>
                    </div>
                  )}

                  {/* Boutons d'Action selon le statut */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0E6F3] pt-3 text-xs">
                    {/* Si en attente de paiement */}
                    {isPendingPayment && (
                      <Link
                        href={`/client/paiement/${res.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-3 text-xs font-bold transition"
                      >
                        <Lock size={14} />
                        <span>Consigner les fonds (Payer)</span>
                      </Link>
                    )}

                    {/* Si séquestre actif */}
                    {isHeld && (
                      <div className="flex w-full gap-3">
                        <Link
                          href={`/mission/${res.id}/active`}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1D0F24] hover:bg-up-900 py-3 text-xs font-bold text-white transition"
                        >
                          <Compass size={14} />
                          <span>Suivre le rendez-vous en direct</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedResForRelease(res);
                            setEnteredOtp(res.escrow?.otpCode || "");
                            setReleaseError(null);
                            setReleaseSuccess(null);
                          }}
                          className="flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          <CheckCircle2 size={15} />
                          <span>Clôturer</span>
                        </button>
                      </div>
                    )}

                    {/* Si terminée */}
                    {isFinished && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 size={15} />
                        Paiement transféré avec succès au prestataire
                      </span>
                    )}

                    {/* Bouton d'annulation */}
                    {!isCancelled && !isFinished && (
                      <button
                        type="button"
                        onClick={() => cancelReservation(res.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                      >
                        <XCircle size={14} />
                        <span>Annuler la réservation</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-12 text-center shadow-xs">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-up-50 text-up-500">
              <CalendarCheck size={28} />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-[#1D0F24]">
              Aucune réservation pour le moment
            </h3>
            <p className="mt-1 max-w-sm mx-auto text-xs text-[#6B5D73] leading-relaxed">
              Consultez nos profils vérifiés pour planifier un accompagnement professionnel ou événementiel à Libreville.
            </p>
            <Link
              href="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-up-500 hover:bg-up-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
            >
              <Compass size={15} />
              <span>Explorer les profils</span>
            </Link>
          </div>
        )}

        {/* Modal de Validation OTP & Libération des Fonds */}
        {selectedResForRelease && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-4 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 text-center shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-up-700">
                  <ShieldCheck size={16} />
                  Clôture de Mission
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedResForRelease(null)}
                  className="grid h-8 w-8 place-items-center rounded-full text-[#6B5D73] hover:text-[#1D0F24]"
                >
                  <X size={18} />
                </button>
              </div>

              {releaseSuccess ? (
                <div className="my-6 text-center space-y-4">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={32} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#1D0F24]">
                    Fonds Libérés !
                  </h3>
                  <p className="text-xs text-[#6B5D73]">{releaseSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedResForRelease(null)}
                    className="mt-4 w-full rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-xs transition"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReleaseEscrow} className="mt-6 space-y-4">
                  <p className="text-xs text-[#6B5D73] text-left leading-relaxed">
                    Saisissez le code OTP à 6 chiffres pour attester que la mission avec{" "}
                    <strong className="text-[#1D0F24]">
                      {selectedResForRelease.companionName}
                    </strong>{" "}
                    s&apos;est déroulée dans le strict respect de la charte.
                  </p>

                  <div className="rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-4">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-up-700 text-center">
                      Code OTP de confirmation
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="849201"
                      required
                      className="mt-2 w-full rounded-xl border border-[#F0E6F3] bg-white py-3 text-center font-mono text-xl font-bold tracking-[0.25em] text-[#1D0F24] focus:border-up-500 focus:outline-none"
                    />
                  </div>

                  <div className="rounded-2xl bg-[#FAF9FB] p-3 text-left text-[11px] text-[#6B5D73] space-y-1 border border-[#F0E6F3]">
                    <p className="flex justify-between">
                      <span>Montant versé au prestataire :</span>
                      <span className="font-bold text-[#1D0F24]">
                        {selectedResForRelease.companionFee.toLocaleString(
                          "fr-FR",
                        )}{" "}
                        FCFA
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Commission UP :</span>
                      <span className="font-bold text-up-700">
                        {selectedResForRelease.platformFee.toLocaleString(
                          "fr-FR",
                        )}{" "}
                        FCFA
                      </span>
                    </p>
                  </div>

                  {releaseError && (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                      {releaseError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedResForRelease(null)}
                      className="flex-1 rounded-full border border-[#F0E6F3] py-3 text-xs font-semibold text-[#6B5D73] hover:text-[#1D0F24]"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isReleasing || enteredOtp.length !== 6}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition disabled:opacity-50"
                    >
                      {isReleasing ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      <span>Libérer les fonds</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
