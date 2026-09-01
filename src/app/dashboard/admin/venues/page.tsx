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
    <main className="min-h-dvh bg-[#FAF9FB] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0E6F3] pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-up-700">
            <ShieldCheck size={13} />
            Périmètre de Sécurité &amp; Protocole Public
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-[#1D0F24] sm:text-3xl">
            Lieux Publics Autorisés
          </h1>
          <p className="text-xs text-[#6B5D73]">
            Gestion du référentiel exclusif des restaurants, salons et hôtels certifiés pour les missions UP à Libreville.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-up-500 hover:bg-up-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
        >
          <Plus size={16} />
          <span>Ajouter un lieu certifié</span>
        </button>
      </div>

      {/* Toast de notification */}
      {toastMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Barre de recherche et filtre par Quartier */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5D73]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom de restaurant/hôtel, adresse, quartier..."
            className="w-full rounded-2xl border border-[#F0E6F3] bg-white py-2.5 pl-10 pr-4 text-xs text-[#1D0F24] placeholder-[#6B5D73] focus:border-up-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Filtre par zone */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {ZONES.map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setSelectedZone(zone)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                selectedZone === zone
                  ? "bg-up-500 text-white font-bold shadow-xs"
                  : "border border-[#F0E6F3] bg-white text-[#6B5D73] hover:border-up-200 hover:text-[#1D0F24]"
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des Lieux Partenaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVenues.map((venue) => {
          const isActive = venue.status === "active";

          return (
            <div
              key={venue.id}
              className={`overflow-hidden rounded-3xl border p-5 transition-all space-y-3.5 shadow-xs ${
                isActive
                  ? "border-[#F0E6F3] bg-white hover:border-up-200"
                  : "border-[#F0E6F3] bg-white/60 opacity-60"
              }`}
            >
              {/* Header carte lieu */}
              <div className="flex items-start justify-between gap-2 border-b border-[#F0E6F3] pb-3">
                <div>
                  <span className="rounded-full border border-up-200 bg-up-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-up-700">
                    {venue.category}
                  </span>
                  <h2 className="font-display text-base font-bold text-[#1D0F24] mt-1.5">
                    {venue.name}
                  </h2>
                  <p className="text-xs text-[#6B5D73] flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-up-500 shrink-0" />
                    <span>{venue.zone}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleAdminVenueStatus(venue.id)}
                    className={`rounded-xl p-2 transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-gray-100 text-[#6B5D73] hover:text-[#1D0F24]"
                    }`}
                    title={isActive ? "Désactiver le lieu" : "Activer le lieu"}
                  >
                    <Power size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(venue)}
                    className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 transition"
                    title="Supprimer le lieu"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Adresse & Dispositif de Sécurité */}
              <div className="space-y-1.5 text-xs text-[#6B5D73]">
                <p className="text-[11px] text-[#1D0F24] font-medium">
                  📍 {venue.address}
                </p>
                <p className="rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-[11px] text-emerald-800 leading-relaxed font-medium">
                  🛡️ {venue.securityNote}
                </p>
              </div>

              {/* Caractéristiques & Manager */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#6B5D73] border-t border-[#F0E6F3] pt-2.5">
                <div>
                  <span className="block text-[#6B5D73]">Manager de garde :</span>
                  <span className="font-semibold text-[#1D0F24]">
                    {venue.managerName}
                  </span>
                  <span className="block font-mono text-up-700 font-bold">
                    {venue.managerPhone}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[#6B5D73]">Statut &amp; Volume :</span>
                  <span className="font-semibold text-[#1D0F24]">
                    {venue.monthlyMissionsCount} missions/mois
                  </span>
                  <span className="block text-emerald-600 font-bold">
                    {isActive ? "✓ Actif au catalogue" : "Désactivé"}
                  </span>
                </div>
              </div>

              {/* Badges d'options VIP */}
              <div className="flex flex-wrap gap-1 pt-1">
                {venue.hasPrivateLounge && (
                  <span className="rounded-full border border-[#F0E6F3] bg-[#FAF9FB] px-2.5 py-0.5 text-[9px] text-[#6B5D73]">
                    Salon Privé
                  </span>
                )}
                {venue.hasDedicatedValet && (
                  <span className="rounded-full border border-[#F0E6F3] bg-[#FAF9FB] px-2.5 py-0.5 text-[9px] text-[#6B5D73]">
                    Service Voiturier
                  </span>
                )}
                <span className="rounded-full border border-up-200 bg-up-50 px-2.5 py-0.5 text-[9px] font-bold text-up-700">
                  Sécurité UP 5★
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'Ajout d'un Nouveau Lieu Public Partenaire */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D0F24]/60 p-5 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-700">
                <Building2 size={16} />
                Nouveau Lieu Public Partenaire UP
              </span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6B5D73] hover:text-[#1D0F24]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-3.5 text-left text-xs">
              <div>
                <label
                  htmlFor="new-venue-name"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-up-700"
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
                  className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] placeholder-[#6B5D73] focus:border-up-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="new-venue-category"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
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
                    className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
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
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
                  >
                    Quartier / Zone
                  </label>
                  <select
                    id="new-venue-zone"
                    value={newVenueZone}
                    onChange={(e) => setNewVenueZone(e.target.value as Zone)}
                    className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
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
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
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
                  className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] placeholder-[#6B5D73] focus:border-up-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="new-venue-security"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
                >
                  Protocole de Sécurité &amp; Accueil
                </label>
                <textarea
                  id="new-venue-security"
                  rows={2}
                  value={newVenueSecurityNote}
                  onChange={(e) => setNewVenueSecurityNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] placeholder-[#6B5D73] focus:border-up-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="new-venue-manager-name"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
                  >
                    Nom du Contact Sécurité / Manager
                  </label>
                  <input
                    id="new-venue-manager-name"
                    type="text"
                    value={newVenueManagerName}
                    onChange={(e) => setNewVenueManagerName(e.target.value)}
                    placeholder="Ex : M. Paul Nguema"
                    className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] placeholder-[#6B5D73] focus:border-up-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-venue-manager-phone"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
                  >
                    Téléphone Ligne Directe
                  </label>
                  <input
                    id="new-venue-manager-phone"
                    type="tel"
                    value={newVenueManagerPhone}
                    onChange={(e) => setNewVenueManagerPhone(e.target.value)}
                    placeholder="+241 077 ..."
                    className="mt-1 w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] placeholder-[#6B5D73] focus:border-up-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6B5D73]">
                  <input
                    type="checkbox"
                    checked={newVenueHasPrivateLounge}
                    onChange={(e) => setNewVenueHasPrivateLounge(e.target.checked)}
                    className="rounded accent-[#8807A8]"
                  />
                  <span>Salon Privé disponible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6B5D73]">
                  <input
                    type="checkbox"
                    checked={newVenueHasValet}
                    onChange={(e) => setNewVenueHasValet(e.target.checked)}
                    className="rounded accent-[#8807A8]"
                  />
                  <span>Service Voiturier dédié</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#F0E6F3]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-full border border-[#F0E6F3] py-3 text-xs font-semibold text-[#6B5D73] hover:text-[#1D0F24]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-up-500 py-3 text-xs font-bold text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98]"
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
