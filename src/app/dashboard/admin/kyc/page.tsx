"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  MapPin,
  Maximize2,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserX,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RealKycApplicant {
  id: string;
  fullName: string;
  role: string;
  phoneNumber: string;
  avatarUrl: string;
  idCardUrl?: string;
  zone: string;
  bio: string;
  hourlyRateXaf: number;
  eveningRateXaf: number;
  services: string[];
  languages: string[];
  education: string;
  submittedAt: string;
  status: "pending" | "verified" | "rejected";
}

export default function AdminKycModerationPage() {
  const [applicants, setApplicants] = useState<RealKycApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<RealKycApplicant | null>(null);

  // Modal de rejet avec motif
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    "Document CNI/Passeport illisible ou informations non conformes",
  );
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadApplicants = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          role,
          phone,
          avatar_url,
          id_card_url,
          kyc_status,
          created_at,
          companion_details (
            bio,
            education_level,
            languages,
            services_offered,
            hourly_rate_xaf,
            evening_rate_xaf,
            zone_preference
          )
        `);

      if (!error && data) {
        const mapped: RealKycApplicant[] = data.map((p: any) => {
          const details = Array.isArray(p.companion_details)
            ? p.companion_details[0]
            : p.companion_details;

          return {
            id: p.id,
            fullName: p.full_name || "Candidat Sans Nom",
            role: p.role || "companion",
            phoneNumber: p.phone || "Non renseigné",
            avatarUrl:
              p.avatar_url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
            idCardUrl: p.id_card_url,
            zone: details?.zone_preference || "Libreville",
            bio: details?.bio || "Aucune biographie fournie.",
            hourlyRateXaf: details?.hourly_rate_xaf || 25000,
            eveningRateXaf: details?.evening_rate_xaf || 75000,
            services: details?.services_offered || ["diner_affaires"],
            languages: details?.languages || ["Français"],
            education: details?.education_level || "Non renseigné",
            submittedAt: p.created_at
              ? new Date(p.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Récemment",
            status: (p.kyc_status as any) || "pending",
          };
        });

        setApplicants(mapped);
        if (!selectedApplicant && mapped.length > 0) {
          const firstPending = mapped.find((a) => a.status === "pending") || mapped[0];
          setSelectedApplicant(firstPending);
        }
      }
    } catch (err) {
      console.error("Error loading KYC applicants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, []);

  const handleApprove = async (applicant: RealKycApplicant) => {
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ kyc_status: "verified" })
        .eq("id", applicant.id);

      setActionSuccessMsg(
        `Candidature de ${applicant.fullName} approuvée. Le profil est désormais certifié et visible !`,
      );
      loadApplicants();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch {
      // ignore
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;

    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ kyc_status: "rejected" })
        .eq("id", selectedApplicant.id);

      setIsRejectModalOpen(false);
      setActionSuccessMsg(`Candidature de ${selectedApplicant.fullName} rejetée.`);
      loadApplicants();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch {
      // ignore
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesStatus =
      filterStatus === "all" ? true : app.status === filterStatus;
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="px-4 sm:px-6 pt-4 pb-12 space-y-4 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
            Conformité &amp; Sécurité UP Gabon
          </span>
          <h1 className="font-display text-2xl font-bold text-[#FAFAF9] sm:text-3xl">
            Modération des Identités (KYC)
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            Contrôle des pièces d&apos;identité gabonaises et agrément des comptes réels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadApplicants}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#151518] px-3.5 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAF9]"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Actualiser</span>
          </button>
          <span className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-3 py-1.5 text-xs font-bold text-[#D4AF37]">
            <Clock size={13} />
            <span>
              {applicants.filter((a) => a.status === "pending").length} en attente
            </span>
          </span>
        </div>
      </div>

      {/* Message de succès */}
      {actionSuccessMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/10 p-4 text-xs text-[#22C55E] animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Barre de Recherche & Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un candidat par nom, quartier..."
            className="w-full rounded-2xl border border-white/10 bg-[#151518] py-2.5 pl-10 pr-4 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 rounded-full border border-white/10 bg-[#151518] p-1">
          {(["pending", "verified", "rejected", "all"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                filterStatus === st
                  ? "bg-[#D4AF37] text-[#0B0B0D]"
                  : "text-[#A1A1AA] hover:text-[#FAFAF9]"
              }`}
            >
              {st === "pending"
                ? "En attente"
                : st === "verified"
                ? "Validés"
                : st === "rejected"
                ? "Rejetés"
                : "Tous"}
            </button>
          ))}
        </div>
      </div>

      {/* Grille principale : Liste des candidats + Panneau de détail */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Colonne de gauche : Liste des dossiers */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
          {filteredApplicants.length > 0 ? (
            filteredApplicants.map((applicant) => {
              const isSelected = selectedApplicant?.id === applicant.id;
              return (
                <div
                  key={applicant.id}
                  onClick={() => setSelectedApplicant(applicant)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                      : "border-white/10 bg-[#151518] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#0B0B0D]">
                      <Image
                        src={applicant.avatarUrl}
                        alt={applicant.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs font-bold text-[#FAFAF9]">
                          {applicant.fullName}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            applicant.status === "verified"
                              ? "bg-[#22C55E]/15 text-[#22C55E]"
                              : applicant.status === "rejected"
                              ? "bg-[#EF4444]/15 text-[#EF4444]"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {applicant.status === "verified"
                            ? "Vérifié"
                            : applicant.status === "rejected"
                            ? "Rejeté"
                            : "En attente"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#D4AF37]" />
                        <span>{applicant.zone}</span>
                        <span>·</span>
                        <span>{applicant.phoneNumber}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#151518] p-8 text-center text-xs text-[#A1A1AA]">
              Aucun dossier KYC trouvé.
            </div>
          )}
        </div>

        {/* Colonne de droite : Panneau de détail & Actions */}
        <div className="lg:col-span-7">
          {selectedApplicant ? (
            <div className="rounded-[28px] border border-[rgba(212,175,55,0.22)] bg-[#151518] p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[#D4AF37]">
                    <Image
                      src={selectedApplicant.avatarUrl}
                      alt={selectedApplicant.fullName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#FAFAF9]">
                      {selectedApplicant.fullName}
                    </h2>
                    <p className="text-xs text-[#D4AF37]">
                      {selectedApplicant.phoneNumber} · {selectedApplicant.zone}
                    </p>
                  </div>
                </div>

                {selectedApplicant.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedApplicant)}
                      className="flex items-center gap-1.5 rounded-full bg-[#22C55E] px-4 py-2 text-xs font-bold text-[#0B0B0D] hover:bg-[#22C55E]/90"
                    >
                      <Check size={14} />
                      <span>Approuver</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-full border border-[#EF4444]/40 bg-[#EF4444]/10 px-3.5 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/20"
                    >
                      <X size={14} />
                      <span>Rejeter</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Détails du profil */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-white/5 bg-[#0B0B0D] p-3">
                  <span className="text-[10px] text-[#A1A1AA] uppercase">Tarif horaire</span>
                  <p className="font-bold text-[#FAFAF9] text-sm mt-0.5">
                    {selectedApplicant.hourlyRateXaf.toLocaleString("fr-FR")} FCFA/h
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-[#0B0B0D] p-3">
                  <span className="text-[10px] text-[#A1A1AA] uppercase">Forfait soirée</span>
                  <p className="font-bold text-[#FAFAF9] text-sm mt-0.5">
                    {selectedApplicant.eveningRateXaf.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0B0B0D] p-4 text-xs space-y-2">
                <p className="font-bold text-[#FAFAF9]">Biographie &amp; Parcours :</p>
                <p className="text-[#A1A1AA] leading-relaxed">{selectedApplicant.bio}</p>
                {selectedApplicant.education && (
                  <p className="text-[#D4AF37] pt-2 border-t border-white/5">
                    🎓 Formation : {selectedApplicant.education}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {selectedApplicant.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-[#202024] px-3 py-1 text-[11px] text-[#FAFAF9]"
                  >
                    {s.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid place-items-center rounded-[28px] border border-white/10 bg-[#151518] p-12 text-center text-xs text-[#A1A1AA]">
              Sélectionnez un dossier à modérer.
            </div>
          )}
        </div>
      </div>

      {/* Modal Rejet */}
      {isRejectModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-[#EF4444]/40 bg-[#151518] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#FAFAF9]">
              Rejeter la candidature de {selectedApplicant.fullName}
            </h3>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Précisez le motif du rejet pour informer le prestataire.
            </p>
            <form onSubmit={handleConfirmReject} className="mt-4 space-y-3">
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0B0D] p-3 text-xs text-[#FAFAF9]"
              >
                <option value="Document CNI/Passeport illisible ou reflets masquant les informations">
                  Document CNI/Passeport illisible
                </option>
                <option value="Photo de profil non conforme aux standards UP">
                  Photo de profil non conforme
                </option>
                <option value="Numéro de téléphone ou identité non valide">
                  Numéro ou identité invalide
                </option>
              </select>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-[#A1A1AA] hover:text-[#FAFAF9]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#EF4444] px-4 py-2 text-xs font-bold text-[#FAFAF9]"
                >
                  Confirmer le rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
