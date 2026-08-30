"use client";

import { use, useState, useMemo } from "react";
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
  MessageSquare,
  PartyPopper,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  Wallet,
} from "lucide-react";
import {
  COMPANIONS,
  SECURE_PUBLIC_VENUES,
  SERVICE_CATEGORIES,
  type Companion,
  type ServiceCategory,
} from "@/lib/data";
import { useUpStore } from "@/lib/store";

export default function CompanionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const addReservation = useUpStore((s) => s.addReservation);

  const companion = useMemo(() => {
    return COMPANIONS.find((c) => c.id === id) || COMPANIONS[0];
  }, [id]);

  // Form state
  const [selectedService, setSelectedService] = useState<ServiceCategory>(
    companion.services[0] || "diner_affaires",
  );
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("19:30");
  const [durationHours, setDurationHours] = useState<number>(3);
  const [selectedVenueId, setSelectedVenueId] = useState(
    SECURE_PUBLIC_VENUES[0].id,
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);

  const selectedVenue = useMemo(() => {
    return (
      SECURE_PUBLIC_VENUES.find((v) => v.id === selectedVenueId) ||
      SECURE_PUBLIC_VENUES[0]
    );
  }, [selectedVenueId]);

  // Pricing calculations
  const companionFee = useMemo(() => {
    if (durationHours >= 5) {
      return companion.eveningRate;
    }
    return companion.hourlyRate * durationHours;
  }, [companion, durationHours]);

  const platformFee = useMemo(() => {
    return Math.round(companionFee * 0.1); // 10% frais conciergerie UP
  }, [companionFee]);

  const totalAmount = useMemo(() => {
    return companionFee + platformFee;
  }, [companionFee, platformFee]);

  const selectedServiceLabel = useMemo(() => {
    return (
      SERVICE_CATEGORIES.find((s) => s.id === selectedService)?.label ||
      "Accompagnement"
    );
  }, [selectedService]);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const reservationId = addReservation({
        companionId: companion.id,
        companionName: companion.name,
        companionAvatar: companion.avatar,
        companionZone: companion.zone,
        date,
        time,
        durationHours,
        venueName: selectedVenue.name,
        venueAddress: selectedVenue.address,
        serviceCategory: selectedService,
        serviceLabel: selectedServiceLabel,
        companionFee,
        platformFee,
        totalAmount,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      setCreatedReservationId(reservationId);
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);
    }, 600);
  };

  return (
    <div className="min-h-dvh bg-up-black pb-28 text-up-white">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-up-black/80 px-5 py-3.5 backdrop-blur-md">
        <Link
          href="/explore"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-up-surface px-3 py-1.5 text-xs font-medium text-up-gray transition hover:border-white/20 hover:text-up-white"
        >
          <ArrowLeft size={15} />
          <span>Explorer</span>
        </Link>

        <span className="font-display text-sm font-semibold tracking-wide text-up-gold">
          UP Prestige
        </span>

        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
            isFavorite
              ? "border-red-500/40 bg-red-500/15 text-red-400"
              : "border-white/10 bg-up-surface text-up-gray hover:text-up-white"
          }`}
          aria-label="Ajouter aux favoris"
        >
          <Heart size={16} className={isFavorite ? "fill-red-400" : ""} />
        </button>
      </header>

      {/* Hero Section / Photo Prestige */}
      <div className="relative aspect-[4/3] w-full bg-up-black">
        <Image
          src={companion.avatar}
          alt={companion.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-up-black via-up-black/40 to-transparent" />

        {/* Badge KYC Flottant */}
        <div className="absolute left-5 top-4 flex items-center gap-1.5 rounded-full border border-up-gold/50 bg-up-black/85 px-3 py-1 text-xs font-semibold text-up-gold backdrop-blur-md shadow-lg">
          <BadgeCheck size={16} className="text-up-gold" />
          <span>Identité Vérifiée (KYC)</span>
        </div>

        {/* Note moyenne */}
        <div className="absolute right-5 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-up-black/85 px-3 py-1 text-xs font-semibold text-up-white backdrop-blur-md">
          <Star size={14} className="fill-up-gold text-up-gold" />
          <span>{companion.rating.toFixed(1)}</span>
          <span className="text-up-gray">({companion.reviewCount} avis)</span>
        </div>

        {/* Titre & Localisation */}
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="font-display text-3xl font-bold tracking-tight text-up-white">
            {companion.name}, {companion.age} ans
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-up-gold-soft">
            <MapPin size={13} className="text-up-gold" />
            <span>Libreville · Quartier {companion.zone}</span>
          </p>
        </div>
      </div>

      <div className="px-5 pt-3">
        {/* Slogan / Headline */}
        <div className="rounded-2xl border border-up-gold/30 bg-gradient-to-br from-up-gold/15 to-transparent p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-up-gold">
            Spécialité &amp; Profil
          </p>
          <p className="mt-1 text-sm font-semibold text-up-white">
            {companion.headline}
          </p>
        </div>

        {/* Grille des tarifs */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-up-surface p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-up-gray">
              Tarif horaire
            </span>
            <p className="mt-1 font-display text-lg font-bold text-up-white">
              {companion.hourlyRate.toLocaleString("fr-FR")}{" "}
              <span className="text-xs font-normal text-up-gold">FCFA/h</span>
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-up-surface p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-up-gray">
              Forfait soirée (5h+)
            </span>
            <p className="mt-1 font-display text-lg font-bold text-up-white">
              {companion.eveningRate.toLocaleString("fr-FR")}{" "}
              <span className="text-xs font-normal text-up-gold">FCFA</span>
            </p>
          </div>
        </div>

        {/* Biographie & Détails */}
        <section className="mt-6">
          <h2 className="font-display text-lg font-bold text-up-white">
            Biographie &amp; Parcours
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-up-gray">
            {companion.bio}
          </p>
        </section>

        {/* Langues maîtrisées */}
        <section className="mt-5">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-up-gold">
            <Globe size={14} />
            Langues maîtrisées
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {companion.languages.map((lang) => (
              <span
                key={lang}
                className="rounded-xl border border-white/10 bg-up-surface px-3 py-1.5 text-xs font-medium text-up-white"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* Compétences & Spécialités */}
        <section className="mt-5">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-up-gold">
            <Sparkles size={14} />
            Domaines d&apos;excellence
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {companion.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 rounded-xl border border-up-gold/20 bg-up-gold/10 px-3 py-1.5 text-xs font-medium text-up-gold-soft"
              >
                <CheckCircle2 size={12} className="text-up-gold" />
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Formation académique */}
        {companion.education && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/5 bg-up-surface p-3.5 text-xs">
            <GraduationCap size={18} className="mt-0.5 shrink-0 text-up-gold" />
            <div>
              <p className="font-semibold text-up-white">Formation</p>
              <p className="mt-0.5 text-up-gray">{companion.education}</p>
            </div>
          </div>
        )}

        {/* Avis clients */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-up-white">
              Avis clients vérifiés ({companion.reviews.length})
            </h2>
            <div className="flex items-center gap-1 text-xs font-semibold text-up-gold">
              <Star size={13} className="fill-up-gold" />
              <span>{companion.rating.toFixed(1)} / 5</span>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {companion.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-white/10 bg-up-surface p-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-up-gold/15 font-semibold text-up-gold text-[11px]">
                      {rev.author.charAt(0)}
                    </span>
                    <div>
                      <p className="font-semibold text-up-white">{rev.author}</p>
                      <p className="text-[10px] text-up-gray">{rev.missionType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex text-up-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={
                            i < Math.floor(rev.rating)
                              ? "fill-up-gold text-up-gold"
                              : "text-white/20"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-up-gray ml-1">{rev.date}</span>
                  </div>
                </div>
                <p className="mt-2.5 leading-relaxed text-up-gray">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire de demande de mission */}
        <section id="reservation-form" className="mt-10">
          <div className="overflow-hidden rounded-3xl border border-up-gold/40 bg-gradient-to-b from-up-surface to-up-black p-5 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-up-gold/20 text-up-gold">
                <Calendar size={18} />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-up-white">
                  Demande de réservation
                </h2>
                <p className="text-[11px] text-up-gray">
                  Formulaire sécurisé UP Gabon
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="mt-4 space-y-4">
              {/* Type d'accompagnement */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-up-gold">
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
                            ? "border-up-gold bg-up-gold/15 text-up-white font-semibold shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                            : "border-white/10 bg-up-surface/80 text-up-gray hover:border-white/20 hover:text-up-white"
                        }`}
                      >
                        <span className="block font-medium">{s.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Heure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-xs font-semibold uppercase tracking-wider text-up-gray"
                  >
                    Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-up-surface px-3 py-2.5 text-xs text-up-white focus:border-up-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-time"
                    className="block text-xs font-semibold uppercase tracking-wider text-up-gray"
                  >
                    Heure
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-up-surface px-3 py-2.5 text-xs text-up-white focus:border-up-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Durée estimée */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-up-gray">
                  Durée estimée : <span className="text-up-gold font-bold">{durationHours}h {durationHours >= 5 ? "(Forfait soirée)" : ""}</span>
                </label>
                <div className="mt-2 flex gap-2">
                  {[2, 3, 4, 5, 6].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDurationHours(hrs)}
                      className={`flex-1 rounded-xl border py-2 text-xs font-medium transition ${
                        durationHours === hrs
                          ? "border-up-gold bg-up-gold text-up-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                          : "border-white/10 bg-up-surface text-up-gray hover:border-white/20 hover:text-up-white"
                      }`}
                    >
                      {hrs}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Sélection du Lieu Public Sécurisé */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="venue-select"
                    className="block text-xs font-semibold uppercase tracking-wider text-up-gold"
                  >
                    Lieu public sécurisé (Libreville)
                  </label>
                  <span className="flex items-center gap-1 text-[10px] text-up-gray">
                    <Shield size={11} className="text-up-gold" />
                    Protocole de sécurité
                  </span>
                </div>

                <div className="relative mt-1.5">
                  <select
                    id="venue-select"
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-up-surface py-2.5 pl-3 pr-8 text-xs text-up-white focus:border-up-gold focus:outline-none"
                  >
                    {SECURE_PUBLIC_VENUES.map((venue) => (
                      <option
                        key={venue.id}
                        value={venue.id}
                        className="bg-up-surface text-up-white"
                      >
                        {venue.name} ({venue.zone})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-up-gray"
                  />
                </div>

                {/* Détails sur le lieu sélectionné */}
                <div className="mt-2 rounded-xl border border-white/5 bg-white/5 p-2.5 text-[11px] text-up-gray">
                  <p className="flex items-center gap-1 font-medium text-up-white">
                    <MapPin size={12} className="text-up-gold" />
                    {selectedVenue.address}
                  </p>
                  <p className="mt-0.5 text-up-gold-soft">
                    {selectedVenue.securityNote}
                  </p>
                </div>
              </div>

              {/* Précisions / Instructions particulières */}
              <div>
                <label
                  htmlFor="booking-notes"
                  className="block text-xs font-semibold uppercase tracking-wider text-up-gray"
                >
                  Précisions &amp; Contexte (Optionnel)
                </label>
                <textarea
                  id="booking-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex : Table réservée au nom de M. Ndong, tenue de soirée exigée..."
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-up-surface p-3 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
                />
              </div>

              {/* Récapitulatif Financier Séquestre */}
              <div className="rounded-2xl border border-up-gold/20 bg-up-gold/5 p-4 text-xs">
                <div className="flex items-center justify-between text-up-gray">
                  <span>Honoraires prestataire ({durationHours}h)</span>
                  <span className="font-semibold text-up-white">
                    {companionFee.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-up-gray">
                  <span className="flex items-center gap-1">
                    Frais conciergerie UP &amp; Séquestre (10%)
                    <Info size={11} className="text-up-gold" />
                  </span>
                  <span className="font-semibold text-up-white">
                    {platformFee.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-sm font-bold text-up-white">
                  <span>Total consigné (Airtel / Moov)</span>
                  <span className="font-display text-base text-up-gold">
                    {totalAmount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <p className="mt-2.5 text-[10px] leading-relaxed text-up-gray">
                  💡 Vos fonds restent sécurisés sous séquestre jusqu&apos;à la
                  validation complète de la prestation en lieu public.
                </p>
              </div>

              {/* Bouton d'action principal */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-up-gold py-4 font-semibold text-up-black transition-all hover:bg-up-gold-soft hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-up-black border-t-transparent" />
                    Envoi en cours...
                  </span>
                ) : (
                  <span className="text-sm">
                    Envoyer la demande de réservation
                  </span>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Modal de confirmation de réservation */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-up-gold/50 bg-up-surface p-6 text-center shadow-[0_0_50px_rgba(212,175,55,0.3)]">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-up-gold/20 text-up-gold">
              <CheckCircle2 size={32} />
            </span>

            <h3 className="mt-4 font-display text-xl font-bold text-up-white">
              Demande envoyée !
            </h3>

            <p className="mt-2 text-xs text-up-gray">
              Votre demande a été transmise à{" "}
              <span className="font-semibold text-up-white">
                {companion.name}
              </span>
              . Vous recevrez une notification dès acceptation.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-up-black/50 p-3 text-left text-xs space-y-1.5 text-up-gray">
              <p className="flex justify-between">
                <span>Mission :</span>
                <span className="font-semibold text-up-white">
                  {selectedServiceLabel}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Date &amp; Heure :</span>
                <span className="font-semibold text-up-white">
                  {date} à {time}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Lieu :</span>
                <span className="font-semibold text-up-white truncate max-w-[150px]">
                  {selectedVenue.name}
                </span>
              </p>
              <p className="flex justify-between border-t border-white/5 pt-1.5 text-up-gold">
                <span>Montant consigné :</span>
                <span className="font-bold">
                  {totalAmount.toLocaleString("fr-FR")} FCFA
                </span>
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={`/client/paiement/${createdReservationId}`}
                className="w-full rounded-xl bg-up-gold py-3 text-xs font-bold text-up-black transition hover:bg-up-gold-soft shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-1.5"
              >
                <Lock size={14} />
                <span>Consigner les fonds (Airtel / Moov)</span>
              </Link>
              <Link
                href="/client/reservations"
                className="w-full rounded-xl border border-white/10 py-2.5 text-xs font-medium text-up-gray transition hover:text-up-white"
              >
                Voir mes réservations
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
