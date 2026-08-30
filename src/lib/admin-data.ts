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

export const INITIAL_KYC_APPLICANTS: KycApplicant[] = [
  {
    id: "kyc-app-1",
    fullName: "Ornella Mboumba",
    age: 26,
    birthDate: "14/05/2000",
    gender: "F",
    nationalIdNumber: "GA-CNI-2023-8849201",
    idDocumentType: "cni_gabon",
    idDocumentUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    idDocumentBackUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1000&auto=format&fit=crop",
    selfieVideoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    selfieThumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    phoneNumber: "074 88 12 34",
    operator: "airtel_money",
    zone: "Akanda",
    headline: "Hôtesse bilingue & Accompagnement dîners protocolaires",
    bio: "Diplômée en Langues Étrangères Appliquées (UOB). Expérience de 3 ans dans l'accueil VIP lors des sommets internationaux à Libreville.",
    hourlyRateXaf: 30000,
    eveningRateXaf: 85000,
    services: ["Dîner d'affaires", "Événementiel", "Discussion / Café"],
    languages: ["Français", "Anglais", "Espagnol"],
    education: "Master en Communication Internationale",
    submittedAt: "Aujourd'hui à 14h20",
    status: "pending",
  },
  {
    id: "kyc-app-2",
    fullName: "Cédric Ondo Nguema",
    age: 29,
    birthDate: "02/11/1997",
    gender: "M",
    nationalIdNumber: "GA-PASS-2024-419082",
    idDocumentType: "passeport_gabon",
    idDocumentUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop",
    selfieVideoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    selfieThumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    phoneNumber: "066 45 90 12",
    operator: "moov_money",
    zone: "Batterie IV",
    headline: "Assistant d'affaires & Guidage exécutif pétro-gazier",
    bio: "Ingénieur d'affaires reconverti dans le conseil exécutif. Parfaite connaissance des cercles économiques de Port-Gentil et Libreville.",
    hourlyRateXaf: 35000,
    eveningRateXaf: 95000,
    services: ["Aide logistique", "Dîner d'affaires", "Traduction"],
    languages: ["Français", "Anglais"],
    education: "Master en Gestion des Entreprises",
    submittedAt: "Aujourd'hui à 11h45",
    status: "pending",
  },
  {
    id: "kyc-app-3",
    fullName: "Jessica Bekale",
    age: 25,
    birthDate: "19/08/2001",
    gender: "F",
    nationalIdNumber: "GA-CNI-2022-7712390",
    idDocumentType: "cni_gabon",
    idDocumentUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000&auto=format&fit=crop",
    selfieVideoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
    selfieThumbnailUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
    phoneNumber: "077 12 67 89",
    operator: "airtel_money",
    zone: "Sablière",
    headline: "Consultante en art contemporain & Relations publiques",
    bio: "Passionnée par le patrimoine culturel gabonais, j'accompagne les délégations pour les vernissages et rendez-vous d'affaires.",
    hourlyRateXaf: 28000,
    eveningRateXaf: 80000,
    services: ["Événementiel", "Dîner d'affaires", "Discussion / Café"],
    languages: ["Français", "Anglais", "Italien"],
    education: "Licence en Médiation Culturelle",
    submittedAt: "Hier à 18h10",
    status: "pending",
  },
];

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
