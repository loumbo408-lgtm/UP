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

export const INITIAL_ADMIN_ESCROWS: AdminEscrowRecord[] = [
  {
    id: "esc-adm-1",
    missionId: "mis-701",
    transactionRef: "UP-ESCROW-20260830-AIRTEL-9A4F",
    clientName: "M. Ndong (DG Groupe)",
    clientPhone: "+241 074 11 22 33",
    companionName: "Awa N.",
    companionPhone: "+241 074 99 88 77",
    venueName: "Radisson Blu — Restaurant O'Mbali",
    venueZone: "Batterie IV",
    date: "Ce soir",
    time: "19h30",
    durationHours: 3,
    companionFeeXaf: 75000,
    platformFeeXaf: 7500,
    totalAmountXaf: 82500,
    paymentOperator: "airtel_money",
    status: "held",
    heldAt: "30 août 2026 18:15",
  },
  {
    id: "esc-adm-2",
    missionId: "mis-702",
    transactionRef: "UP-ESCROW-20260830-MOOV-7B2C",
    clientName: "M. Jean-Paul B.",
    clientPhone: "+241 066 88 44 11",
    companionName: "Grace K.",
    companionPhone: "+241 062 33 55 99",
    venueName: "La Voile Rouge Restaurant Lounge",
    venueZone: "Sablière",
    date: "Ce soir",
    time: "20h00",
    durationHours: 4,
    companionFeeXaf: 90000,
    platformFeeXaf: 9000,
    totalAmountXaf: 99000,
    paymentOperator: "moov_money",
    status: "held",
    heldAt: "30 août 2026 17:40",
  },
  {
    id: "esc-adm-3",
    missionId: "mis-699",
    transactionRef: "UP-ESCROW-20260830-AIRTEL-3K8D",
    clientName: "M. Patrick V.",
    clientPhone: "+241 077 55 12 90",
    companionName: "Steeve M.",
    companionPhone: "+241 074 22 11 44",
    venueName: "L'Hôtel Nomad — Espace Lounge",
    venueZone: "Akanda",
    date: "Aujourd'hui",
    time: "15h00",
    durationHours: 2,
    companionFeeXaf: 50000,
    platformFeeXaf: 5000,
    totalAmountXaf: 55000,
    paymentOperator: "airtel_money",
    status: "disputed",
    heldAt: "30 août 2026 14:10",
    disputeReason: "Le client signale un départ anticipé du prestataire après 45 minutes suite à un appel urgent.",
    arbitrationLog: [
      "30/08 16:15 : Réclamation client enregistrée par la conciergerie UP",
      "30/08 16:30 : Prestataire contacté, confirme l'urgence médicale familiale",
    ],
  },
];

export const INITIAL_ADMIN_VENUES: VenueAdminItem[] = SECURE_PUBLIC_VENUES.map(
  (v, idx) => ({
    ...v,
    status: "active",
    partnerSince: idx % 2 === 0 ? "Janvier 2026" : "Mars 2026",
    securityLevel: idx === 1 ? "5_stars" : "4_stars",
    managerName: idx === 1 ? "M. Jean-Marc Obiang (Directeur Sécurité)" : "Mme Laure Mve (Responsable Accueil)",
    managerPhone: "+241 011 76 00 0" + idx,
    monthlyMissionsCount: 14 + idx * 3,
    hasPrivateLounge: true,
    hasDedicatedValet: idx < 4,
  }),
);
