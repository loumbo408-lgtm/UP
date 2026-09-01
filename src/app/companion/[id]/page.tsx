"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building,
  Calendar,
  CheckCircle2,
  Globe,
  GraduationCap,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import {
  SECURE_PUBLIC_VENUES,
  SERVICE_CATEGORIES,
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
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking Form state
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

  // Calculations
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

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/companion/${id}`);
      return;
    }

    if (!companion) return;
    setIsSubmitting(true);

    try {
      // 1. Persistance réelle dans la base de données PostgreSQL (table missions)
      let dbMissionId = null;
      try {
        const res = await fetch("/api/missions/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companionId: companion.id,
            date,
            time,
            durationHours,
            venueName: selectedVenue.name,
            venueAddress: selectedVenue.address,
            serviceCategory: selectedService,
            companionFee,
            platformFee,
            notes,
          }),
        });
        const data = await res.json();
        if (res.ok && data.missionId) {
          dbMissionId = data.missionId;
        }
      } catch (apiErr) {
        console.warn("Missions API create warning:", apiErr);
      }

      // 2. Enregistrement synchrone dans le store pour affichage instantané
      const newId = addReservation({
        companionId: companion.id,
        companionName: companion.name,
        companionAvatar: companion.avatar,
        companionZone: companion.zone,
        date: date,
        time: time,
        durationHours: durationHours,
        venueName: selectedVenue.name,
        venueAddress: selectedVenue.address,
        serviceCategory: selectedService,
        serviceLabel: selectedServiceLabel,
        companionFee: companionFee,
        platformFee: platformFee,
        totalAmount: totalAmount,
        notes: notes,
      });

      setCreatedReservationId(dbMissionId || newId);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell showHeader={true} showBottomNav={false} maxWidth="lg">
        <div className="py-16 text-center space-y-4">
          <div className="aspect-[4/3] w-full rounded-3xl bg-white animate-pulse border border-[#F0E6F3]" />
          <div className="h-6 w-1/2 mx-auto rounded-lg bg-up-100 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!companion) {
    return (
      <AppShell showHeader={true} showBottomNav={false} maxWidth="md">
        <div className="py-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-up-50 text-up-500">
            <ShieldCheck size={30} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-[#1D0F24]">
            Profil en cours d&apos;agrément
          </h1>
          <p className="mt-2 text-xs text-[#6B5D73]">
            Ce profil est en cours de validation par nos équipes de modération ou n&apos;est plus actif au Gabon.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-up-500 hover:bg-up-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98]"
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
      <div className="pt-2 pb-16">
        {/* ===================================================================
            1. NAVIGATION SUPÉRIEURE : RETOUR & FAVORIS
            =================================================================== */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-full border border-[#F0E6F3] bg-white px-4 py-2 text-xs font-semibold text-[#1D0F24] shadow-xs transition hover:border-up-200 hover:text-up-700"
          >
            <ArrowLeft size={15} />
            <span>Tous les profils</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`grid h-10 w-10 place-items-center rounded-full border shadow-xs transition ${
              isFavorite
                ? "border-red-300 bg-red-50 text-red-500"
                : "border-[#F0E6F3] bg-white text-[#6B5D73] hover:text-[#1D0F24]"
            }`}
            aria-label="Ajouter aux favoris"
          >
            <Heart size={18} className={isFavorite ? "fill-red-500" : ""} />
          </button>
        </div>

        {/* ===================================================================
            2. GRANDE IMAGE PROFESSIONNELLE IMMERSIVE (VIOLET & BLANC)
            =================================================================== */}
        <div className="relative aspect-[4/5] sm:aspect-[16/11] w-full overflow-hidden rounded-3xl border border-[#F0E6F3] bg-[#1D0F24] shadow-lg">
          <Image
            src={companion.avatar}
            alt={companion.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 768px"
            className="object-cover object-top"
          />
          {/* Dégradé sombre progressif */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1D0F24] via-[#1D0F24]/40 to-transparent" />

          {/* Badge Identité Vérifiée en Violet Pastel */}
          <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 text-up-700 px-3.5 py-1 text-xs font-bold shadow-xs">
            <BadgeCheck size={15} className="text-up-500" />
            <span>Identité vérifiée (KYC)</span>
          </div>

          {/* Statut Disponibilité */}
          <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-white/20 bg-[#1D0F24]/75 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span>Disponible pour réservation</span>
          </div>

          {/* Nom public, zone et tarif */}
          <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {companion.name}
              </h1>
              <span className="font-display text-xl font-bold text-up-300">
                {companion.hourlyRate.toLocaleString("fr-FR")}{" "}
                <span className="text-xs font-normal text-up-100">FCFA/h</span>
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
                <MapPin size={12} className="text-up-300" />
                <span>Libreville · {companion.zone}</span>
              </span>

              {companion.reviewCount > 0 && companion.rating > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{companion.rating.toFixed(1)} ({companion.reviewCount} avis)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================
            3. BANNIÈRE DE SÉCURITÉ OBLIGATOIRE
            =================================================================== */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-up-200 bg-up-50/70 p-4 text-xs font-semibold text-up-700 shadow-xs">
          <Building size={20} className="shrink-0 text-up-500" />
          <span>
            Les rendez-vous doivent avoir lieu exclusivement dans un espace public autorisé (restaurant, hôtel, salon d&apos;affaires certifié).
          </span>
        </div>

        {/* ===================================================================
            4. SECTIONS DÉTAILLÉES DU PROFIL
            =================================================================== */}
        <div className="mt-6 space-y-5">
          {/* Présentation */}
          <section className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
            <h2 className="font-display text-lg font-bold text-[#1D0F24]">
              Présentation
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#1D0F24]">
              {companion.bio}
            </p>

            {companion.education && (
              <div className="mt-4 flex items-start gap-2.5 border-t border-[#F0E6F3] pt-4 text-xs text-[#6B5D73]">
                <GraduationCap size={16} className="text-up-500 shrink-0 mt-0.5" />
                <span><strong className="text-[#1D0F24]">Formation :</strong> {companion.education}</span>
              </div>
            )}
          </section>

          {/* Services autorisés & Langues */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Services autorisés */}
            <section className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
              <h3 className="font-display text-base font-bold text-[#1D0F24]">
                Services autorisés
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {companion.services.map((srv) => (
                  <span
                    key={srv}
                    className="inline-flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-3.5 py-1.5 text-xs font-semibold text-up-700"
                  >
                    <span className="text-up-500">✦</span>
                    <span>{srv.replace("_", " ")}</span>
                  </span>
                ))}
              </div>
            </section>

            {/* Langues maîtrisées */}
            <section className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
              <h3 className="font-display text-base font-bold text-[#1D0F24] flex items-center gap-2">
                <Globe size={16} className="text-up-500" />
                <span>Langues</span>
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {companion.languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-[#F0E6F3] bg-[#FAF9FB] px-3.5 py-1.5 text-xs font-semibold text-[#1D0F24]"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Tarifs & Zones disponibles */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Tarifs */}
            <section className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
              <h3 className="font-display text-base font-bold text-[#1D0F24] flex items-center gap-2">
                <Wallet size={16} className="text-up-500" />
                <span>Tarifs</span>
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-[#FAF9FB] p-3 border border-[#F0E6F3]">
                  <span className="text-[#6B5D73]">Tarif horaire</span>
                  <span className="font-bold text-[#1D0F24] text-sm">
                    {companion.hourlyRate.toLocaleString("fr-FR")} FCFA/h
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#FAF9FB] p-3 border border-[#F0E6F3]">
                  <span className="text-[#6B5D73]">Forfait soirée (dès 5h)</span>
                  <span className="font-bold text-[#1D0F24] text-sm">
                    {companion.eveningRate.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>
            </section>

            {/* Zones disponibles */}
            <section className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
              <h3 className="font-display text-base font-bold text-[#1D0F24] flex items-center gap-2">
                <MapPin size={16} className="text-up-500" />
                <span>Zones disponibles</span>
              </h3>
              <div className="mt-3">
                <p className="text-xs text-[#6B5D73]">
                  Déplacements assurés dans les établissements certifiés de :
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-up-50 border border-up-200 px-3.5 py-1.5 text-xs font-bold text-up-700">
                    {companion.zone}
                  </span>
                  <span className="rounded-full border border-[#F0E6F3] bg-[#FAF9FB] px-3.5 py-1.5 text-xs text-[#6B5D73]">
                    Libreville &amp; Alentours
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Avis Vérifiés */}
          <section className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
            <h3 className="font-display text-base font-bold text-[#1D0F24] flex items-center justify-between">
              <span>Avis vérifiés</span>
              {companion.reviewCount > 0 && (
                <span className="text-xs font-semibold text-up-700">
                  {companion.reviewCount} avis client
                </span>
              )}
            </h3>

            {companion.reviewCount > 0 ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-[#FAF9FB] p-4 text-xs border border-[#F0E6F3]">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-2 text-[#1D0F24] leading-relaxed">
                    « Prestation remarquable lors de notre dîner d&apos;affaires. Ponctualité, élocution parfaite et respect absolu des règles. »
                  </p>
                  <p className="mt-2 text-[10px] text-[#6B5D73]">
                    Client vérifié · Mission réalisée à Libreville
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#6B5D73]">
                Ce prestataire n&apos;a pas encore reçu d&apos;avis public.
              </p>
            )}
          </section>

          {/* ===============================================================
              5. FORMULAIRE DE RÉSERVATION EN LIEU PUBLIC (VIOLET & BLANC)
              =============================================================== */}
          <section className="rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 shadow-xs hover:shadow-md transition">
            <div className="flex items-center gap-3 border-b border-[#F0E6F3] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-50 text-up-600">
                <Calendar size={20} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-[#1D0F24]">
                  Demande de présence encadrée
                </h3>
                <p className="text-xs text-[#6B5D73]">
                  Réservation directe avec séquestre sécurisé
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="mt-6 space-y-4">
              {/* Type de prestation */}
              <div>
                <label className="block text-xs font-bold text-[#1D0F24] mb-1.5">
                  Type de prestation
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none font-medium"
                >
                  {SERVICE_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Heure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1D0F24] mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D0F24] mb-1.5">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Durée */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#1D0F24]">Durée de présence</span>
                  <span className="font-bold text-up-700">{durationHours} heures</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                  className="w-full accent-[#8807A8]"
                />
              </div>

              {/* Lieu Public Certifié */}
              <div>
                <label className="block text-xs font-bold text-[#1D0F24] mb-1.5">
                  Lieu public partenaire autorisé
                </label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none font-medium"
                >
                  {SECURE_PUBLIC_VENUES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.zone}) — {v.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Récapitulatif Tarifaire */}
              <div className="rounded-2xl border border-[#F0E6F3] bg-up-50/50 p-4 text-xs space-y-2">
                <div className="flex justify-between text-[#6B5D73]">
                  <span>Honoraires prestataire ({durationHours}h) :</span>
                  <span className="font-semibold text-[#1D0F24]">
                    {companionFee.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-[#6B5D73]">
                  <span>Frais de conciergerie UP (10%) :</span>
                  <span className="font-semibold text-up-700">
                    {platformFee.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#F0E6F3] pt-2 text-sm font-bold text-[#1D0F24]">
                  <span>Total à bloquer sous séquestre :</span>
                  <span className="text-up-700">
                    {totalAmount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>

              {/* Bouton Principal : Demander une présence */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-4 text-sm font-bold transition disabled:opacity-50"
              >
                <Calendar size={16} />
                <span>
                  {isAuthenticated
                    ? "Demander une présence"
                    : "Se connecter pour demander une présence"}
                </span>
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* ===================================================================
          6. MODAL DE CONFIRMATION DE DEMANDE (VIOLET ROYAL & BLANC)
          =================================================================== */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={32} />
            </span>

            <h3 className="font-display text-xl font-bold text-[#1D0F24]">
              Demande envoyée avec succès !
            </h3>

            <p className="text-xs text-[#6B5D73] leading-relaxed">
              Votre demande a été transmise à <strong>{companion.name}</strong> pour le <strong>{date}</strong> à <strong>{time}</strong> au <strong>{selectedVenue.name}</strong>.
            </p>

            <div className="rounded-2xl bg-[#FAF9FB] p-4 text-xs text-left space-y-1.5 border border-[#F0E6F3]">
              <div className="flex justify-between">
                <span className="text-[#6B5D73]">Montant bloqué sous séquestre :</span>
                <span className="font-bold text-up-700">{totalAmount.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5D73]">Lieu de rencontre :</span>
                <span className="font-medium text-[#1D0F24]">{selectedVenue.name}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`/client/paiement/${createdReservationId}`}
                className="w-full rounded-full bg-up-500 hover:bg-up-600 py-3 text-xs font-bold text-white transition shadow-md shadow-up-500/20 active:scale-[0.98]"
              >
                Payer sous séquestre Mobile Money
              </Link>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full rounded-full border border-[#F0E6F3] bg-white py-3 text-xs font-semibold text-[#6B5D73] hover:text-[#1D0F24]"
              >
                Voir plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
