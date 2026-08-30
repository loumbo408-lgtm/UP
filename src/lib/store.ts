"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type KycApplicant,
  type AdminEscrowRecord,
  type VenueAdminItem,
  INITIAL_KYC_APPLICANTS,
  INITIAL_ADMIN_ESCROWS,
  INITIAL_ADMIN_VENUES,
} from "@/lib/admin-data";

export type Role = "client" | "prestataire" | "admin";

export type ReservationStatus =
  | "demande_envoyee"
  | "acceptee"
  | "sequestre_bloque"
  | "en_cours"
  | "terminee"
  | "annulee";

export interface EscrowDetails {
  transactionRef: string;
  paymentOperator: "airtel_money" | "moov_money";
  phoneNumber: string;
  otpCode: string;
  heldAt: string;
  settledAt?: string;
  payoutRef?: string;
}

export interface ClientReservation {
  id: string;
  companionId: string;
  companionName: string;
  companionAvatar: string;
  companionZone: string;
  date: string;
  time: string;
  durationHours: number;
  venueName: string;
  venueAddress: string;
  serviceCategory: string;
  serviceLabel: string;
  companionFee: number;
  platformFee: number;
  totalAmount: number;
  notes?: string;
  status: ReservationStatus;
  escrow?: EscrowDetails;
  createdAt: string;
}

export interface PrestataireGainRecord {
  id: string;
  label: string;
  date: string;
  montant: string;
  rawAmount: number;
  payoutRef?: string;
}

export interface RadarDemand {
  id: string;
  clientName: string;
  clientVerified: boolean;
  service: string;
  date: string;
  time: string;
  venueName: string;
  venueZone: string;
  durationHours: number;
  netEarnings: number;
  notes?: string;
  status: "pending" | "accepted" | "declined" | "escrow_funded" | "completed";
}

type UpState = {
  /** Rôle actif choisi sur la page d'aiguillage. */
  role: Role | null;
  /** Disponibilité du prestataire (visible dans le radar des clients). */
  available: boolean;
  /** Solde en FCFA du prestataire */
  prestataireBalance: number;
  /** Historique des gains du prestataire */
  prestataireGains: PrestataireGainRecord[];
  /** Liste des réservations passées / en cours du client. */
  reservations: ClientReservation[];
  /** Demandes radar entrantes pour le prestataire */
  radarDemands: RadarDemand[];

  /** Données Administrateur */
  kycApplicants: KycApplicant[];
  adminEscrows: AdminEscrowRecord[];
  adminVenues: VenueAdminItem[];

  setRole: (role: Role) => void;
  clearRole: () => void;
  setAvailable: (value: boolean) => void;
  addReservation: (
    data: Omit<ClientReservation, "id" | "createdAt" | "status">,
  ) => string;
  setReservationEscrowHeld: (
    reservationId: string,
    escrow: EscrowDetails,
  ) => void;
  completeMissionWithOtp: (
    reservationId: string,
    payoutRef: string,
    amountReleased: number,
  ) => void;
  cancelReservation: (id: string) => void;
  acceptRadarDemand: (id: string) => void;
  declineRadarDemand: (id: string) => void;
  withdrawEarnings: (amount: number, operator: string, phone: string) => void;

  /** Actions Administrateur */
  approveKycApplicant: (applicantId: string) => void;
  rejectKycApplicant: (applicantId: string, reason: string) => void;
  forceReleaseAdminEscrow: (escrowId: string, note?: string) => void;
  forceRefundAdminEscrow: (escrowId: string, note?: string) => void;
  addAdminVenue: (venueData: Omit<VenueAdminItem, "id" | "partnerSince">) => void;
  deleteAdminVenue: (venueId: string) => void;
  toggleAdminVenueStatus: (venueId: string) => void;
};

const INITIAL_RADAR_DEMANDS: RadarDemand[] = [
  {
    id: "dem-1",
    clientName: "M. Ndong (DG Groupe)",
    clientVerified: true,
    service: "Dîner d'affaires prestige",
    date: "Ce soir",
    time: "20h00",
    venueName: "Radisson Blu — Restaurant O'Mbali",
    venueZone: "Batterie IV · 3,8 km",
    durationHours: 3,
    netEarnings: 75000,
    notes: "Délégation d'investisseurs de passage. Tenue de soirée exigée.",
    status: "pending",
  },
  {
    id: "dem-2",
    clientName: "Mme Okome",
    clientVerified: true,
    service: "Accompagnement vernissage d'art",
    date: "Samedi",
    time: "18h30",
    venueName: "La Voile Rouge Restaurant Lounge",
    venueZone: "Sablière · 7,5 km",
    durationHours: 4,
    netEarnings: 90000,
    notes: "Vernissage caritatif et cocktail dînatoire.",
    status: "pending",
  },
  {
    id: "dem-3",
    clientName: "Dr. Alain M.",
    clientVerified: true,
    service: "Discussion & Conseil en Salon",
    date: "Dimanche",
    time: "15h00",
    venueName: "L'Hôtel Nomad — Espace Lounge",
    venueZone: "Akanda · 5,2 km",
    durationHours: 2,
    netEarnings: 50000,
    notes: "Échange professionnel en salon feutré.",
    status: "pending",
  },
];

export const useUpStore = create<UpState>()(
  persist(
    (set, get) => ({
      role: null,
      available: true,
      prestataireBalance: 125000,
      prestataireGains: [
        {
          id: "gain-1",
          label: "Dîner d'affaires — M. Ndong",
          date: "28 août",
          montant: "+ 75 000",
          rawAmount: 75000,
        },
        {
          id: "gain-2",
          label: "Assistant protocolaire — Mme Okome",
          date: "24 août",
          montant: "+ 90 000",
          rawAmount: 90000,
        },
        {
          id: "gain-3",
          label: "Retrait Airtel Money vers +241 074...",
          date: "20 août",
          montant: "− 40 000",
          rawAmount: -40000,
        },
      ],
      reservations: [],
      radarDemands: INITIAL_RADAR_DEMANDS,

      // Initial admin records
      kycApplicants: INITIAL_KYC_APPLICANTS,
      adminEscrows: INITIAL_ADMIN_ESCROWS,
      adminVenues: INITIAL_ADMIN_VENUES,

      setRole: (role) => {
        // Synchroniser également le cookie up_role pour le middleware
        if (typeof document !== "undefined") {
          document.cookie = `up_role=${role}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({ role });
      },
      clearRole: () => {
        if (typeof document !== "undefined") {
          document.cookie = "up_role=; path=/; max-age=0";
        }
        set({ role: null });
      },
      setAvailable: (value) => set({ available: value }),
      addReservation: (data) => {
        const id = `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newReservation: ClientReservation = {
          ...data,
          id,
          status: "demande_envoyee",
          createdAt: new Date().toISOString(),
        };
        set({ reservations: [newReservation, ...get().reservations] });
        return id;
      },
      setReservationEscrowHeld: (reservationId, escrow) => {
        set({
          reservations: get().reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: "sequestre_bloque",
                  escrow,
                }
              : r,
          ),
        });
      },
      completeMissionWithOtp: (reservationId, payoutRef, amountReleased) => {
        const targetRes = get().reservations.find((r) => r.id === reservationId);
        const label = targetRes
          ? `${targetRes.serviceLabel} — ${targetRes.companionName}`
          : "Prestation terminée";

        set({
          reservations: get().reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: "terminee",
                  escrow: r.escrow
                    ? {
                        ...r.escrow,
                        settledAt: new Date().toISOString(),
                        payoutRef,
                      }
                    : undefined,
                }
              : r,
          ),
          prestataireBalance: get().prestataireBalance + amountReleased,
          prestataireGains: [
            {
              id: `gain-${Date.now()}`,
              label,
              date: "Aujourd'hui",
              montant: `+ ${amountReleased.toLocaleString("fr-FR")}`,
              rawAmount: amountReleased,
              payoutRef,
            },
            ...get().prestataireGains,
          ],
        });
      },
      cancelReservation: (id) => {
        set({
          reservations: get().reservations.map((r) =>
            r.id === id ? { ...r, status: "annulee" } : r,
          ),
        });
      },
      acceptRadarDemand: (id) => {
        set({
          radarDemands: get().radarDemands.map((d) =>
            d.id === id ? { ...d, status: "accepted" } : d,
          ),
        });
      },
      declineRadarDemand: (id) => {
        set({
          radarDemands: get().radarDemands.map((d) =>
            d.id === id ? { ...d, status: "declined" } : d,
          ),
        });
      },
      withdrawEarnings: (amount, operator, phone) => {
        const opLabel = operator === "airtel_money" ? "Airtel Money" : "Moov Money";
        set({
          prestataireBalance: get().prestataireBalance - amount,
          prestataireGains: [
            {
              id: `gain-${Date.now()}`,
              label: `Retrait ${opLabel} (+241 ${phone})`,
              date: "Aujourd'hui",
              montant: `− ${amount.toLocaleString("fr-FR")}`,
              rawAmount: -amount,
            },
            ...get().prestataireGains,
          ],
        });
      },

      // Admin actions
      approveKycApplicant: (applicantId) => {
        set({
          kycApplicants: get().kycApplicants.map((app) =>
            app.id === applicantId
              ? {
                  ...app,
                  status: "approved",
                  reviewedAt: new Date().toISOString(),
                }
              : app,
          ),
        });
      },
      rejectKycApplicant: (applicantId, reason) => {
        set({
          kycApplicants: get().kycApplicants.map((app) =>
            app.id === applicantId
              ? {
                  ...app,
                  status: "rejected",
                  rejectionReason: reason,
                  reviewedAt: new Date().toISOString(),
                }
              : app,
          ),
        });
      },
      forceReleaseAdminEscrow: (escrowId, note) => {
        set({
          adminEscrows: get().adminEscrows.map((esc) =>
            esc.id === escrowId
              ? {
                  ...esc,
                  status: "released_to_companion",
                  settledAt: new Date().toISOString(),
                  arbitrationLog: [
                    ...(esc.arbitrationLog || []),
                    `Arbitrage UP (${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}) : Déblocage forcé des fonds vers le prestataire. ${note ? "Motif : " + note : ""}`,
                  ],
                }
              : esc,
          ),
        });
      },
      forceRefundAdminEscrow: (escrowId, note) => {
        set({
          adminEscrows: get().adminEscrows.map((esc) =>
            esc.id === escrowId
              ? {
                  ...esc,
                  status: "refunded_to_client",
                  settledAt: new Date().toISOString(),
                  arbitrationLog: [
                    ...(esc.arbitrationLog || []),
                    `Arbitrage UP (${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}) : Remboursement intégral exécuté vers le compte client. ${note ? "Motif : " + note : ""}`,
                  ],
                }
              : esc,
          ),
        });
      },
      addAdminVenue: (venueData) => {
        const id = `venue-${Date.now()}`;
        const newVenue: VenueAdminItem = {
          ...venueData,
          id,
          partnerSince: "Août 2026",
        };
        set({ adminVenues: [newVenue, ...get().adminVenues] });
      },
      deleteAdminVenue: (venueId) => {
        set({
          adminVenues: get().adminVenues.filter((v) => v.id !== venueId),
        });
      },
      toggleAdminVenueStatus: (venueId) => {
        set({
          adminVenues: get().adminVenues.map((v) =>
            v.id === venueId
              ? {
                  ...v,
                  status: v.status === "active" ? "inactive" : "active",
                }
              : v,
          ),
        });
      },
    }),
    { name: "up-store" },
  ),
);
