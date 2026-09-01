import { type Zone, SECURE_PUBLIC_VENUES, type PublicVenue } from "@/lib/data";

export interface KycApplicant {
  id: string;
  fullName: string;
  age: number;
  birthDate: string;
  gender: "F" | "M";
  nationalIdNumber: string; // NIF ou Numéro CNI gabonaise
  idDocumentType: "cni_gabon" | "passeport_gabon" | "carte_sejour";
  idDocumentUrl: string;
  idDocumentBackUrl?: string;
  selfieVideoUrl: string;
  selfieThumbnailUrl: string;
  phoneNumber: string;
  operator: "airtel_money" | "moov_money";
  zone: Zone;
  headline: string;
  bio: string;
  hourlyRateXaf: number;
  eveningRateXaf: number;
  services: string[];
  languages: string[];
  education: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedAt?: string;
}

export interface AdminEscrowRecord {
  id: string;
  missionId: string;
  transactionRef: string;
  clientName: string;
  clientPhone: string;
  companionName: string;
  companionPhone: string;
  venueName: string;
  venueZone: string;
  date: string;
  time: string;
  durationHours: number;
  companionFeeXaf: number;
  platformFeeXaf: number;
  totalAmountXaf: number;
  paymentOperator: "airtel_money" | "moov_money";
  status: "held" | "disputed" | "released_to_companion" | "refunded_to_client";
  heldAt: string;
  settledAt?: string;
  disputeReason?: string;
  arbitrationLog?: string[];
}

export interface VenueAdminItem extends PublicVenue {
  status: "active" | "inactive";
  partnerSince: string;
  securityLevel: "5_stars" | "4_stars" | "3_stars";
  managerName: string;
  managerPhone: string;
  monthlyMissionsCount: number;
  hasPrivateLounge: boolean;
  hasDedicatedValet: boolean;
}

// Mode Données Réelles : La liste des dossiers KYC est gérée exclusivement via la base Supabase.
export const INITIAL_KYC_APPLICANTS: KycApplicant[] = [];

export const INITIAL_ADMIN_ESCROWS: AdminEscrowRecord[] = [];

export const INITIAL_ADMIN_VENUES: VenueAdminItem[] = SECURE_PUBLIC_VENUES.map(
  (v, idx) => ({
    ...v,
    status: "active",
    partnerSince: "2026",
    securityLevel: idx === 1 ? "5_stars" : "4_stars",
    managerName: idx === 1 ? "Direction de la Sécurité" : "Responsable Accueil & Protocole",
    managerPhone: "+241 011 76 00 00",
    monthlyMissionsCount: 0,
    hasPrivateLounge: true,
    hasDedicatedValet: idx < 4,
  }),
);
