"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Globe,
  GraduationCap,
  Heart,
  Info,
  Lock,
  MapPin,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  Wallet,
} from "lucide-react";
import {
  SECURE_PUBLIC_VENUES,
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "@/lib/data";
import { AppShell } from "@/components/layout/AppShell";
import { fetchCompanionById, type SupabaseCompanion } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import { useUpStore } from "@/lib/store";

export default function CompanionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const addReservation = useUpStore((s) => s.addReservation);

  const [companion, setCompanion] = useState<SupabaseCompanion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Form state
  const [selectedService, setSelectedService] = useState<string>("diner_affaires");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("19:30");
  const [durationHours, setDurationHours] = useState<number>(3);
  const [selectedVenueId, setSelectedVenueId] = useState(SECURE_PUBLIC_VENUES[0].id);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      const comp = await fetchCompanionById(id);
      setCompanion(comp);
      if (comp?.services?.[0]) {
        setSelectedService(comp.services[0]);
      }
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  const selectedVenue = useMemo(() => {
    return (
      SECURE_PUBLIC_VENUES.find((v) => v.id === selectedVenueId) ||
      SECURE_PUBLIC_VENUES[0]
    );
  }, [selectedVenueId]);

  // Pricing calculations
  const companionFee = useMemo(() => {
    if (!companion) return 0;
    if (durationHours >= 5) {
      return companion.eveningRate;
    }
    return companion.hourlyRate * durationHours;
  }, [companion, durationHours]);

  const platformFee = useMemo(() => {
    return Math.round(companionFee * 0.1);
  }, [companionFee]);

  const totalAmount = useMemo(() => {
    return companionFee + platformFee;
  }, [companionFee, platformFee]);

  const selectedServiceLabel = useMemo(() => {
    return (
      SERVICE_CATEGORIES.find((s) => s.id === selectedService)?.label ||
      "Accompagnement d'affaires"
    );
  }, [selectedService]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/companion/${id}`);
      return;
    }

    if (!companion) return;

    setIsSubmitting(true);

    try {
      const reservationId = addReservation({
        companionId: companion.id,
        companionName: companion.name,
        companionAvatar: companion.avatar,
        companionZone: companion.zone as any,
        date,
        time,
        durationHours,
        venueName: selectedVenue.name,
        venueAddress: selectedVenue.address,
        serviceCategory: selectedService as any,
        serviceLabel: selectedServiceLabel,
        companionFee,
        platformFee,
        totalAmount,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      setCreatedReservationId(reservationId);
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);
    } catch {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell showHeader={true} showBottomNav={false} maxWidth="lg">
        <div className="py-12 text-center space-y-4">
          <div className="h-64 w-full rounded-3xl bg-[#151518] animate-pulse" />
          <div className="h-6 w-1/2 mx-auto rounded-lg bg-white/10 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!companion) {
    return (
      <AppShell showHeader={true} showBottomNav={false} maxWidth="md">
        <div className="py-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
            <ShieldCheck size={30} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-[#FAFAF9]">
            Profil en cours d&apos;agrément
          </h1>
          <p className="mt-2 text-xs text-[#A1A1AA]">
            Ce profil est en cours de validation par nos équipes ou n&apos;est plus disponible.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#0B0B0D]"
          >
            <ArrowLeft size={15} />
            <span>Retour aux profils</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showHeader={true} showBottomNav={false} maxWidth="lg">
      <div className="pt-4 pb-12">
        {/* Navigation retour */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#151518] px-3.5 py-2 text-xs font-medium text-[#A1A1AA] transition hover:border-white/20 hover:text-[#FAFAF9]"
          >
            <ArrowLeft size={15} />
            <span>Tous les profils</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
              isFavorite
                ? "border-[#EF4444]/40 bg-[#EF4444]/15 text-[#EF4444]"
                : "border-white/10 bg-[#151518] text-[#A1A1AA] hover:text-[#FAFAF9]"
            }`}
            aria-label="Ajouter aux favoris"
          >
            <Heart size={16} className={isFavorite ? "fill-[#EF4444]" : ""} />
          </button>
        </div>

        {/* Hero Section / Photo Immersive */}
        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#0B0B0D] shadow-2xl">
          <Image
            src={companion.avatar}
            alt={companion.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 768px"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/30 to-transparent" />

          {/* Badge KYC Flottant */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#0B0B0D]/85 px-3 py-1 text-xs font-semibold text-[#D4AF37] backdrop-blur-md shadow-lg">
            <BadgeCheck size={16} className="text-[#D4AF37]" />
            <span>Identité Vérifiée (KYC)</span>
          </div>

          {/* Nom & Localisation */}
          <div className="absolute bottom-4 left-5 right-5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FAFAF9] sm:text-3xl">
              {companion.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#F1D875]">
              <MapPin size={13} className="text-[#D4AF37]" />
              <span>Libreville · {companion.zone}</span>
            </p>
          </div>
        </div>

        {/* Grille Tarifs */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#151518] p-4 shadow-md">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Tarif horaire
            </span>
            <p className="mt-1 font-display text-lg font-bold text-[#FAFAF9]">
              {companion.hourlyRate.toLocaleString("fr-FR")}{" "}
              <span className="text-xs font-normal text-[#D4AF37]">FCFA/h</span>
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#151518] p-4 shadow-md">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Forfait soirée (5h+)
            </span>
            <p className="mt-1 font-display text-lg font-bold text-[#FAFAF9]">
              {companion.eveningRate.toLocaleString("fr-FR")}{" "}
              <span className="text-xs font-normal text-[#D4AF37]">FCFA</span>
            </p>
          </div>
        </div>

        {/* Biographie & Parcours */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#151518] p-5 shadow-md">
          <h2 className="font-display text-base font-bold text-[#FAFAF9]">
            Présentation &amp; Parcours
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
            {companion.bio}
          </p>

          {companion.education && (
            <div className="mt-4 flex items-start gap-2.5 border-t border-white/5 pt-3 text-xs text-[#A1A1AA]">
              <GraduationCap size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <span><strong className="text-[#FAFAF9]">Formation :</strong> {companion.education}</span>
            </div>
          )}

          <div className="mt-4 border-t border-white/5 pt-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              <Globe size={13} />
              Langues maîtrisées
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {companion.languages.map((lang) => (
                <span
                  key={lang}
                  className="rounded-xl border border-white/10 bg-[#202024] px-3 py-1 text-xs font-medium text-[#FAFAF9]"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Formulaire de Demande de Mission */}
        <section className="mt-8">
          <div className="overflow-hidden rounded-3xl border border-[rgba(212,175,55,0.3)] bg-gradient-to-b from-[#151518] to-[#0B0B0D] p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4AF37]/20 text-[#D4AF37]">
                <Calendar size={20} />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-[#FAFAF9]">
                  Demande de réservation
                </h2>
                <p className="text-[11px] text-[#A1A1AA]">
                  Mission encadrée en lieu public sécurisé
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="mt-5 space-y-4">
              {/* Type de prestation */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  Type d&apos;accompagnement
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SERVICE_CATEGORIES.filter((c) => c.id !== "all").map((s) => {
                    const isSelected = selectedService === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedService(s.id)}
                        className={`rounded-xl border p-2.5 text-left text-xs transition ${
                          isSelected
                            ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#FAFAF9] font-semibold"
                            : "border-white/10 bg-[#202024] text-[#A1A1AA] hover:text-[#FAFAF9]"
                        }`}
                      >
                        {s.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Heure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="comp-date" className="block text-xs font-semibold text-[#A1A1AA]">
                    Date
                  </label>
                  <input
                    id="comp-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0B0D] p-2.5 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="comp-time" className="block text-xs font-semibold text-[#A1A1AA]">
                    Heure
                  </label>
                  <input
                    id="comp-time"
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0B0D] p-2.5 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Durée */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA]">
                  Durée estimée : <strong className="text-[#D4AF37]">{durationHours}h</strong>
                </label>
                <div className="mt-2 flex gap-2">
                  {[2, 3, 4, 5, 6].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDurationHours(hrs)}
                      className={`flex-1 rounded-xl border py-2 text-xs font-medium transition ${
                        durationHours === hrs
                          ? "border-[#D4AF37] bg-[#D4AF37] text-[#0B0B0D] font-bold"
                          : "border-white/10 bg-[#202024] text-[#A1A1AA] hover:text-[#FAFAF9]"
                      }`}
                    >
                      {hrs}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Sélection du Lieu Public */}
              <div>
                <label htmlFor="comp-venue" className="block text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  Lieu public partenaire (Libreville)
                </label>
                <div className="relative mt-1.5">
                  <select
                    id="comp-venue"
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#0B0B0D] p-3 pr-8 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                  >
                    {SECURE_PUBLIC_VENUES.map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#151518] text-[#FAFAF9]">
                        {v.name} ({v.zone})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#A1A1AA]">
                  📍 {selectedVenue.address} · {selectedVenue.securityNote}
                </p>
              </div>

              {/* Récapitulatif Financier */}
              <div className="rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[#D4AF37]/5 p-4 text-xs">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Honoraires prestataire ({durationHours}h)</span>
                  <span className="font-semibold text-[#FAFAF9]">
                    {companionFee.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between text-[#A1A1AA]">
                  <span>Frais conciergerie UP (10%)</span>
                  <span className="font-semibold text-[#FAFAF9]">
                    {platformFee.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="mt-3 flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-[#FAFAF9]">
                  <span>Montant total consigné</span>
                  <span className="font-display text-base text-[#D4AF37]">
                    {totalAmount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] py-4 text-sm font-bold text-[#0B0B0D] transition hover:bg-[#F1D875] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Transmission en cours...</span>
                ) : (
                  <span>
                    {isAuthenticated ? "Envoyer la demande de réservation" : "Se connecter pour réserver"}
                  </span>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Modal Succès */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-[#D4AF37] bg-[#151518] p-6 text-center shadow-2xl">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37]">
              <CheckCircle2 size={32} />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-[#FAFAF9]">
              Demande transmise !
            </h3>
            <p className="mt-2 text-xs text-[#A1A1AA]">
              Votre réservation a été envoyée à <strong className="text-[#FAFAF9]">{companion.name}</strong>.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={`/client/paiement/${createdReservationId}`}
                className="rounded-xl bg-[#D4AF37] py-3 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875]"
              >
                Consigner les fonds (Séquestre)
              </Link>
              <Link
                href="/client/reservations"
                className="rounded-xl border border-white/10 py-2.5 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAF9]"
              >
                Voir mes réservations
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
