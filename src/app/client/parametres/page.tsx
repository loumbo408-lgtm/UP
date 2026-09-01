"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Lock,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function ClientParametresPage() {
  const [phone, setPhone] = useState("074123456");
  const [operator, setOperator] = useState<"airtel" | "moov">("airtel");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const rightSidebarContent = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
        <h3 className="font-display text-xs font-bold text-up-700 uppercase tracking-wider mb-3">
          Sécurité du Compte
        </h3>
        <p className="text-xs text-[#6B5D73] leading-relaxed">
          Votre compte UP est protégé par une authentification à facteur multiple et vos transactions bénéficient du séquestre bancaire Mobile Money.
        </p>
        <Link
          href="/#safety"
          className="mt-4 block text-center rounded-full border border-up-200 bg-up-50 text-up-700 py-2 text-xs font-bold hover:bg-up-100 transition"
        >
          Charte de Sécurité UP
        </Link>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-xs text-emerald-800 shadow-xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-emerald-600" />
          <span>Protection des Données</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-emerald-800/80">
          Vos coordonnées personnelles et numéros financiers ne sont jamais communiqués aux tiers et sont chiffrés de bout en bout.
        </p>
      </div>
    </div>
  );

  return (
    <DashboardShell
      role="client"
      pageTitle="Paramètres & Confidentialité"
      pageSubtitle="Gérez vos préférences de notifications, vos numéros Mobile Money et votre sécurité."
      rightSidebar={rightSidebarContent}
      showSearch={false}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>Vos paramètres ont été enregistrés avec succès.</span>
          </div>
        )}

        {/* Formulaire de Paramètres */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section Mobile Money */}
          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0E6F3] pb-3">
              <Smartphone size={18} className="text-up-500" />
              <h2 className="font-display text-sm font-bold text-[#1D0F24]">
                Numéro Mobile Money par Défaut
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-up-700 mb-2">
                Opérateur principal
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
                Numéro de téléphone (+241)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] font-bold focus:border-up-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section Notifications */}
          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0E6F3] pb-3">
              <Bell size={18} className="text-up-500" />
              <h2 className="font-display text-sm font-bold text-[#1D0F24]">
                Préférences de Notification
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-[#1D0F24]">Alertes SMS pour le code OTP</p>
                  <p className="text-[11px] text-[#6B5D73]">
                    Recevez le code OTP de clôture par SMS dès l&apos;acceptation de la mission.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 accent-[#8807A8] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#F0E6F3]">
                <div>
                  <p className="font-bold text-[#1D0F24]">Confirmations par Email</p>
                  <p className="text-[11px] text-[#6B5D73]">
                    Reçus de séquestre et bilans des missions effectuées.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 accent-[#8807A8] rounded"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-up-500 hover:bg-up-600 py-3.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
          >
            <Save size={15} />
            <span>Enregistrer mes préférences</span>
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
