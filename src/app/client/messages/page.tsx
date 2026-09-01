"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  Lock,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useUpStore } from "@/lib/store";

export default function ClientMessagesPage() {
  const reservations = useUpStore((s) => s.reservations);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    reservations[0]?.id || "conv-1",
  );
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<
    Record<string, Array<{ id: string; sender: "me" | "them"; text: string; time: string }>>
  >({
    [reservations[0]?.id || "conv-1"]: [
      {
        id: "m1",
        sender: "them",
        text: "Bonjour ! J'ai bien reçu votre demande de réservation pour notre rencontre. Je serai ravie de vous accompagner.",
        time: "10:14",
      },
      {
        id: "m2",
        sender: "me",
        text: "Bonjour, parfait ! Le cadre du Radisson Blu Libreville conviendra très bien pour notre échange professionnel.",
        time: "10:20",
      },
      {
        id: "m3",
        sender: "them",
        text: "Excellente idée, je serai ponctuelle dans le hall principal. À très bientôt !",
        time: "10:25",
      },
    ],
  });

  const activeRes = reservations.find((r) => r.id === selectedConversationId) || reservations[0];

  const currentChat = activeRes
    ? localMessages[activeRes.id] || [
        {
          id: "m-init",
          sender: "them",
          text: `Bonjour ! Merci pour votre confiance pour cette mission au ${activeRes.venueName}.`,
          time: "11:00",
        },
      ]
    : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeRes) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "me" as const,
      text: messageText.trim(),
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setLocalMessages((prev) => ({
      ...prev,
      [activeRes.id]: [...(prev[activeRes.id] || []), newMsg],
    }));
    setMessageText("");
  };

  const rightSidebarContent = (
    <div className="space-y-5">
      {/* Informations de la mission liée */}
      {activeRes ? (
        <div className="rounded-2xl border border-[#F0E6F3] bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#F0E6F3] pb-3">
            <ShieldCheck size={18} className="text-up-500" />
            <h3 className="font-display text-xs font-bold text-[#1D0F24] uppercase tracking-wider">
              Détails de la Rencontre
            </h3>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100 shrink-0">
              <Image
                src={activeRes.companionAvatar}
                alt={activeRes.companionName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-xs text-[#1D0F24]">{activeRes.companionName}</p>
              <p className="text-[11px] text-up-700 font-semibold">{activeRes.serviceLabel}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs text-[#6B5D73]">
            <p className="flex items-center gap-2">
              <Calendar size={13} className="text-up-500" />
              <span>{activeRes.date} à {activeRes.time}</span>
            </p>
            <p className="flex items-center gap-2">
              <Building2 size={13} className="text-up-500" />
              <span className="truncate">{activeRes.venueName}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={13} className="text-up-500" />
              <span>{activeRes.companionZone}, Gabon</span>
            </p>
          </div>

          <Link
            href={`/client/reservations`}
            className="mt-4 block w-full rounded-full border border-up-200 py-2 text-center text-xs font-bold text-[#1D0F24] hover:border-up-500 hover:text-up-700 transition"
          >
            Suivre la réservation
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#F0E6F3] bg-white p-5 text-center shadow-xs">
          <p className="text-xs text-[#6B5D73]">
            Sélectionnez une conversation pour voir le récapitulatif de mission.
          </p>
        </div>
      )}

      {/* Rappel de sécurité des échanges */}
      <div className="rounded-2xl border border-up-200 bg-up-50 p-5 shadow-xs text-xs text-up-700">
        <div className="flex items-center gap-2 font-bold">
          <Lock size={16} className="text-up-500" />
          <span>Messagerie Encadrée UP</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-up-700/80">
          Les échanges doivent rester strictement courtois et porter sur l&apos;organisation de la mission dans l&apos;établissement public convenu.
        </p>
      </div>
    </div>
  );

  return (
    <DashboardShell
      role="client"
      pageTitle="Messages & Échanges Sécurisés"
      pageSubtitle="Communiquez en toute sérénité avec vos prestataires pour coordonner votre rencontre."
      rightSidebar={rightSidebarContent}
      searchPlaceholder="Rechercher dans les messages..."
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[650px] rounded-2xl border border-[#F0E6F3] bg-white shadow-xs overflow-hidden">
        {/* Liste des conversations */}
        <div className="md:col-span-4 border-r border-[#F0E6F3] flex flex-col h-full bg-[#FAF9FB]">
          <div className="p-4 border-b border-[#F0E6F3]">
            <h2 className="font-display text-sm font-bold text-[#1D0F24]">
              Discussions actives ({reservations.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F0E6F3]">
            {reservations.length > 0 ? (
              reservations.map((res) => {
                const isSelected = res.id === (activeRes?.id || "");
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setSelectedConversationId(res.id)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition ${
                      isSelected
                        ? "bg-white shadow-xs border-l-4 border-up-500"
                        : "hover:bg-white/70"
                    }`}
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#F0E6F3] bg-white">
                      <Image
                        src={res.companionAvatar}
                        alt={res.companionName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-[#1D0F24] truncate">
                        {res.companionName}
                      </p>
                      <p className="text-[11px] text-[#6B5D73] truncate">
                        {res.venueName}
                      </p>
                      <p className="text-[10px] text-up-700 font-bold">
                        {res.date}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-[#6B5D73]">
                Aucune conversation active pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat active */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {activeRes ? (
            <>
              {/* Entête du chat */}
              <div className="p-4 border-b border-[#F0E6F3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#F0E6F3]">
                    <Image
                      src={activeRes.companionAvatar}
                      alt={activeRes.companionName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#1D0F24]">
                      {activeRes.companionName}
                    </h3>
                    <p className="text-[10px] text-up-700 font-semibold">
                      Prestataire vérifié UP · {activeRes.venueName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Corps des messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#FAF9FB]/60">
                {currentChat.map((msg) => (
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
                          : "bg-white border border-[#F0E6F3] text-[#1D0F24] rounded-bl-xs"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="mt-1 text-[9px] text-[#6B5D73] px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Formulaire de saisie */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#F0E6F3] flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écrivez un message sécurisé..."
                  className="flex-1 rounded-full border border-[#F0E6F3] bg-[#FAF9FB] py-2.5 px-4 text-xs text-[#1D0F24] placeholder-[#6B5D73]/70 focus:border-up-500 focus:bg-white focus:outline-none transition shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="grid h-10 w-10 place-items-center rounded-full bg-up-500 text-white shadow-md shadow-up-500/20 hover:bg-up-600 active:scale-[0.98] disabled:opacity-40 shrink-0 transition"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[#6B5D73]">
              <MessageSquare size={36} className="text-up-500 mb-2" />
              <p className="font-bold text-[#1D0F24] text-sm">Sélectionnez une conversation</p>
              <p className="mt-1 max-w-sm">Vos échanges avec les prestataires vérifiés apparaîtront ici.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
