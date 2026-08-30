"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Compass,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useUpStore, type ClientReservation } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function ReservationsPage() {
  const hydrated = useHydrated();
  const reservations = useUpStore((s) => s.reservations);
  const cancelReservation = useUpStore((s) => s.cancelReservation);
  const completeMissionWithOtp = useUpStore(
    (s) => s.completeMissionWithOtp,
  );

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
        `Mission clôturée avec succès ! Les ${data.payout.amountReleasedXaf.toLocaleString("fr-FR")} FCFA ont été versés à ${selectedResForRelease.companionName}.`,
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
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-12">
      <div className="px-1 py-3 text-center sm:text-left">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
            <Sparkles size={12} />
            Espace Client
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#FAFAF9] sm:text-3xl">
            Mes Réservations
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Suivi en direct des missions, statuts et comptes séquestres.
          </p>
        </div>
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
                  className={`overflow-hidden rounded-2xl border p-4 transition ${
                    isCancelled
                      ? "border-white/5 bg-up-surface/40 opacity-70"
                      : isHeld
                        ? "border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 via-up-surface to-up-surface shadow-xl"
                        : isFinished
                          ? "border-up-gold/40 bg-up-surface/90"
                          : "border-up-gold/30 bg-up-surface shadow-lg"
                  }`}
                >
                  {/* Entête carte réservation */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        isCancelled
                          ? "bg-white/10 text-up-gray"
                          : isHeld
                            ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                            : isFinished
                              ? "border border-up-gold/40 bg-up-gold/15 text-up-gold"
                              : "border border-amber-500/40 bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {isCancelled
                        ? "Annulée"
                        : isHeld
                          ? "Séquestre bloqué (HELD)"
                          : isFinished
                            ? "Mission clôturée · Honoraires versés"
                            : "Demande envoyée · En attente"}
                    </span>

                    <span className="font-display text-xs font-bold text-up-white">
                      {res.totalAmount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>

                  {/* Détails du prestataire */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-up-black">
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
                        className="font-semibold text-up-white hover:text-up-gold"
                      >
                        {res.companionName}
                      </Link>
                      <p className="text-xs text-up-gold-soft">
                        {res.serviceLabel}
                      </p>
                    </div>
                  </div>

                  {/* Infos Date, Heure & Lieu */}
                  <div className="mt-3 space-y-1.5 rounded-xl bg-up-black/40 p-2.5 text-xs text-up-gray">
                    <p className="flex items-center gap-2 text-up-white">
                      <Calendar size={13} className="text-up-gold" />
                      <span>
                        {res.date} · {res.time} ({res.durationHours}h)
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={13} className="text-up-gold" />
                      <span className="truncate">{res.venueName}</span>
                    </p>
                    {res.notes && (
                      <p className="border-t border-white/5 pt-1 text-[11px] italic text-up-gray">
                        &laquo; {res.notes} &raquo;
                      </p>
                    )}
                  </div>

                  {/* Encadré Séquestre & Code OTP si séquestre actif */}
                  {isHeld && res.escrow && (
                    <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-400 text-[11px]">
                          <ShieldCheck size={14} />
                          Séquestre UP actif
                        </span>
                        <span className="font-mono text-[10px] text-up-gray">
                          {res.escrow.transactionRef}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between rounded-lg bg-up-black/60 px-3 py-2">
                        <span className="text-[11px] text-up-gray">
                          Code OTP de fin :
                        </span>
                        <span className="font-mono text-sm font-bold tracking-widest text-up-gold">
                          {res.escrow.otpCode}
                        </span>
                      </div>

                      <p className="mt-2 text-[10px] text-up-gray">
                        Transmettez ce code au prestataire ou saisissez-le
                        ci-dessous pour débloquer ses honoraires.
                      </p>
                    </div>
                  )}

                  {/* Boutons d'Action selon le statut */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs">
                    {/* Si en attente de paiement */}
                    {isPendingPayment && (
                      <Link
                        href={`/client/paiement/${res.id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black transition hover:bg-up-gold-soft"
                      >
                        <Lock size={14} />
                        <span>Consigner les fonds (Payer)</span>
                      </Link>
                    )}

                    {/* Si séquestre actif -> bouton de suivi et de confirmation de mission */}
                    {isHeld && (
                      <div className="flex w-full gap-2">
                        <Link
                          href={`/mission/${res.id}/active`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black transition hover:bg-up-gold-soft"
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
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-3 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25"
                        >
                          <CheckCircle2 size={14} />
                          <span>Clôturer</span>
                        </button>
                      </div>
                    )}

                    {/* Si terminée */}
                    {isFinished && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 size={13} />
                        Paiement transféré au prestataire
                      </span>
                    )}

                    {/* Bouton d'annulation pour les demandes non terminées */}
                    {!isCancelled && !isFinished && (
                      <button
                        type="button"
                        onClick={() => cancelReservation(res.id)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <XCircle size={13} />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid place-items-center py-16 text-center">
            <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-up-surface text-up-gold">
              <CalendarCheck size={24} />
            </span>
            <p className="text-sm font-medium text-up-white">
              Aucune réservation pour le moment
            </p>
            <p className="mt-1 max-w-[15rem] text-xs text-up-gray">
              Trouvez un profil d&apos;exception dans l&apos;onglet Découvrir
              pour réserver votre première prestation.
            </p>
            <Link
              href="/explore"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-up-gold px-4 py-2.5 text-xs font-semibold text-up-black transition hover:bg-up-gold-soft"
            >
              <Compass size={14} />
              Explorer les profils
            </Link>
          </div>
        )}

        {/* Modal de Validation OTP & Libération des Fonds */}
        {selectedResForRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-up-gold/40 bg-up-surface p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-up-gold">
                <ShieldCheck size={16} />
                Clôture de Mission
              </span>
              <button
                type="button"
                onClick={() => setSelectedResForRelease(null)}
                className="text-up-gray hover:text-up-white"
              >
                <X size={18} />
              </button>
            </div>

            {releaseSuccess ? (
              <div className="my-5 text-center space-y-3">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={30} />
                </span>
                <h3 className="font-display text-lg font-bold text-up-white">
                  Fonds Libérés !
                </h3>
                <p className="text-xs text-up-gray">{releaseSuccess}</p>
                <button
                  type="button"
                  onClick={() => setSelectedResForRelease(null)}
                  className="mt-4 w-full rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleReleaseEscrow} className="mt-4 space-y-4">
                <p className="text-xs text-up-gray text-left">
                  Saisissez le code OTP à 6 chiffres partagé pour attester que la
                  prestation avec{" "}
                  <span className="font-semibold text-up-white">
                    {selectedResForRelease.companionName}
                  </span>{" "}
                  s&apos;est déroulée avec succès.
                </p>

                <div className="rounded-2xl border border-white/10 bg-up-black/60 p-4">
                  <label
                    htmlFor="release-otp-input"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-up-gold"
                  >
                    Code OTP de confirmation
                  </label>
                  <input
                    id="release-otp-input"
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="849201"
                    required
                    className="mt-2 w-full rounded-xl border border-white/10 bg-up-surface py-3 text-center font-mono text-xl font-bold tracking-[0.25em] text-up-white focus:border-up-gold focus:outline-none"
                  />
                </div>

                <div className="rounded-xl bg-white/5 p-3 text-left text-[11px] text-up-gray">
                  <p className="flex justify-between">
                    <span>Montant versé au prestataire :</span>
                    <span className="font-semibold text-up-white">
                      {selectedResForRelease.companionFee.toLocaleString(
                        "fr-FR",
                      )}{" "}
                      FCFA
                    </span>
                  </p>
                  <p className="flex justify-between mt-1">
                    <span>Commission conciergerie UP :</span>
                    <span className="font-semibold text-up-gold">
                      {selectedResForRelease.platformFee.toLocaleString(
                        "fr-FR",
                      )}{" "}
                      FCFA
                    </span>
                  </p>
                </div>

                {releaseError && (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                    {releaseError}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedResForRelease(null)}
                    className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold text-up-gray hover:text-up-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isReleasing || enteredOtp.length !== 6}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-up-black transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isReleasing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
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
  );
}
