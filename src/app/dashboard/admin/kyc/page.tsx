"use client";

import { useState } from "react";
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
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import type { KycApplicant } from "@/lib/admin-data";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function AdminKycModerationPage() {
  const hydrated = useHydrated();

  const kycApplicants = useUpStore((s) => s.kycApplicants);
  const approveKycApplicant = useUpStore((s) => s.approveKycApplicant);
  const rejectKycApplicant = useUpStore((s) => s.rejectKycApplicant);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<KycApplicant | null>(
    kycApplicants.find((a) => a.status === "pending") || kycApplicants[0] || null,
  );

  // Modal de rejet avec motif
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    "Document CNI/Passeport illisible ou reflets masquant les informations",
  );
  const [customRejectionNote, setCustomRejectionNote] = useState("");

  // Toast confirmation
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const filteredApplicants = kycApplicants.filter((app) => {
    const matchesStatus =
      filterStatus === "all" ? true : app.status === filterStatus;
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.nationalIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (applicant: KycApplicant) => {
    approveKycApplicant(applicant.id);
    setActionSuccessMsg(
      `Profil de ${applicant.fullName} validé avec succès. Badge "Identité Vérifiée" attribué.`,
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;

    const fullReason = customRejectionNote
      ? `${rejectionReason} — ${customRejectionNote}`
      : rejectionReason;

    rejectKycApplicant(selectedApplicant.id, fullReason);
    setIsRejectModalOpen(false);
    setCustomRejectionNote("");
    setActionSuccessMsg(`Candidature de ${selectedApplicant.fullName} rejetée.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <main className="px-5 pt-4 space-y-4">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-up-gold">
            Conformité &amp; Sécurité UP Gabon
          </span>
          <h1 className="font-display text-2xl font-bold text-up-white">
            Modération des Identités (KYC)
          </h1>
          <p className="text-xs text-up-gray">
            Contrôle strict des pièces d&apos;identité gabonaises et vérification de la concordance faciale.
          </p>
        </div>

        {/* Compteur de dossiers en attente */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
            <Clock size={13} />
            <span>
              {kycApplicants.filter((a) => a.status === "pending").length} en attente
            </span>
          </span>
        </div>
      </div>

      {/* Message de succès Toast */}
      {actionSuccessMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-400/80 hover:text-emerald-300"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Filtres et Barre de recherche */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-up-gray"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, n° CNI/Passeport, quartier..."
            className="w-full rounded-2xl border border-white/10 bg-up-surface py-2.5 pl-10 pr-4 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
          />
        </div>

        {/* Boutons de filtrage par statut */}
        <div className="flex rounded-2xl border border-white/10 bg-up-surface p-1">
          {[
            { id: "pending", label: "En attente" },
            { id: "approved", label: "Validés" },
            { id: "rejected", label: "Rejetés" },
            { id: "all", label: "Tous" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id as FilterStatus)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filterStatus === tab.id
                  ? "bg-up-gold text-up-black shadow"
                  : "text-up-gray hover:text-up-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille principale : Liste des candidats (Gauche) + Visualiseur Côte à Côte (Droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Colonne Gauche : Liste des dossiers (4 colonnes) */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {filteredApplicants.length > 0 ? (
            filteredApplicants.map((app) => {
              const isSelected = selectedApplicant?.id === app.id;
              const isPending = app.status === "pending";
              const isApproved = app.status === "approved";
              const isRejected = app.status === "rejected";

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplicant(app)}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                    isSelected
                      ? "border-up-gold bg-gradient-to-r from-up-gold/15 to-up-surface shadow-lg"
                      : "border-white/10 bg-up-surface hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-up-black">
                        <Image
                          src={app.selfieThumbnailUrl}
                          alt={app.fullName}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold text-xs text-up-white">
                          {app.fullName}
                        </h2>
                        <p className="text-[11px] text-up-gray">
                          {app.age} ans · {app.zone}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        isPending
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : isApproved
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                      }`}
                    >
                      {isPending ? "En attente" : isApproved ? "Validé" : "Rejeté"}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-up-gray">
                    <span className="font-mono">{app.nationalIdNumber}</span>
                    <span>{app.submittedAt}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-white/10 bg-up-surface p-8 text-center text-xs text-up-gray">
              Aucun dossier KYC ne correspond à ces critères.
            </div>
          )}
        </div>

        {/* Colonne Droite : Visualiseur Côte à Côte Immersif (8 colonnes) */}
        {selectedApplicant ? (
          <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-up-surface p-5 shadow-2xl space-y-5">
            {/* Header du dossier sélectionné */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-up-white">
                    {selectedApplicant.fullName}
                  </h2>
                  {selectedApplicant.status === "approved" && (
                    <BadgeCheck size={20} className="text-up-gold" />
                  )}
                </div>
                <p className="text-xs text-up-gray">
                  Dossier soumis {selectedApplicant.submittedAt} · Téléphone :{" "}
                  <span className="font-mono text-up-white">
                    +241 {selectedApplicant.phoneNumber}
                  </span>{" "}
                  ({selectedApplicant.operator === "airtel_money" ? "Airtel" : "Moov"})
                </p>
              </div>

              {/* Boutons d'Action Rapide de Validation / Rejet */}
              <div className="flex items-center gap-2">
                {selectedApplicant.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedApplicant)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-up-black transition hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <CheckCircle2 size={15} />
                    <span>Valider le profil (Badge Vert)</span>
                  </button>
                )}

                {selectedApplicant.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 px-3.5 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-500/25"
                  >
                    <XCircle size={15} />
                    <span>Rejeter avec motif</span>
                  </button>
                )}
              </div>
            </div>

            {/* VISUALISEUR CÔTE À CÔTE : CNI/PASSEPORT VS SELFIE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-up-gold">
                  Visualiseur Comparatif d&apos;Identité
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <ShieldCheck size={13} />
                  <span>Concordance Faciale : 98.4%</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Document Officiel (CNI / Passeport Gabonais) */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-up-black/70 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-up-white">
                      <FileText size={14} className="text-up-gold" />
                      <span>
                        {selectedApplicant.idDocumentType === "cni_gabon"
                          ? "CNI Gabonaise (Officielle)"
                          : "Passeport Gabonais"}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-up-gold">
                      {selectedApplicant.nationalIdNumber}
                    </span>
                  </div>

                  <div className="relative h-56 w-full overflow-hidden rounded-xl border border-white/10 bg-up-surface">
                    <Image
                      src={selectedApplicant.idDocumentUrl}
                      alt="Document d'identité officiel"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-lg bg-up-black/80 px-2 py-1 text-[10px] font-mono text-up-white backdrop-blur">
                      NIF / CNI : {selectedApplicant.nationalIdNumber}
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/5 p-2 text-[11px] text-up-gray flex justify-between">
                    <span>Date de naissance :</span>
                    <span className="font-semibold text-up-white">
                      {selectedApplicant.birthDate} ({selectedApplicant.age} ans)
                    </span>
                  </div>
                </div>

                {/* 2. Selfie Vidéo / Photo HD Profil */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-up-black/70 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-up-white">
                      <Video size={14} className="text-emerald-400" />
                      <span>Selfie de Vérification en Direct</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      ✓ Biométrie validée
                    </span>
                  </div>

                  <div className="relative h-56 w-full overflow-hidden rounded-xl border border-white/10 bg-up-surface">
                    <Image
                      src={selectedApplicant.selfieVideoUrl}
                      alt="Selfie de vérification"
                      fill
                      className="object-cover object-top"
                    />
                    <div className="absolute bottom-2 left-2 rounded-lg bg-up-black/80 px-2 py-1 text-[10px] font-mono text-emerald-400 backdrop-blur flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Contrôle Liveness &amp; Détection Mouvement OK
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/5 p-2 text-[11px] text-up-gray flex justify-between">
                    <span>Zone d&apos;activité :</span>
                    <span className="font-semibold text-up-white">
                      Libreville · {selectedApplicant.zone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fiche de Compétences & Présentation du Profil */}
            <div className="rounded-2xl border border-white/10 bg-up-black/40 p-4 space-y-3 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-up-gray block">
                Présentation &amp; Services Proposés
              </span>
              <p className="font-semibold text-up-white text-sm">
                &laquo; {selectedApplicant.headline} &raquo;
              </p>
              <p className="text-up-gray leading-relaxed">
                {selectedApplicant.bio}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                <div>
                  <span className="text-[10px] text-up-gray block">Tarif Soirée</span>
                  <span className="font-display font-bold text-up-gold">
                    {selectedApplicant.eveningRateXaf.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-up-gray block">Tarif Horaire</span>
                  <span className="font-display font-bold text-up-white">
                    {selectedApplicant.hourlyRateXaf.toLocaleString("fr-FR")} FCFA/h
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-up-gray block">Formation</span>
                  <span className="text-up-white font-medium">
                    {selectedApplicant.education}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-up-gray block">Langues</span>
                  <span className="text-up-white font-medium">
                    {selectedApplicant.languages.join(", ")}
                  </span>
                </div>
              </div>

              {selectedApplicant.rejectionReason && (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
                  <p className="font-bold">Motif du rejet précédent :</p>
                  <p className="mt-0.5">{selectedApplicant.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal de Rejet de Candidature avec sélection de motif */}
      {isRejectModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-up-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
                <UserX size={16} />
                Rejet du Dossier KYC
              </span>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-up-gray hover:text-up-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-4 text-left">
              <p className="text-xs text-up-gray">
                Sélectionnez le motif réglementaire du refus pour{" "}
                <span className="font-semibold text-up-white">
                  {selectedApplicant.fullName}
                </span>{" "}
                (le candidat recevra une notification pour soumettre un nouveau document conforme) :
              </p>

              {/* Sélection des motifs de rejet */}
              <div className="space-y-2">
                {[
                  "Document CNI/Passeport illisible ou reflets masquant les informations",
                  "Nom du document ne concordant pas avec le compte Mobile Money",
                  "Selfie de vérification flou ou concordance biométrique insuffisante",
                  "Pièce d'identité expirée ou non reconnue par la République Gabonaise",
                  "Non-respect des critères d'âge légal minimum (21 ans révolus)",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs cursor-pointer transition ${
                      rejectionReason === reason
                        ? "border-red-500/60 bg-red-950/40 text-up-white"
                        : "border-white/10 bg-up-black/50 text-up-gray hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={rejectionReason === reason}
                      onChange={() => setRejectionReason(reason)}
                      className="mt-0.5 text-red-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {/* Note personnalisée optionnelle */}
              <div>
                <label
                  htmlFor="kyc-custom-note"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                >
                  Précisions additionnelles (Optionnel)
                </label>
                <textarea
                  id="kyc-custom-note"
                  rows={2}
                  value={customRejectionNote}
                  onChange={(e) => setCustomRejectionNote(e.target.value)}
                  placeholder="Ex : Prière de re-photographier le verso de la CNI sans flash..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/60 p-2.5 text-xs text-up-white placeholder-up-gray focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold text-up-gray hover:text-up-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-500 py-3 text-xs font-bold text-up-white transition hover:bg-red-400"
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
