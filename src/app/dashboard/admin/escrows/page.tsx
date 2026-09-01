"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Filter,
  History,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import type { AdminEscrowRecord } from "@/lib/admin-data";

type EscrowFilter = "all" | "held" | "disputed" | "released" | "refunded";

export default function AdminEscrowsDisputesPage() {
  const hydrated = useHydrated();

  const adminEscrows = useUpStore((s) => s.adminEscrows);
  const forceReleaseAdminEscrow = useUpStore((s) => s.forceReleaseAdminEscrow);
  const forceRefundAdminEscrow = useUpStore((s) => s.forceRefundAdminEscrow);

  const [filter, setFilter] = useState<EscrowFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEscrow, setSelectedEscrow] = useState<AdminEscrowRecord | null>(
    adminEscrows.find((e) => e.status === "disputed") || adminEscrows[0] || null,
  );

  // Modal d'arbitrage
  const [arbitrationAction, setArbitrationAction] = useState<
    "force_release" | "force_refund" | null
  >(null);
  const [arbitrationNote, setArbitrationNote] = useState("");
  const [isProcessingArbitration, setIsProcessingArbitration] = useState(false);
  const [arbitrationToast, setArbitrationToast] = useState<string | null>(null);

  const filteredEscrows = adminEscrows.filter((esc) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "held"
          ? esc.status === "held"
          : filter === "disputed"
            ? esc.status === "disputed"
            : filter === "released"
              ? esc.status === "released_to_companion"
              : esc.status === "refunded_to_client";

    const matchesSearch =
      esc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.companionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.venueName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalHeldAmountXaf = adminEscrows
    .filter((e) => e.status === "held" || e.status === "disputed")
    .reduce((sum, e) => sum + e.totalAmountXaf, 0);

  const handleExecuteArbitration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscrow || !arbitrationAction) return;

    setIsProcessingArbitration(true);

    setTimeout(() => {
      if (arbitrationAction === "force_release") {
        forceReleaseAdminEscrow(selectedEscrow.id, arbitrationNote);
        setArbitrationToast(
          `Arbitrage exécuté : ${selectedEscrow.companionFeeXaf.toLocaleString(
            "fr-FR",
          )} FCFA débloqués et versés à ${selectedEscrow.companionName}.`,
        );
      } else {
        forceRefundAdminEscrow(selectedEscrow.id, arbitrationNote);
        setArbitrationToast(
          `Arbitrage exécuté : ${selectedEscrow.totalAmountXaf.toLocaleString(
            "fr-FR",
          )} FCFA intégralement remboursés sur le compte Mobile Money de ${
            selectedEscrow.clientName
          }.`,
        );
      }

      setIsProcessingArbitration(false);
      setArbitrationAction(null);
      setArbitrationNote("");
      setTimeout(() => setArbitrationToast(null), 5000);
    }, 600);
  };

  return (
    <main className="min-h-dvh bg-[#FAF9FB] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0E6F3] pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-up-700">
            <Lock size={12} />
            Gouvernance Financière &amp; Tiers de Confiance
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-[#1D0F24] sm:text-3xl">
            Supervision des Séquestres &amp; Litiges
          </h1>
          <p className="text-xs text-[#6B5D73]">
            Surveillance des flux Airtel Money / Moov Money et arbitrage souverain des contestations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-up-200 bg-up-50 px-4 py-2 font-display text-sm font-bold text-up-700 shadow-xs">
            {hydrated ? totalHeldAmountXaf.toLocaleString("fr-FR") : "—"} FCFA
            consignés
          </span>
        </div>
      </div>

      {/* Toast de confirmation d'arbitrage */}
      {arbitrationToast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{arbitrationToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setArbitrationToast(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5D73]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par client, prestataire, référence UP-ESCROW..."
            className="w-full rounded-2xl border border-[#F0E6F3] bg-white py-2.5 pl-10 pr-4 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Filtres de statut */}
        <div className="flex rounded-full border border-[#F0E6F3] bg-white p-1 shadow-xs overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "Tous" },
            { id: "disputed", label: "⚠️ Litiges (1)" },
            { id: "held", label: "Bloqués (held)" },
            { id: "released", label: "Libérés" },
            { id: "refunded", label: "Remboursés" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as EscrowFilter)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                filter === tab.id
                  ? "bg-up-500 text-white shadow-xs"
                  : "text-[#6B5D73] hover:text-[#1D0F24]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille : Liste des Séquestres (Gauche) + Détails & Outils d'Arbitrage (Droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Colonne Gauche : Liste des transactions (5 colonnes) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
          {filteredEscrows.length > 0 ? (
            filteredEscrows.map((esc) => {
              const isSelected = selectedEscrow?.id === esc.id;
              const isHeld = esc.status === "held";
              const isDisputed = esc.status === "disputed";
              const isReleased = esc.status === "released_to_companion";
              const isRefunded = esc.status === "refunded_to_client";

              return (
                <div
                  key={esc.id}
                  onClick={() => setSelectedEscrow(esc)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-up-500 bg-up-50 shadow-xs"
                      : "border-[#F0E6F3] bg-white hover:border-up-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-[#F0E6F3] pb-2.5">
                    <div>
                      <span className="font-mono text-[10px] text-[#6B5D73] block">
                        {esc.transactionRef}
                      </span>
                      <p className="font-bold text-xs text-[#1D0F24] mt-0.5">
                        {esc.clientName} ➔ {esc.companionName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-display text-sm font-bold text-[#1D0F24]">
                        {esc.totalAmountXaf.toLocaleString("fr-FR")} FCFA
                      </span>
                      <span
                        className={`block text-[9px] font-bold uppercase ${
                          isDisputed
                            ? "text-red-600"
                            : isHeld
                              ? "text-amber-600"
                              : isReleased
                                ? "text-emerald-600"
                                : "text-up-700"
                        }`}
                      >
                        {isDisputed
                          ? "⚠️ Litige Ouvert"
                          : isHeld
                            ? "🛡️ HELD (Bloqué)"
                            : isReleased
                              ? "✓ Versé au prestataire"
                              : "↩ Remboursé au client"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#6B5D73]">
                    <span className="flex items-center gap-1 text-[#1D0F24]">
                      <MapPin size={12} className="text-up-500" />
                      <span>{esc.venueName}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-[#6B5D73]">
                      <Smartphone size={12} />
                      <span>
                        {esc.paymentOperator === "airtel_money" ? "Airtel" : "Moov"}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-[#F0E6F3] bg-white p-8 text-center text-xs text-[#6B5D73]">
              Aucune transaction de séquestre ne correspond à ces critères.
            </div>
          )}
        </div>

        {/* Colonne Droite : Console d'Arbitrage et Journal d'Audit (7 colonnes) */}
        {selectedEscrow ? (
          <div className="lg:col-span-7 rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-5">
            {/* Header du dossier séquestre */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#F0E6F3] pb-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B5D73] block">
                  Dossier de Séquestre · Réf {selectedEscrow.transactionRef}
                </span>
                <h2 className="font-display text-lg font-bold text-[#1D0F24]">
                  {selectedEscrow.clientName} ⇄ {selectedEscrow.companionName}
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  selectedEscrow.status === "disputed"
                    ? "border border-red-200 bg-red-50 text-red-700 animate-pulse"
                    : selectedEscrow.status === "held"
                      ? "border border-amber-200 bg-amber-50 text-amber-700"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {selectedEscrow.status === "disputed"
                  ? "Litige Arbitrage Requis"
                  : selectedEscrow.status === "held"
                    ? "Séquestre HELD Actif"
                    : "Mission Réglée"}
              </span>
            </div>

            {/* Répartition Financière */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3.5 text-center">
              <div>
                <span className="text-[10px] text-[#6B5D73] block">Total Débité</span>
                <span className="font-display text-sm font-bold text-[#1D0F24]">
                  {selectedEscrow.totalAmountXaf.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="border-x border-[#F0E6F3] px-2">
                <span className="text-[10px] text-[#6B5D73] block">Part Prestataire</span>
                <span className="font-display text-sm font-bold text-emerald-600">
                  {selectedEscrow.companionFeeXaf.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B5D73] block">Commission UP (10%)</span>
                <span className="font-display text-sm font-bold text-up-700">
                  {selectedEscrow.platformFeeXaf.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            {/* Détails du Rendez-vous en Lieu Public */}
            <div className="rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-4 space-y-2 text-xs text-[#6B5D73]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#1D0F24] font-semibold">
                  <MapPin size={14} className="text-up-500" />
                  <span>{selectedEscrow.venueName}</span>
                </span>
                <span className="text-up-700 font-mono font-semibold">
                  {selectedEscrow.venueZone}
                </span>
              </div>
              <p className="flex items-center gap-2 text-[#1D0F24]">
                <Clock size={13} className="text-up-500" />
                <span>
                  Date &amp; Heure : {selectedEscrow.date} à {selectedEscrow.time} ({selectedEscrow.durationHours}h prévues)
                </span>
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0E6F3] text-[11px]">
                <div>
                  <span className="text-[#6B5D73] block">Client Mobile Money :</span>
                  <span className="font-mono font-semibold text-[#1D0F24]">
                    {selectedEscrow.clientPhone} (
                    {selectedEscrow.paymentOperator === "airtel_money"
                      ? "Airtel Money"
                      : "Moov Money"}
                    )
                  </span>
                </div>
                <div>
                  <span className="text-[#6B5D73] block">Prestataire Mobile Money :</span>
                  <span className="font-mono font-semibold text-[#1D0F24]">
                    {selectedEscrow.companionPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Litige & Réclamation */}
            {selectedEscrow.disputeReason && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-2 text-xs">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-700">
                  <AlertTriangle size={15} />
                  Motif de la contestation / litige
                </span>
                <p className="text-red-900 leading-relaxed font-medium">
                  {selectedEscrow.disputeReason}
                </p>

                {selectedEscrow.arbitrationLog && (
                  <div className="mt-3 space-y-1 rounded-xl bg-white p-3 border border-red-200">
                    <span className="text-[10px] uppercase font-bold text-[#6B5D73] block">
                      Journal des démarches conciergerie :
                    </span>
                    {selectedEscrow.arbitrationLog.map((log, i) => (
                      <p key={i} className="text-[11px] text-[#6B5D73]">
                        • {log}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OUTIL D'ARBITRAGE SOUVERAIN UP (Boutons d'action) */}
            {(selectedEscrow.status === "held" ||
              selectedEscrow.status === "disputed") && (
              <div className="rounded-2xl border border-up-200 bg-up-50 p-4 space-y-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-700">
                  <Scale size={15} />
                  Outils d&apos;Arbitrage Souverain UP
                </span>
                <p className="text-xs text-[#6B5D73] leading-relaxed">
                  En tant qu&apos;officier de modération, vous avez l&apos;autorité
                  pour clore le litige et trancher la destination des fonds séquestrés.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* Bouton 1 : Forcer le déblocage vers le prestataire */}
                  <button
                    type="button"
                    onClick={() => {
                      setArbitrationAction("force_release");
                      setArbitrationNote(
                        "Prestation attestée au lieu public certifié. Clôture en faveur du prestataire.",
                      );
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-xs"
                  >
                    <CheckCircle2 size={15} />
                    <span>Forcer le déblocage prestataire</span>
                  </button>

                  {/* Bouton 2 : Rembourser intégralement le client */}
                  <button
                    type="button"
                    onClick={() => {
                      setArbitrationAction("force_refund");
                      setArbitrationNote(
                        "Incident avéré ou lieu non conforme. Remboursement intégral du client sur son compte Mobile Money.",
                      );
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-red-300 bg-white py-3 text-xs font-bold text-red-700 transition hover:bg-red-50"
                  >
                    <RotateCcw size={15} />
                    <span>Rembourser intégralement le client</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Modal de Confirmation d'Arbitrage */}
      {arbitrationAction && selectedEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-700">
                <Scale size={16} />
                Confirmation de la Décision d&apos;Arbitrage
              </span>
              <button
                type="button"
                onClick={() => setArbitrationAction(null)}
                className="text-[#6B5D73] hover:text-[#1D0F24]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteArbitration} className="mt-4 space-y-4 text-left">
              <div
                className={`rounded-2xl border p-4 text-xs ${
                  arbitrationAction === "force_release"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <p className="font-bold">
                  {arbitrationAction === "force_release"
                    ? `Déblocage immédiat de ${selectedEscrow.companionFeeXaf.toLocaleString("fr-FR")} FCFA vers ${selectedEscrow.companionName}`
                    : `Remboursement immédiat de ${selectedEscrow.totalAmountXaf.toLocaleString("fr-FR")} FCFA vers ${selectedEscrow.clientName}`}
                </p>
                <p className="mt-1 text-[11px] opacity-80">
                  Cette décision est irréversible et sera enregistrée au registre d&apos;audit UP Gabon.
                </p>
              </div>

              <div>
                <label
                  htmlFor="arbitration-official-note"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
                >
                  Motif officiel consigné au registre d&apos;arbitrage
                </label>
                <textarea
                  id="arbitration-official-note"
                  rows={3}
                  value={arbitrationNote}
                  onChange={(e) => setArbitrationNote(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setArbitrationAction(null)}
                  className="flex-1 rounded-full border border-[#F0E6F3] py-3 text-xs font-semibold text-[#6B5D73] hover:text-[#1D0F24]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessingArbitration || !arbitrationNote.trim()}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-3 text-xs font-bold transition shadow-xs ${
                    arbitrationAction === "force_release"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isProcessingArbitration ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>Confirmer la décision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
