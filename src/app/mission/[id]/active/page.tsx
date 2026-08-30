"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  RefreshCw,
  Repeat,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useUpStore, type ClientReservation } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { SECURE_PUBLIC_VENUES } from "@/lib/data";

type MissionLiveStatus = "waiting" | "in_progress" | "completed";

export default function ActiveMissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: missionId } = use(params);
  const router = useRouter();
  const hydrated = useHydrated();

  const role = useUpStore((s) => s.role) || "client";
  const setRole = useUpStore((s) => s.setRole);
  const balance = useUpStore((s) => s.prestataireBalance);
  const reservations = useUpStore((s) => s.reservations);
  const completeMissionWithOtp = useUpStore(
    (s) => s.completeMissionWithOtp,
  );

  // Active view role toggle (allows testing both Client and Companion perspectives)
  const [viewRole, setViewRole] = useState<"client" | "companion">(
    role === "prestataire" ? "companion" : "client",
  );

  // Find or fallback to a realistic mission
  const storedReservation = reservations.find((r) => r.id === missionId);

  const companion = {
    name: storedReservation?.companionName || "Prestataire Certifié",
    avatar:
      storedReservation?.companionAvatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    zone: storedReservation?.companionZone || "Libreville",
  };
  const venue = SECURE_PUBLIC_VENUES[1]; // Radisson Blu O'Mbali

  const [missionStatus, setMissionStatus] = useState<MissionLiveStatus>(
    storedReservation?.status === "terminee" ? "completed" : "in_progress",
  );

  // 4-digit OTP code for the client
  const [clientOtpCode] = useState<string>(
    storedReservation?.escrow?.otpCode &&
      storedReservation.escrow.otpCode.length === 4
      ? storedReservation.escrow.otpCode
      : "4829",
  );

  // Provider OTP input state
  const [providerOtpInput, setProviderOtpInput] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Emergency modal state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencySent, setEmergencySent] = useState(false);

  // Rating modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Ponctualité irréprochable",
    "Élégance & Discrétion",
  ]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Live timer simulation
  const [elapsedMinutes, setElapsedMinutes] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      if (missionStatus === "in_progress") {
        setElapsedMinutes((prev) => prev + 1);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [missionStatus]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleProviderOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setIsVerifyingOtp(true);

    try {
      const response = await fetch(`/api/missions/${missionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otpCode: providerOtpInput.trim(),
          authorRole: "companion",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Code OTP invalide. Veuillez vérifier auprès du client le code secret à 4 chiffres.",
        );
      }

      // Immédiatement mettre à jour le store Zustand sans rechargement
      completeMissionWithOtp(
        missionId,
        data.payout.payoutRef,
        data.payout.amountReleasedXaf || 75000,
      );

      setMissionStatus("completed");
      setIsVerifyingOtp(false);
      setIsRatingModalOpen(true);
    } catch (err: unknown) {
      setIsVerifyingOtp(false);
      setOtpError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la validation du code OTP.",
      );
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setIsRatingModalOpen(false);
    }, 1200);
  };

  const partnerInfo =
    viewRole === "client"
      ? {
          name: storedReservation?.companionName || companion.name,
          roleTitle: "Accompagnatrice UP",
          avatar: storedReservation?.companionAvatar || companion.avatar,
          rating: 4.9,
          zone: "Libreville · Glass",
        }
      : {
          name: "M. Alain Ndong",
          roleTitle: "Client UP Membre",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
          rating: 5.0,
          zone: "Libreville · Batterie IV",
        };

  return (
    <div className="min-h-dvh bg-up-black text-up-white pb-16">
      {/* Barre supérieure avec Switcher de Vue (Client / Prestataire) */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-up-black/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link
            href={
              viewRole === "client"
                ? "/client/reservations"
                : "/dashboard/companion"
            }
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-up-surface px-2.5 py-1 text-xs text-up-gray hover:text-up-white"
          >
            <ArrowLeft size={14} />
            <span>Retour</span>
          </Link>

          {/* Toggle de Vue pour tester les deux expériences en direct */}
          <div className="flex items-center rounded-xl border border-up-gold/30 bg-up-surface p-0.5">
            <button
              type="button"
              onClick={() => {
                setViewRole("client");
                setRole("client");
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                viewRole === "client"
                  ? "bg-up-gold text-up-black shadow"
                  : "text-up-gray hover:text-up-white"
              }`}
            >
              Vue Client
            </button>
            <button
              type="button"
              onClick={() => {
                setViewRole("companion");
                setRole("prestataire");
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                viewRole === "companion"
                  ? "bg-up-gold text-up-black shadow"
                  : "text-up-gray hover:text-up-white"
              }`}
            >
              Vue Prestataire
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex items-center gap-1 rounded-xl border border-red-500/40 bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500/25"
          >
            <AlertTriangle size={13} />
            <span>Alerte</span>
          </button>
        </div>
      </header>

      <main className="px-5 pt-4 space-y-4">
        {/* 1. Statut en direct avec badge lumineux */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-up-surface p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-up-gray font-bold">
              Suivi de Rendez-vous en direct
            </span>

            {/* Badge lumineux animé */}
            {missionStatus === "waiting" && (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-300">
                <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" />
                En attente du rendez-vous
              </span>
            )}

            {missionStatus === "in_progress" && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Mission en cours ({elapsedMinutes} min)
              </span>
            )}

            {missionStatus === "completed" && (
              <span className="flex items-center gap-1.5 rounded-full border border-up-gold/40 bg-up-gold/15 px-3 py-1 text-[11px] font-bold text-up-gold">
                <CheckCircle2 size={13} />
                Terminée · Fonds libérés
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-up-white">
              Dîner d&apos;affaires prestige
            </h1>
            <span className="font-mono text-xs font-bold text-up-gold">
              Séquestre HELD 🛡️
            </span>
          </div>
        </div>

        {/* 2. Fiche récapitulative de la Mission */}
        <div className="overflow-hidden rounded-3xl border border-up-gold/30 bg-gradient-to-b from-up-surface to-up-black p-5 shadow-xl space-y-4">
          {/* Photo & Prénom de l'autre partie avec badge Identité Vérifiée */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-up-gold/40 bg-up-black shadow-md">
                <Image
                  src={partnerInfo.avatar}
                  alt={partnerInfo.name}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-up-gray block">
                  {viewRole === "client" ? "Votre accompagnatrice" : "Votre client"}
                </span>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-base font-bold text-up-white">
                    {partnerInfo.name}
                  </h2>
                  <BadgeCheck size={16} className="text-up-gold" />
                </div>
                <p className="flex items-center gap-1 text-xs text-up-gold-soft">
                  <Star size={11} className="fill-up-gold text-up-gold" />
                  <span>{partnerInfo.rating.toFixed(1)}</span>
                  <span className="text-up-gray">· {partnerInfo.zone}</span>
                </p>
              </div>
            </div>

            <span className="rounded-full border border-up-gold/40 bg-up-gold/10 px-2.5 py-1 text-[10px] font-bold text-up-gold">
              Identité Vérifiée
            </span>
          </div>

          {/* Lieu public sélectionné, Heure convenue et Montant consigné */}
          <div className="space-y-2.5 text-xs text-up-gray">
            <div className="flex items-start gap-2.5 rounded-2xl border border-white/5 bg-up-black/50 p-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-up-gold" />
              <div>
                <p className="font-semibold text-up-white">
                  {storedReservation?.venueName || venue.name}
                </p>
                <p className="text-[11px] text-up-gray">
                  {storedReservation?.venueAddress || venue.address}
                </p>
                <p className="mt-0.5 text-[10px] text-emerald-400 font-medium">
                  ✓ Lieu public certifié &amp; sécurisé UP Libreville
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/5 bg-up-black/50 p-3">
                <span className="text-[10px] uppercase text-up-gray block">
                  Heure convenue
                </span>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-up-white">
                  <Clock size={12} className="text-up-gold" />
                  <span>
                    {storedReservation?.date || "Ce soir"} ·{" "}
                    {storedReservation?.time || "19h30"} (3h)
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-up-black/50 p-3">
                <span className="text-[10px] uppercase text-up-gray block">
                  Montant sous séquestre
                </span>
                <p className="mt-1 font-display text-sm font-bold text-up-gold">
                  {(storedReservation?.totalAmount || 82500).toLocaleString(
                    "fr-FR",
                  )}{" "}
                  FCFA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Système de Clôture & Code OTP (Adaptatif Client / Prestataire) */}
        <section className="space-y-3">
          {viewRole === "client" ? (
            /* VUE CLIENT : Affichage du Code OTP à donner */
            <div className="overflow-hidden rounded-3xl border border-up-gold/50 bg-gradient-to-br from-up-gold/20 via-up-surface to-up-surface p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                  <Lock size={15} />
                  Code de Clôture Secret (Client)
                </span>
                <span className="rounded-full bg-up-gold/15 px-2.5 py-0.5 text-[10px] font-bold text-up-gold">
                  OTP à 4 chiffres
                </span>
              </div>

              <div className="my-4 text-center">
                <p className="text-xs text-up-gray">
                  Donnez ce code secret à votre accompagnateur à la fin du
                  rendez-vous pour libérer ses honoraires :
                </p>

                <div className="my-3 inline-block rounded-2xl border border-up-gold/60 bg-up-black px-8 py-3.5 text-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  <span className="font-mono text-4xl font-bold tracking-[0.35em] text-up-white">
                    {clientOtpCode}
                  </span>
                </div>

                <p className="text-[11px] text-up-gold-soft">
                  🔒 Ne partagez ce code qu&apos;une fois la prestation terminée au
                  lieu public convenu.
                </p>
              </div>

              {missionStatus === "completed" && (
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-up-gold py-3 text-xs font-bold text-up-black hover:bg-up-gold-soft"
                >
                  <Star size={14} />
                  <span>Évaluer la prestation</span>
                </button>
              )}
            </div>
          ) : (
            /* VUE PRESTATAIRE : Saisie du Code OTP pour libérer les fonds */
            <div className="overflow-hidden rounded-3xl border border-up-gold/50 bg-gradient-to-br from-up-surface to-up-black p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                  <ShieldCheck size={16} />
                  Validation des Gains (Prestataire)
                </span>
                <span className="text-[11px] font-bold text-emerald-400">
                  +75 000 FCFA net
                </span>
              </div>

              {missionStatus === "completed" ? (
                <div className="my-4 text-center space-y-2">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={28} />
                  </span>
                  <h3 className="font-display text-base font-bold text-up-white">
                    Fonds débloqués avec succès !
                  </h3>
                  <p className="text-xs text-up-gray">
                    75 000 FCFA ont été crédités sur votre solde disponible (Solde
                    actuel : {hydrated ? balance.toLocaleString("fr-FR") : "—"}{" "}
                    FCFA).
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsRatingModalOpen(true)}
                    className="mt-3 w-full rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black hover:bg-up-gold-soft"
                  >
                    Laisser un avis client
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProviderOtpSubmit} className="mt-4 space-y-4">
                  <p className="text-xs text-up-gray">
                    Demandez le code secret à 4 chiffres à{" "}
                    <span className="font-semibold text-up-white">
                      M. Alain Ndong
                    </span>{" "}
                    à la fin du dîner pour débloquer immédiatement vos 75 000 FCFA.
                  </p>

                  <div className="rounded-2xl border border-white/10 bg-up-black/70 p-4">
                    <label
                      htmlFor="active-mission-otp"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-up-gold text-center"
                    >
                      Saisie du Code OTP (4 chiffres)
                    </label>
                    <input
                      id="active-mission-otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={providerOtpInput}
                      onChange={(e) => setProviderOtpInput(e.target.value)}
                      placeholder="4829"
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-up-surface py-3 text-center font-mono text-3xl font-bold tracking-[0.3em] text-up-white focus:border-up-gold focus:outline-none"
                    />
                    <div className="mt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setProviderOtpInput(clientOtpCode)}
                        className="text-[10px] text-up-gray underline hover:text-up-gold"
                      >
                        (Test rapide : insérer le code client {clientOtpCode})
                      </button>
                    </div>
                  </div>

                  {otpError && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 flex items-start gap-2 animate-in fade-in">
                      <XCircle size={15} className="shrink-0 mt-0.5" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || providerOtpInput.length !== 4}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs font-bold text-up-black transition hover:bg-emerald-400 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Vérification &amp; Libération des fonds...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Valider la fin de mission &amp; Débloquer mes gains</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </section>

        {/* 4. Bouton de Sécurité d'Urgence "Alerter le support UP" */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-950/20 py-3 text-xs font-semibold text-red-400 transition hover:bg-red-950/40"
          >
            <ShieldAlert size={16} />
            <span>Alerter le support UP (Assistance 24/7)</span>
          </button>
        </div>
      </main>

      {/* Modal d'Alerte & Sécurité d'Urgence */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/50 bg-up-surface p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
                <ShieldAlert size={16} />
                Assistance &amp; Sécurité UP
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsEmergencyModalOpen(false);
                  setEmergencySent(false);
                }}
                className="text-up-gray hover:text-up-white"
              >
                <X size={18} />
              </button>
            </div>

            {emergencySent ? (
              <div className="my-5 text-center space-y-3">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={28} />
                </span>
                <h3 className="font-display text-base font-bold text-up-white">
                  Alerte transmise au superviseur
                </h3>
                <p className="text-xs text-up-gray">
                  Un agent de la conciergerie UP Gabon prend contact immédiatement
                  avec vous et le lieu public partenaire.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="mt-4 w-full rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-left">
                <p className="text-xs text-up-gray leading-relaxed">
                  En cas de lieu non conforme, comportement inadapté ou situation
                  inconfortable, la conciergerie UP intervient immédiatement.
                </p>

                {/* Appel d'urgence direct */}
                <a
                  href="tel:+241077000000"
                  className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-300 hover:bg-red-950/50"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <PhoneCall size={16} className="text-red-400" />
                    Ligne d&apos;urgence Conciergerie 24/7
                  </span>
                  <span className="font-mono font-bold">+241 077 00 00 00</span>
                </a>

                {/* Boutons de signalement rapide */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-up-gray block">
                    Signalement immédiat discret :
                  </span>
                  {[
                    "Lieu de rendez-vous non conforme",
                    "Comportement inadapté de l'autre partie",
                    "Retard excessif / Absence non signalée",
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setEmergencySent(true)}
                      className="w-full text-left rounded-xl border border-white/10 bg-up-black/60 p-2.5 text-xs text-up-gray hover:border-white/20 hover:text-up-white"
                    >
                      ⚠️ {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Notation Mutuelle (1 à 5 étoiles + commentaire) */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-up-gold/50 bg-up-surface p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                <Sparkles size={16} />
                Évaluation Mutuelle
              </span>
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(false)}
                className="text-up-gray hover:text-up-white"
              >
                <X size={18} />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="my-5 text-center space-y-3">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={30} />
                </span>
                <h3 className="font-display text-lg font-bold text-up-white">
                  Avis enregistré !
                </h3>
                <p className="text-xs text-up-gray">
                  Merci pour votre retour d&apos;expérience qui maintient l&apos;excellence
                  de la communauté UP Gabon.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(viewRole === "client" ? "/explore" : "/dashboard/companion")}
                  className="mt-4 w-full rounded-xl bg-up-gold py-2.5 text-xs font-bold text-up-black"
                >
                  Terminer
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4 text-left">
                <div className="text-center">
                  <p className="text-xs text-up-gray">
                    Comment s&apos;est déroulé votre accompagnement avec{" "}
                    <span className="font-semibold text-up-white">
                      {partnerInfo.name}
                    </span>{" "}
                    ?
                  </p>

                  {/* 5 Étoiles interactives */}
                  <div className="my-3 flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125"
                      >
                        <Star
                          size={28}
                          className={
                            star <= (hoverRating || rating)
                              ? "fill-up-gold text-up-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                              : "text-white/20"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-up-gold">
                    {rating === 5
                      ? "Excellence absolue (5/5)"
                      : rating === 4
                        ? "Très satisfaisant (4/5)"
                        : `${rating}/5`}
                  </span>
                </div>

                {/* Tags de feedback */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray mb-1.5">
                    Points forts
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Ponctualité irréprochable",
                      "Élégance & Discrétion",
                      "Respect du protocole",
                      "Conversation enrichissante",
                      "Cadre sécurisé parfait",
                    ].map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition ${
                            isSelected
                              ? "border border-up-gold/60 bg-up-gold/15 text-up-gold"
                              : "border border-white/5 bg-white/5 text-up-gray"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Commentaire */}
                <div>
                  <label
                    htmlFor="review-comment-input"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                  >
                    Commentaire certifié
                  </label>
                  <textarea
                    id="review-comment-input"
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Partagez votre appréciation..."
                    className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/60 p-2.5 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-up-gold py-3 text-xs font-bold text-up-black hover:bg-up-gold-soft"
                >
                  Envoyer l&apos;évaluation
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
