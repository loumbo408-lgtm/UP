"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Calendar,
  KeyRound,
  Lock,
  MapPin,
  MessageSquare,
  Radio,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useUpStore } from "@/lib/store";

export default function PrestataireMessagesPage() {
  const radarDemands = useUpStore((s) => s.radarDemands);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "client" as const,
      text: "Bonjour ! Nous vous attendons dans le salon du Radisson Blu Libreville.",
      time: "11:30",
    },
    {
      id: "m2",
      sender: "me" as const,
      text: "Bonjour ! Bien reçu, je suis en route et serai présente avec 5 minutes d'avance.",
      time: "11:32",
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "me",
        text: messageText.trim(),
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMessageText("");
  };

  const rightSidebarContent = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
        <h3 className="font-display text-xs font-bold text-[#1D0F24] uppercase tracking-wider mb-2">
          Rappel Sécurité Prestataire
        </h3>
        <p className="text-xs text-[#6B5D73] leading-relaxed">
          Toutes les missions doivent se tenir dans un établissement public partenaire (hôtels, restaurants certifiés). N&apos;acceptez aucun rendez-vous dans un lieu privé.
        </p>
      </div>

      <div className="rounded-2xl border border-up-200 bg-up-50 p-5 text-xs text-up-700 shadow-xs">
        <div className="flex items-center gap-2 font-bold">
          <KeyRound size={16} className="text-up-500" />
          <span>Code OTP de Clôture</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-up-700/80">
          À la fin de la mission, demandez au client son code OTP à 6 chiffres pour débloquer immédiatement vos honoraires vers votre solde disponible.
        </p>
      </div>
    </div>
  );

  return (
    <DashboardShell
      role="prestataire"
      pageTitle="Messages & Missions Pro"
      pageSubtitle="Échanges sécurisés avec vos clients pour l'organisation de vos prestations à Libreville."
      rightSidebar={rightSidebarContent}
      searchPlaceholder="Rechercher dans mes discussions..."
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[650px] rounded-2xl border border-[#F0E6F3] bg-white shadow-xs overflow-hidden">
        {/* Liste des discussions */}
        <div className="md:col-span-4 border-r border-[#F0E6F3] flex flex-col h-full bg-[#FAF9FB]">
          <div className="p-4 border-b border-[#F0E6F3]">
            <h2 className="font-display text-sm font-bold text-[#1D0F24]">
              Conversations Clients
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F0E6F3]">
            <div className="p-3.5 bg-white border-l-4 border-up-500 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-up-50 border border-up-200 grid place-items-center font-bold text-xs text-up-700 shrink-0">
                CL
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-[#1D0F24] truncate">
                  Client Vérifié UP
                </p>
                <p className="text-[11px] text-[#6B5D73] truncate">
                  Radisson Blu Libreville
                </p>
                <p className="text-[10px] text-up-700 font-semibold">
                  Aujourd&apos;hui · 19:30
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zone de chat active */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          <div className="p-4 border-b border-[#F0E6F3] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-[#1D0F24]">Client Vérifié UP</h3>
              <p className="text-[10px] text-emerald-600 font-semibold">
                Mission validée sous séquestre
              </p>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#FAF9FB]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "me" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                    msg.sender === "me"
                      ? "bg-up-500 text-white rounded-br-xs"
                      : "bg-white border border-up-border-subtle text-up-text-main rounded-bl-xs"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <span className="mt-1 text-[9px] text-up-text-muted px-1">
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-[#F0E6F3] flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Répondre au client..."
              className="flex-1 rounded-full border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 px-4 text-xs text-up-text-main placeholder-up-text-muted/70 focus:border-up-500 focus:bg-white focus:outline-none transition shadow-2xs"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="grid h-10 w-10 place-items-center rounded-full bg-up-500 text-white shadow-md shadow-up-500/20 hover:bg-up-600 active:scale-[0.98] disabled:opacity-40 shrink-0 transition"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
