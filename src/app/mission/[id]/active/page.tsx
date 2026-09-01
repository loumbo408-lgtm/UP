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
    <div className="min-h-dvh bg-[#FAF9FB] text-[#1D0F24] pb-16">
      {/* Barre supérieure avec Switcher de Vue (Client / Prestataire) */}
      <header className="sticky top-0 z-40 border-b border-[#F0E6F3] bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={
              viewRole === "client"
                ? "/client/reservations"
                : "/dashboard/companion"
            }
            className="flex items-center gap-1.5 rounded-full border border-[#F0E6F3] bg-white px-3 py-1 text-xs font-semibold text-[#6B5D73] hover:text-[#1D0F24] shadow-xs transition"
          >
            <ArrowLeft size={14} />
            <span>Retour</span>
          </Link>

          {/* Toggle de Vue pour tester les deux expériences en direct */}
          <div className="flex items-center rounded-full border border-[#F0E6F3] bg-[#FAF9FB] p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setViewRole("client");
                setRole("client");
              }}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                viewRole === "client"
                  ? "bg-up-500 text-white shadow-xs"
                  : "text-[#6B5D73] hover:text-[#1D0F24]"
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
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                viewRole === "companion"
                  ? "bg-up-500 text-white shadow-xs"
                  : "text-[#6B5D73] hover:text-[#1D0F24]"
              }`}
            >
              Vue Prestataire
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
          >
            <AlertTriangle size={13} />
            <span>Alerte</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-4 space-y-4">
        {/* 1. Statut en direct avec badge lumineux */}
        <div className="overflow-hidden rounded-3xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#6B5D73] font-bold">
              Suivi de Rendez-vous en direct
            </span>

            {/* Badge lumineux animé */}
            {missionStatus === "waiting" && (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">
                <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
                En attente du rendez-vous
              </span>
            )}

            {missionStatus === "in_progress" && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Mission en cours ({elapsedMinutes} min)
              </span>
            )}

            {missionStatus === "completed" && (
              <span className="flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-3 py-1 text-[11px] font-bold text-up-700">
                <CheckCircle2 size={13} />
                Terminée · Fonds libérés
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-[#1D0F24]">
              Dîner d&apos;affaires prestige
            </h1>
            <span className="font-mono text-xs font-bold text-up-700">
              Séquestre HELD 🛡️
            </span>
          </div>
        </div>

        {/* 2. Fiche récapitulative de la Mission */}
        <div className="overflow-hidden rounded-3xl border border-[#F0E6F3] bg-white p-5 shadow-xs space-y-4">
          {/* Photo & Prénom de l'autre partie avec badge Identité Vérifiée */}
          <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-up-200 bg-up-50 shadow-xs">
                <Image
                  src={partnerInfo.avatar}
                  alt={partnerInfo.name}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#6B5D73] block">
                  {viewRole === "client" ? "Votre accompagnatrice" : "Votre client"}
                </span>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-base font-bold text-[#1D0F24]">
                    {partnerInfo.name}
                  </h2>
                  <BadgeCheck size={16} className="text-up-500" />
                </div>
                <p className="flex items-center gap-1 text-xs font-semibold text-[#1D0F24]">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span>{partnerInfo.rating.toFixed(1)}</span>
                  <span className="text-[#6B5D73] font-normal">· {partnerInfo.zone}</span>
                </p>
              </div>
            </div>

            <span className="rounded-full border border-up-200 bg-up-50 px-3 py-1 text-[10px] font-bold text-up-700">
              Identité Vérifiée
            </span>
          </div>

          {/* Lieu public sélectionné, Heure convenue et Montant consigné */}
          <div className="space-y-2.5 text-xs text-[#6B5D73]">
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-up-500" />
              <div>
                <p className="font-bold text-[#1D0F24]">
                  {storedReservation?.venueName || venue.name}
                </p>
                <p className="text-[11px] text-[#6B5D73]">
                  {storedReservation?.venueAddress || venue.address}
                </p>
                <p className="mt-0.5 text-[10px] text-emerald-700 font-semibold">
                  ✓ Lieu public certifié &amp; sécurisé UP Libreville
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3">
                <span className="text-[10px] uppercase text-[#6B5D73] block">
                  Heure convenue
                </span>
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#1D0F24]">
                  <Clock size={12} className="text-up-500" />
                  <span>
                    {storedReservation?.date || "Ce soir"} ·{" "}
                    {storedReservation?.time || "19h30"} (3h)
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3">
                <span className="text-[10px] uppercase text-[#6B5D73] block">
                  Montant sous séquestre
                </span>
                <p className="mt-1 font-display text-sm font-bold text-up-700">
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
            <div className="overflow-hidden rounded-3xl border border-up-200 bg-up-50 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-up-200 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-700">
                  <Lock size={15} />
                  Code de Clôture Secret (Client)
                </span>
                <span className="rounded-full bg-white border border-up-200 px-2.5 py-0.5 text-[10px] font-bold text-up-700">
                  OTP à 4 chiffres
                </span>
              </div>

              <div className="my-4 text-center">
                <p className="text-xs text-[#6B5D73]">
                  Donnez ce code secret à votre accompagnateur à la fin du
                  rendez-vous pour libérer ses honoraires :
                </p>

                <div className="my-3 inline-block rounded-2xl border border-up-300 bg-white px-8 py-3.5 text-center shadow-xs">
                  <span className="font-mono text-4xl font-bold tracking-[0.35em] text-up-700">
                    {clientOtpCode}
                  </span>
                </div>

                <p className="text-[11px] text-up-700 font-medium">
                  🔒 Ne partagez ce code qu&apos;une fois la prestation terminée au
                  lieu public convenu.
                </p>
              </div>

              {missionStatus === "completed" && (
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
                >
                  <Star size={14} />
                  <span>Évaluer la prestation</span>
                </button>
              )}
            </div>
          ) : (
            /* VUE PRESTATAIRE : Saisie du Code OTP pour libérer les fonds */
            <div className="overflow-hidden rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-700">
                  <ShieldCheck size={16} />
                  Validation des Gains (Prestataire)
                </span>
                <span className="text-[11px] font-bold text-emerald-600">
                  +75 000 FCFA net
                </span>
              </div>

              {missionStatus === "completed" ? (
                <div className="my-4 text-center space-y-2">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={28} />
                  </span>
                  <h3 className="font-display text-base font-bold text-[#1D0F24]">
                    Fonds débloqués avec succès !
                  </h3>
                  <p className="text-xs text-[#6B5D73]">
                    75 000 FCFA ont été crédités sur votre solde disponible (Solde
                    actuel : {hydrated ? balance.toLocaleString("fr-FR") : "—"}{" "}
                    FCFA).
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsRatingModalOpen(true)}
                    className="mt-3 w-full rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
                  >
                    Laisser un avis client
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProviderOtpSubmit} className="mt-4 space-y-4">
                  <p className="text-xs text-[#6B5D73]">
                    Demandez le code secret à 4 chiffres à{" "}
                    <span className="font-bold text-[#1D0F24]">
                      M. Alain Ndong
                    </span>{" "}
                    à la fin du dîner pour débloquer immédiatement vos 75 000 FCFA.
                  </p>

                  <div className="rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-4">
                    <label
                      htmlFor="active-mission-otp"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-up-700 text-center"
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
                      className="mt-2 w-full rounded-xl border border-[#F0E6F3] bg-white py-3 text-center font-mono text-3xl font-bold tracking-[0.3em] text-[#1D0F24] focus:border-up-500 focus:outline-none shadow-xs"
                    />
                    <div className="mt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setProviderOtpInput(clientOtpCode)}
                        className="text-[10px] text-[#6B5D73] underline hover:text-up-700"
                      >
                        (Test rapide : insérer le code client {clientOtpCode})
                      </button>
                    </div>
                  </div>

                  {otpError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                      <XCircle size={15} className="shrink-0 mt-0.5" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || providerOtpInput.length !== 4}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white transition disabled:opacity-50 shadow-xs active:scale-[0.98]"
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
            className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white py-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 shadow-xs"
          >
            <ShieldAlert size={16} />
            <span>Alerter le support UP (Assistance 24/7)</span>
          </button>
        </div>
      </main>

      {/* Modal d'Alerte & Sécurité d'Urgence */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700">
                <ShieldAlert size={16} />
                Assistance &amp; Sécurité UP
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsEmergencyModalOpen(false);
                  setEmergencySent(false);
                }}
                className="text-[#6B5D73] hover:text-[#1D0F24]"
              >
                <X size={18} />
              </button>
            </div>

            {emergencySent ? (
              <div className="my-5 text-center space-y-3">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={28} />
                </span>
                <h3 className="font-display text-base font-bold text-[#1D0F24]">
                  Alerte transmise au superviseur
                </h3>
                <p className="text-xs text-[#6B5D73]">
                  Un agent de la conciergerie UP Gabon prend contact immédiatement
                  avec vous et le lieu public partenaire.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="mt-4 w-full rounded-full bg-up-500 hover:bg-up-600 py-2.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98]"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-left">
                <p className="text-xs text-[#6B5D73] leading-relaxed">
                  En cas de lieu non conforme, comportement inadapté ou situation
                  inconfortable, la conciergerie UP intervient immédiatement.
                </p>

                {/* Appel d'urgence direct */}
                <a
                  href="tel:+241077000000"
                  className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 hover:bg-red-100 transition"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <PhoneCall size={16} className="text-red-600" />
                    Ligne d&apos;urgence Conciergerie 24/7
                  </span>
                  <span className="font-mono font-bold">+241 077 00 00 00</span>
                </a>

                {/* Boutons de signalement rapide */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B5D73] block">
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
                      className="w-full text-left rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#6B5D73] hover:border-red-200 hover:text-red-700 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-[#F0E6F3] bg-white p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-700">
                <Sparkles size={16} />
                Évaluation Mutuelle
              </span>
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(false)}
                className="text-[#6B5D73] hover:text-[#1D0F24]"
              >
                <X size={18} />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="my-5 text-center space-y-3">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={30} />
                </span>
                <h3 className="font-display text-lg font-bold text-[#1D0F24]">
                  Avis enregistré !
                </h3>
                <p className="text-xs text-[#6B5D73]">
                  Merci pour votre retour d&apos;expérience qui maintient l&apos;excellence
                  de la communauté UP Gabon.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(viewRole === "client" ? "/explore" : "/dashboard/companion")}
                  className="mt-4 w-full rounded-full bg-up-500 hover:bg-up-600 py-2.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98]"
                >
                  Terminer
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4 text-left">
                <div className="text-center">
                  <p className="text-xs text-[#6B5D73]">
                    Comment s&apos;est déroulé votre accompagnement avec{" "}
                    <span className="font-bold text-[#1D0F24]">
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
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-up-700">
                    {rating === 5
                      ? "Excellence absolue (5/5)"
                      : rating === 4
                        ? "Très satisfaisant (4/5)"
                        : `${rating}/5`}
                  </span>
                </div>

                {/* Tags de feedback */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73] mb-1.5">
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
                          className={`rounded-full px-3 py-1 text-[10px] font-medium transition ${
                            isSelected
                              ? "border border-up-200 bg-up-50 text-up-700 font-bold"
                              : "border border-[#F0E6F3] bg-[#FAF9FB] text-[#6B5D73]"
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
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
                  >
                    Commentaire certifié
                  </label>
                  <textarea
                    id="review-comment-input"
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Partagez votre appréciation..."
                    className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] placeholder-[#6B5D73] focus:border-up-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
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
