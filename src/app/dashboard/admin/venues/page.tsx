"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Filter,
  MapPin,
  Plus,
  Power,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { ZONES, type Zone } from "@/lib/data";
import type { VenueAdminItem } from "@/lib/admin-data";

export default function AdminVenuesCrudPage() {
  const hydrated = useHydrated();

  const adminVenues = useUpStore((s) => s.adminVenues);
  const addAdminVenue = useUpStore((s) => s.addAdminVenue);
  const deleteAdminVenue = useUpStore((s) => s.deleteAdminVenue);
  const toggleAdminVenueStatus = useUpStore((s) => s.toggleAdminVenueStatus);

  const [selectedZone, setSelectedZone] = useState<Zone>("Toutes");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal d'ajout de lieu
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueCategory, setNewVenueCategory] = useState<
    "Hôtel & Restaurant" | "Lounge & Bar" | "Café & Pâtisserie" | "Espace Promenade"
  >("Hôtel & Restaurant");
  const [newVenueZone, setNewVenueZone] = useState<Zone>("Akanda");
  const [newVenueAddress, setNewVenueAddress] = useState("");
  const [newVenueSecurityNote, setNewVenueSecurityNote] = useState(
    "Contrôle d'accès filtré, présence de vigiles assermentés, parking gardé 24/7",
  );
  const [newVenueManagerName, setNewVenueManagerName] = useState("");
  const [newVenueManagerPhone, setNewVenueManagerPhone] = useState("");
  const [newVenueHasPrivateLounge, setNewVenueHasPrivateLounge] = useState(true);
  const [newVenueHasValet, setNewVenueHasValet] = useState(true);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredVenues = adminVenues.filter((v) => {
    const matchesZone =
      selectedZone === "Toutes" ? true : v.zone === selectedZone;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim() || !newVenueAddress.trim()) return;

    addAdminVenue({
      name: newVenueName.trim(),
      category: newVenueCategory,
      zone: newVenueZone,
      address: newVenueAddress.trim(),
      securityNote: newVenueSecurityNote.trim(),
      status: "active",
      securityLevel: "5_stars",
      managerName: newVenueManagerName.trim() || "Direction de la Sécurité",
      managerPhone: newVenueManagerPhone.trim() || "+241 011 00 00 00",
      monthlyMissionsCount: 0,
      hasPrivateLounge: newVenueHasPrivateLounge,
      hasDedicatedValet: newVenueHasValet,
    });

    setToastMsg(`Le lieu partenaire "${newVenueName}" a été ajouté au réseau certifié UP.`);
    setIsAddModalOpen(false);
    setNewVenueName("");
    setNewVenueAddress("");
    setNewVenueManagerName("");
    setNewVenueManagerPhone("");
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleDelete = (venue: VenueAdminItem) => {
    if (
      confirm(
        `Confirmez-vous le retrait de "${venue.name}" de la liste des lieux publics autorisés ?`,
      )
    ) {
      deleteAdminVenue(venue.id);
      setToastMsg(`"${venue.name}" a été retiré du catalogue.`);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  return (
    <main className="px-5 pt-4 space-y-4">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-up-gold">
            Périmètre de Sécurité &amp; Protocole Public
          </span>
          <h1 className="font-display text-2xl font-bold text-up-white">
            Lieux Publics Autorisés
          </h1>
          <p className="text-xs text-up-gray">
            Gestion du référentiel exclusif des restaurants, salons et hôtels certifiés pour les missions UP à Libreville.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-up-gold px-4 py-2.5 text-xs font-bold text-up-black transition hover:bg-up-gold-soft shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        >
          <Plus size={16} />
          <span>Ajouter un lieu certifié</span>
        </button>
      </div>

      {/* Toast de notification */}
      {toastMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-emerald-400/80 hover:text-emerald-300"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Barre de recherche et filtre par Quartier */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-up-gray"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom de restaurant/hôtel, adresse, quartier..."
            className="w-full rounded-2xl border border-white/10 bg-up-surface py-2.5 pl-10 pr-4 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
          />
        </div>

        {/* Filtre par zone */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {ZONES.map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setSelectedZone(zone)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedZone === zone
                  ? "bg-up-gold text-up-black font-bold shadow"
                  : "border border-white/10 bg-up-surface text-up-gray hover:border-white/20 hover:text-up-white"
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des Lieux Partenaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredVenues.map((venue) => {
          const isActive = venue.status === "active";

          return (
            <div
              key={venue.id}
              className={`overflow-hidden rounded-3xl border p-4.5 transition-all space-y-3 ${
                isActive
                  ? "border-white/10 bg-up-surface hover:border-up-gold/40 shadow-xl"
                  : "border-white/5 bg-up-surface/40 opacity-60"
              }`}
            >
              {/* Header carte lieu */}
              <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <span className="rounded-lg bg-up-gold/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-up-gold">
                    {venue.category}
                  </span>
                  <h2 className="font-display text-base font-bold text-up-white mt-1">
                    {venue.name}
                  </h2>
                  <p className="text-xs text-up-gray flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-up-gold shrink-0" />
                    <span>{venue.zone}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleAdminVenueStatus(venue.id)}
                    className={`rounded-xl p-2 transition ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : "bg-white/10 text-up-gray hover:text-up-white"
                    }`}
                    title={isActive ? "Désactiver le lieu" : "Activer le lieu"}
                  >
                    <Power size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(venue)}
                    className="rounded-xl bg-red-500/10 p-2 text-red-400 hover:bg-red-500/25 transition"
                    title="Supprimer le lieu"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Adresse & Dispositif de Sécurité */}
              <div className="space-y-1.5 text-xs text-up-gray">
                <p className="text-[11px] text-up-white font-medium">
                  📍 {venue.address}
                </p>
                <p className="rounded-xl border border-white/5 bg-up-black/50 p-2.5 text-[11px] text-emerald-300/90 leading-relaxed">
                  🛡️ {venue.securityNote}
                </p>
              </div>

              {/* Caractéristiques & Manager */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-up-gray border-t border-white/5 pt-2.5">
                <div>
                  <span className="block text-up-gray">Manager de garde :</span>
                  <span className="font-semibold text-up-white">
                    {venue.managerName}
                  </span>
                  <span className="block font-mono text-up-gold-soft">
                    {venue.managerPhone}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-up-gray">Statut &amp; Volume :</span>
                  <span className="font-semibold text-up-white">
                    {venue.monthlyMissionsCount} missions/mois
                  </span>
                  <span className="block text-emerald-400 font-bold">
                    {isActive ? "✓ Actif au catalogue" : "Désactivé"}
                  </span>
                </div>
              </div>

              {/* Badges d'options VIP */}
              <div className="flex flex-wrap gap-1 pt-1">
                {venue.hasPrivateLounge && (
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-up-gray">
                    Salon Privé
                  </span>
                )}
                {venue.hasDedicatedValet && (
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-up-gray">
                    Service Voiturier
                  </span>
                )}
                <span className="rounded-md border border-up-gold/30 bg-up-gold/10 px-2 py-0.5 text-[9px] font-bold text-up-gold">
                  Sécurité UP 5★
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'Ajout d'un Nouveau Lieu Public Partenaire */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-up-black/85 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-up-gold/50 bg-up-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
                <Building2 size={16} />
                Nouveau Lieu Public Partenaire UP
              </span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-up-gray hover:text-up-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-3.5 text-left text-xs">
              <div>
                <label
                  htmlFor="new-venue-name"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-up-gold"
                >
                  Nom de l&apos;établissement
                </label>
                <input
                  id="new-venue-name"
                  type="text"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  placeholder="Ex : Radisson Blu — Restaurant O'Mbali"
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/70 p-2.5 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="new-venue-category"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                  >
                    Catégorie
                  </label>
                  <select
                    id="new-venue-category"
                    value={newVenueCategory}
                    onChange={(e) =>
                      setNewVenueCategory(
                        e.target.value as
                          | "Hôtel & Restaurant"
                          | "Lounge & Bar"
                          | "Café & Pâtisserie"
                          | "Espace Promenade",
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/70 p-2.5 text-xs text-up-white focus:border-up-gold focus:outline-none"
                  >
                    <option value="Hôtel & Restaurant">Hôtel &amp; Restaurant</option>
                    <option value="Lounge & Bar">Lounge &amp; Bar</option>
                    <option value="Café & Pâtisserie">Café &amp; Pâtisserie</option>
                    <option value="Espace Promenade">Espace Promenade</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="new-venue-zone"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                  >
                    Quartier / Zone
                  </label>
                  <select
                    id="new-venue-zone"
                    value={newVenueZone}
                    onChange={(e) => setNewVenueZone(e.target.value as Zone)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/70 p-2.5 text-xs text-up-white focus:border-up-gold focus:outline-none"
                  >
                    {ZONES.filter((z) => z !== "Toutes").map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-venue-address"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                >
                  Adresse précise
                </label>
                <input
                  id="new-venue-address"
                  type="text"
                  value={newVenueAddress}
                  onChange={(e) => setNewVenueAddress(e.target.value)}
                  placeholder="Ex : Boulevard de la Mer, Batterie IV, Libreville"
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/70 p-2.5 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="new-venue-security"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                >
                  Protocole de Sécurité &amp; Accueil
                </label>
                <textarea
                  id="new-venue-security"
                  rows={2}
                  value={newVenueSecurityNote}
                  onChange={(e) => setNewVenueSecurityNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/70 p-2.5 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="new-venue-manager-name"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                  >
                    Nom du Contact Sécurité / Manager
                  </label>
                  <input
                    id="new-venue-manager-name"
                    type="text"
                    value={newVenueManagerName}
                    onChange={(e) => setNewVenueManagerName(e.target.value)}
                    placeholder="Ex : M. Paul Nguema"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/70 p-2.5 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-venue-manager-phone"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-up-gray"
                  >
                    Téléphone Ligne Directe
                  </label>
                  <input
                    id="new-venue-manager-phone"
                    type="tel"
                    value={newVenueManagerPhone}
                    onChange={(e) => setNewVenueManagerPhone(e.target.value)}
                    placeholder="+241 077 ..."
                    className="mt-1 w-full rounded-xl border border-white/10 bg-up-black/70 p-2.5 text-xs text-up-white placeholder-up-gray focus:border-up-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-up-gray">
                  <input
                    type="checkbox"
                    checked={newVenueHasPrivateLounge}
                    onChange={(e) => setNewVenueHasPrivateLounge(e.target.checked)}
                    className="rounded text-up-gold"
                  />
                  <span>Salon Privé disponible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-up-gray">
                  <input
                    type="checkbox"
                    checked={newVenueHasValet}
                    onChange={(e) => setNewVenueHasValet(e.target.checked)}
                    className="rounded text-up-gold"
                  />
                  <span>Service Voiturier dédié</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-semibold text-up-gray hover:text-up-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-up-gold py-3 text-xs font-bold text-up-black hover:bg-up-gold-soft"
                >
                  Enregistrer le lieu certifié
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
