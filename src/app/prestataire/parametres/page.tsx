"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Lock,
  Phone,
  Save,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function PrestataireParametresPage() {
  const [withdrawPhone, setWithdrawPhone] = useState("074123456");
  const [operator, setOperator] = useState<"airtel" | "moov">("airtel");
  const [instantAlerts, setInstantAlerts] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <DashboardShell
      role="prestataire"
      pageTitle="Paramètres & Paiements Pro"
      pageSubtitle="Configurez votre numéro Mobile Money de réception des gains et vos préférences de mission."
      showSearch={false}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>Paramètres professionnels enregistrés avec succès.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0E6F3] pb-3">
              <Wallet size={18} className="text-up-500" />
              <h2 className="font-display text-sm font-bold text-[#1D0F24]">
                Compte Mobile Money de Réception des Gains
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-up-700 mb-2">
                Opérateur pour vos retraits
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOperator("airtel")}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                    operator === "airtel"
                      ? "border-up-500 bg-up-50 text-up-700 shadow-xs"
                      : "border-[#F0E6F3] text-[#6B5D73] hover:bg-[#FAF9FB]"
                  }`}
                >
                  Airtel Money Gabon
                </button>
                <button
                  type="button"
                  onClick={() => setOperator("moov")}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                    operator === "moov"
                      ? "border-up-500 bg-up-50 text-up-700 shadow-xs"
                      : "border-[#F0E6F3] text-[#6B5D73] hover:bg-[#FAF9FB]"
                  }`}
                >
                  Moov Money Gabon
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B5D73] mb-1.5">
                Numéro Mobile Money (+241)
              </label>
              <input
                type="tel"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                required
                className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] font-bold focus:border-up-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0E6F3] pb-3">
              <Bell size={18} className="text-up-500" />
              <h2 className="font-display text-sm font-bold text-[#1D0F24]">
                Notifications de Missions
              </h2>
            </div>

            <label className="flex items-center justify-between cursor-pointer text-xs">
              <div>
                <p className="font-bold text-[#1D0F24]">Alertes Sonores et Push en Temps Réel</p>
                <p className="text-[11px] text-[#6B5D73]">
                  Recevez immédiatement une notification dès qu&apos;une mission est demandée dans votre zone.
                </p>
              </div>
              <input
                type="checkbox"
                checked={instantAlerts}
                onChange={(e) => setInstantAlerts(e.target.checked)}
                className="h-4 w-4 accent-[#8807A8] rounded"
              />
            </label>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-up-500 hover:bg-up-600 py-3.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
          >
            <Save size={15} />
            <span>Mettre à jour mes paramètres</span>
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
