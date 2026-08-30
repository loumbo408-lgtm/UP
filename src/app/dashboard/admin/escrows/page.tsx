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
    <main className="px-5 pt-4 space-y-4">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-up-gold">
            Gouvernance Financière &amp; Tiers de Confiance
          </span>
          <h1 className="font-display text-2xl font-bold text-up-white">
            Supervision des Séquestres &amp; Litiges
          </h1>
          <p className="text-xs text-up-gray">
            Surveillance des flux Airtel Money / Moov Money et arbitrage souverain des contestations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-2xl border border-up-gold/40 bg-up-gold/15 px-3.5 py-1.5 font-display text-sm font-bold text-up-gold shadow">
            {hydrated ? totalHeldAmountXaf.toLocaleString("fr-FR") : "—"} FCFA
            consignés
          </span>
        </div>
      </div>

      {/* Toast de confirmation d'arbitrage */}
      {arbitrationToast && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{arbitrationToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setArbitrationToast(null)}
            className="text-emerald-400/80 hover:text-emerald-300"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Barre de recherche et filtres */}
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
            placeholder="Rechercher par client, prestataire, référence UP-ESCROW..."
            className="w-full rounded-2xl border border-white/10 bg-up-surface py-2.5 pl-10 pr-4 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
          />
        </div>

        {/* Filtres de statut */}
        <div className="flex rounded-2xl border border-white/10 bg-up-surface p-1 overflow-x-auto scrollbar-none">
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
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === tab.id
                  ? "bg-up-gold text-up-black shadow"
                  : "text-up-gray hover:text-up-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille : Liste des Séquestres (Gauche) + Détails & Outils d'Arbitrage (Droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                      ? "border-up-gold bg-gradient-to-r from-up-gold/15 to-up-surface shadow-xl"
                      : "border-white/10 bg-up-surface hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div>
                      <span className="font-mono text-[10px] text-up-gray block">
                        {esc.transactionRef}
                      </span>
                      <p className="font-semibold text-xs text-up-white mt-0.5">
                        {esc.clientName} ➔ {esc.companionName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-display text-sm font-bold text-up-gold">
                        {esc.totalAmountXaf.toLocaleString("fr-FR")} FCFA
                      </span>
                      <span
                        className={`block text-[9px] font-bold uppercase ${
                          isDisputed
                            ? "text-red-400"
                            : isHeld
                              ? "text-amber-400"
                              : isReleased
                                ? "text-emerald-400"
                                : "text-cyan-400"
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

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-up-gray">
                    <span className="flex items-center gap-1 text-up-white">
                      <MapPin size={12} className="text-up-gold" />
                      <span>{esc.venueName}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-up-gray">
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
            <div className="rounded-2xl border border-white/10 bg-up-surface p-8 text-center text-xs text-up-gray">
              Aucune transaction de séquestre ne correspond à ces critères.
            </div>
          )}
        </div>

        {/* Colonne Droite : Console d'Arbitrage et Journal d'Audit (7 colonnes) */}
        {selectedEscrow ? (
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-up-surface p-5 shadow-2xl space-y-5">
            {/* Header du dossier séquestre */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-up-gray block">
                  Dossier de Séquestre · Réf {selectedEscrow.transactionRef}
                </span>
                <h2 className="font-display text-lg font-bold text-up-white">
                  {selectedEscrow.clientName} ⇄ {selectedEscrow.companionName}
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  selectedEscrow.status === "disputed"
                    ? "border border-red-500/50 bg-red-500/20 text-red-300 animate-pulse"
                    : selectedEscrow.status === "held"
                      ? "border border-amber-500/50 bg-amber-500/20 text-amber-300"
                      : "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
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
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-up-black/50 p-3.5 text-center">
              <div>
                <span className="text-[10px] text-up-gray block">Total Débité</span>
                <span className="font-display text-sm font-bold text-up-white">
                  {selectedEscrow.totalAmountXaf.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="border-x border-white/10 px-2">
                <span className="text-[10px] text-up-gray block">Part Prestataire</span>
                <span className="font-display text-sm font-bold text-emerald-400">
                  {selectedEscrow.companionFeeXaf.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div>
                <span className="text-[10px] text-up-gray block">Commission UP (10%)</span>
                <span className="font-display text-sm font-bold text-up-gold">
                  {selectedEscrow.platformFeeXaf.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            {/* Détails du Rendez-vous en Lieu Public */}
            <div className="rounded-2xl border border-white/10 bg-up-black/50 p-4 space-y-2 text-xs text-up-gray">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-up-white font-semibold">
                  <MapPin size={14} className="text-up-gold" />
                  <span>{selectedEscrow.venueName}</span>
                </span>
                <span className="text-up-gold-soft font-mono">
                  {selectedEscrow.venueZone}
                </span>
              </div>
              <p className="flex items-center gap-2">
                <Clock size={13} className="text-up-gold" />
                <span>
                  Date &amp; Heure : {selectedEscrow.date} à {selectedEscrow.time} ({selectedEscrow.durationHours}h prévues)
                </span>
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                <div>
                  <span className="text-up-gray block">Client Mobile Money :</span>
                  <span className="font-mono text-up-white">
                    {selectedEscrow.clientPhone} (
                    {selectedEscrow.paymentOperator === "airtel_money"
                      ? "Airtel Money"
                      : "Moov Money"}
                    )
                  </span>
                </div>
                <div>
                  <span className="text-up-gray block">Prestataire Mobile Money :</span>
                  <span className="font-mono text-up-white">
                    {selectedEscrow.companionPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Litige & Réclamation */}
            {selectedEscrow.disputeReason && (
              <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-4 space-y-2 text-xs">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-400">
                  <AlertTriangle size={15} />
                  Motif de la contestation / litige
                </span>
                <p className="text-red-200 leading-relaxed">
                  {selectedEscrow.disputeReason}
                </p>

                {selectedEscrow.arbitrationLog && (
                  <div className="mt-3 space-y-1 rounded-xl bg-up-black/60 p-3 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-up-gray block">
                      Journal des démarches conciergerie :
                    </span>
                    {selectedEscrow.arbitrationLog.map((log, i) => (
                      <p key={i} className="text-[11px] text-up-gray">
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
              <div className="rounded-2xl border border-up-gold/40 bg-gradient-to-br from-up-gold/15 via-up-surface to-up-surface p-4 space-y-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                  <Scale size={15} />
                  Outils d&apos;Arbitrage Souverain UP
                </span>
                <p className="text-xs text-up-gray leading-relaxed">
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
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-up-black transition hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
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
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/50 bg-red-500/20 py-3 text-xs font-bold text-red-300 transition hover:bg-red-500/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-up-gold/50 bg-up-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                <Scale size={16} />
                Confirmation de la Décision d&apos;Arbitrage
              </span>
              <button
                type="button"
                onClick={() => setArbitrationAction(null)}
                className="text-up-gray hover:text-up-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteArbitration} className="mt-4 space-y-4 text-left">
              <div
                className={`rounded-2xl border p-4 text-xs ${
                  arbitrationAction === "force_release"
                    ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                    : "border-red-500/40 bg-red-950/30 text-red-300"
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
                  className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                >
                  Motif officiel consigné au registre d&apos;arbitrage
                </label>
                <textarea
                  id="arbitration-official-note"
                  rows={3}
                  value={arbitrationNote}
                  onChange={(e) => setArbitrationNote(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/60 p-2.5 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setArbitrationAction(null)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold text-up-gray hover:text-up-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessingArbitration || !arbitrationNote.trim()}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition ${
                    arbitrationAction === "force_release"
                      ? "bg-emerald-500 text-up-black hover:bg-emerald-400"
                      : "bg-red-500 text-up-white hover:bg-red-400"
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
