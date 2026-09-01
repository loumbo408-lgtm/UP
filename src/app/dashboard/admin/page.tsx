"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  Coins,
  Lock,
  Scale,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function AdminDashboardOverviewPage() {
  const hydrated = useHydrated();

  const kycApplicants = useUpStore((s) => s.kycApplicants);
  const adminEscrows = useUpStore((s) => s.adminEscrows);
  const adminVenues = useUpStore((s) => s.adminVenues);

  // Calculs financiers dynamiques
  const heldEscrows = adminEscrows.filter(
    (e) => e.status === "held" || e.status === "disputed",
  );
  const totalHeldAmountXaf = heldEscrows.reduce(
    (acc, item) => acc + item.totalAmountXaf,
    0,
  );

  const totalCommissionsEarnedXaf = adminEscrows.reduce(
    (acc, item) => acc + item.platformFeeXaf,
    18500, // base commissions
  );

  const pendingKycCount = kycApplicants.filter((a) => a.status === "pending").length;
  const disputedEscrowsCount = adminEscrows.filter(
    (e) => e.status === "disputed",
  ).length;

  return (
    <main className="space-y-6">
      {/* En-tête de bienvenue Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-up-700">
            Tour de Contrôle Plateforme
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
            Tableau de Bord Exécutif
          </h1>
          <p className="text-xs text-[#6B5D73]">
            Surveillance en temps réel des séquestres, modération KYC et conformité des lieux au Gabon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
            Opérations Libreville 100% Actives
          </span>
        </div>
      </div>

      {/* 1. Les 4 Métriques Globales Exécutives (Style SaaS Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* A. Total sous séquestre */}
        <div className="rounded-3xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5D73]">
              Fonds sous Séquestre
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-50 text-up-500">
              <Lock size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-[#1D0F24]">
            {hydrated ? totalHeldAmountXaf.toLocaleString("fr-FR") : "—"}{" "}
            <span className="text-xs font-normal text-[#6B5D73]">FCFA</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ShieldCheck size={13} />
            <span>{heldEscrows.length} transactions consignées</span>
          </p>
        </div>

        {/* B. Chiffre d'affaires commissions UP */}
        <div className="rounded-3xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5D73]">
              Commissions UP
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Coins size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-[#1D0F24]">
            {hydrated ? totalCommissionsEarnedXaf.toLocaleString("fr-FR") : "—"}{" "}
            <span className="text-xs font-normal text-[#6B5D73]">FCFA</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp size={13} />
            <span>+24.5% vs semaine passée</span>
          </p>
        </div>

        {/* C. Prestataires en ligne */}
        <div className="rounded-3xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5D73]">
              Prestataires Actifs
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-50 text-up-700">
              <Users size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-[#1D0F24]">
            42 <span className="text-xs font-normal text-[#6B5D73]">disponibles</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Akanda, Sablière, Louis, Batterie IV</span>
          </p>
        </div>

        {/* D. Missions du jour */}
        <div className="rounded-3xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5D73]">
              Missions du Jour
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-50 text-up-500">
              <Activity size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-[#1D0F24]">
            18 <span className="text-xs font-normal text-[#6B5D73]">au total</span>
          </p>
          <p className="mt-1 text-[11px] text-[#6B5D73]">
            12 clôturées · 4 en cours · 2 prévues ce soir
          </p>
        </div>
      </div>

      {/* 2. Alertes Prioritaires de Gestion & Modération */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alerte Modération KYC */}
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <UserCheck size={16} />
                Modération KYC en Attente ({pendingKycCount})
              </span>
              <p className="mt-1.5 text-xs text-[#6B5D73] leading-relaxed">
                3 dossiers de nouveaux prestataires avec CNI gabonaise et selfie vidéo nécessitent votre validation officielle.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              Priorité Haute
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-amber-200 pt-3">
            <div className="flex -space-x-2 overflow-hidden">
              {kycApplicants.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-up-500 text-center font-bold text-xs text-white leading-8"
                >
                  {app.fullName.charAt(0)}
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/admin/kyc"
              className="flex items-center gap-1.5 rounded-full bg-up-500 hover:bg-up-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
            >
              <span>Vérifier les dossiers</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Alerte Litiges & Arbitrage Séquestres */}
        <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-800">
                <Scale size={16} />
                Litiges &amp; Arbitrage ({disputedEscrowsCount})
              </span>
              <p className="mt-1.5 text-xs text-[#6B5D73] leading-relaxed">
                {disputedEscrowsCount > 0
                  ? "1 dossier de litige ouvert suite à un départ anticipé à l'Hôtel Nomad."
                  : "Aucun litige ouvert. Toutes les missions se déroulent normalement."}
              </p>
            </div>
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-800">
              Arbitrage Requis
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-red-200 pt-3">
            <span className="text-[11px] font-mono text-[#6B5D73]">
              Réf : UP-ESCROW-20260830-AIRTEL-3K8D
            </span>
            <Link
              href="/dashboard/admin/escrows"
              className="flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-600 hover:text-white"
            >
              <span>Arbitrer le litige</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Activité en Direct & Lieux Certifiés */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1 & 2 : Flux des Transactions & Séquestres */}
        <div className="lg:col-span-2 rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D0F24]">
              <Activity size={16} className="text-up-500" />
              Dernières Transactions &amp; Séquestres Mobile Money
            </span>
            <Link
              href="/dashboard/admin/escrows"
              className="text-xs font-bold text-up-700 hover:text-up-600"
            >
              Voir tout ({adminEscrows.length})
            </Link>
          </div>

          <div className="space-y-3">
            {adminEscrows.map((esc) => {
              const isHeld = esc.status === "held";
              const isDisputed = esc.status === "disputed";

              return (
                <div
                  key={esc.id}
                  className="flex items-center justify-between rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3.5 hover:border-up-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold ${
                        isDisputed
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : isHeld
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {esc.paymentOperator === "airtel_money" ? "AIRTEL" : "MOOV"}
                    </span>
                    <div>
                      <p className="font-bold text-xs text-[#1D0F24]">
                        {esc.clientName} ➔ {esc.companionName}
                      </p>
                      <p className="text-[11px] text-[#6B5D73]">
                        {esc.venueName} · {esc.time}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-sm font-bold text-[#1D0F24] block">
                      {esc.totalAmountXaf.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isDisputed
                          ? "text-red-600"
                          : isHeld
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {isDisputed
                        ? "⚠️ Litige en cours"
                        : isHeld
                        ? "🛡️ Séquestre Consigné"
                        : "✓ Clôturé & Versé"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne 3 : Réseau des Lieux Publics Certifiés */}
        <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D0F24]">
              <Building2 size={16} className="text-up-500" />
              Lieux Partenaires ({adminVenues.length})
            </span>
            <Link
              href="/dashboard/admin/venues"
              className="text-xs font-bold text-up-700 hover:text-up-600"
            >
              Gérer
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {adminVenues.slice(0, 4).map((venue) => (
              <div
                key={venue.id}
                className="rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 flex items-start justify-between"
              >
                <div>
                  <p className="font-bold text-[#1D0F24] text-xs">{venue.name}</p>
                  <p className="text-[11px] text-[#6B5D73]">{venue.zone}</p>
                  <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                    ✓ Cadre certifié UP
                  </p>
                </div>
                <span className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold text-[#6B5D73] border border-[#F0E6F3]">
                  {venue.monthlyMissionsCount} missions/mois
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/admin/venues"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-up-200 bg-white py-3 text-xs font-bold text-[#1D0F24] transition hover:border-up-400 hover:text-up-700 shadow-xs"
          >
            <span>Configurer les lieux certifiés</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
