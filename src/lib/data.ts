// =============================================================================
// UP GABON — Constantes Géographiques, Réglementaires et Référentiels Officiels
// =============================================================================

export type Zone =
  | "Toutes"
  | "Akanda"
  | "Sablière"
  | "Louis"
  | "Batterie IV"
  | "Glass"
  | "Owendo"
  | "Port-Gentil";

export type ServiceCategory =
  | "all"
  | "diner_affaires"
  | "evenementiel"
  | "discussion_cafe"
  | "aide_logistique";

export interface ServiceDefinition {
  id: ServiceCategory;
  label: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const SERVICE_CATEGORIES: ServiceDefinition[] = [
  {
    id: "all",
    label: "Tous les types",
    shortLabel: "Tous",
    iconName: "Sparkles",
    description: "Toutes les prestations disponibles",
  },
  {
    id: "diner_affaires",
    label: "Dîner d'affaires",
    shortLabel: "Dîner d'affaires",
    iconName: "Utensils",
    description: "Accompagnement distingué pour déjeuners et dîners professionnels",
  },
  {
    id: "evenementiel",
    label: "Événementiel",
    shortLabel: "Événementiel",
    iconName: "PartyPopper",
    description: "Galas, cocktails, soirées privées, vernissages et réceptions officielles",
  },
  {
    id: "discussion_cafe",
    label: "Discussion / Café",
    shortLabel: "Discussion/Café",
    iconName: "Coffee",
    description: "Échange intellectuel, conversation en salon de thé ou espace lounge",
  },
  {
    id: "aide_logistique",
    label: "Aide logistique",
    shortLabel: "Aide logistique",
    iconName: "Briefcase",
    description: "Assistance personnelle, conciergerie locale, accueil aéroport et guidage VIP",
  },
];

export const ZONES: Zone[] = [
  "Toutes",
  "Akanda",
  "Sablière",
  "Louis",
  "Batterie IV",
  "Glass",
  "Owendo",
  "Port-Gentil",
];

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
  missionType: string;
}

export interface Companion {
  id: string;
  name: string;
  age: number;
  headline: string;
  bio: string;
  avatar: string;
  photos: string[];
  verified: boolean;
  zone: Zone;
  services: ServiceCategory[];
  serviceLabels: string[];
  hourlyRate: number; // in FCFA (XAF)
  eveningRate: number; // in FCFA (XAF)
  rating: number;
  reviewCount: number;
  languages: string[];
  skills: string[];
  education: string;
  availabilityNote: string;
  reviews: Review[];
}

export interface PublicVenue {
  id: string;
  name: string;
  category: "Hôtel & Restaurant" | "Lounge & Bar" | "Café & Pâtisserie" | "Espace Promenade";
  zone: Zone;
  address: string;
  securityNote: string;
}

export const SECURE_PUBLIC_VENUES: PublicVenue[] = [
  {
    id: "nomad-akanda",
    name: "L'Hôtel Nomad & Restaurant Le Bistro",
    category: "Hôtel & Restaurant",
    zone: "Akanda",
    address: "Route d'Avorbam / Les Charbonnages, Akanda",
    securityNote: "Sécurité 24/7, parking gardé, cadre prestigieux et feutré",
  },
  {
    id: "radisson-ombali",
    name: "Radisson Blu — Restaurant O'Mbali",
    category: "Hôtel & Restaurant",
    zone: "Batterie IV",
    address: "Boulevard de la Mer, Batterie IV, Libreville",
    securityNote: "Établissement 5 étoiles, contrôle d'accès strict, vue mer panoramique",
  },
  {
    id: "voile-rouge-sabliere",
    name: "La Voile Rouge Restaurant Lounge",
    category: "Hôtel & Restaurant",
    zone: "Sablière",
    address: "Front de Mer, Quartier Sablière, Libreville",
    securityNote: "Espace gastronomique sécurisé et discret au bord de l'eau",
  },
  {
    id: "etoile-sud-louis",
    name: "L'Étoile du Sud — Restaurant & Lounge",
    category: "Lounge & Bar",
    zone: "Louis",
    address: "Quartier Louis, Bord de Mer, Libreville",
    securityNote: "Quartier animé, voiturier et présence de vigiles assermentés",
  },
  {
    id: "pelisson-centre",
    name: "Le Pelisson — Pâtisserie & Salon de Thé",
    category: "Café & Pâtisserie",
    zone: "Glass",
    address: "Centre-ville / Bord de mer, Libreville",
    securityNote: "Salon de thé historique haut de gamme, idéal pour discussions diurnes",
  },
  {
    id: "cafe-flore-louis",
    name: "Café de Flore — Espace VIP",
    category: "Café & Pâtisserie",
    zone: "Louis",
    address: "Avenue Monseigneur Bessieux, Quartier Louis",
    securityNote: "Ambiance cosy, personnel attentif et discrétion assurée",
  },
  {
    id: "maya-batterie4",
    name: "Le Maya Lounge & Skybar",
    category: "Lounge & Bar",
    zone: "Batterie IV",
    address: "Haut de Batterie IV, Libreville",
    securityNote: "Accès filtré, cadre contemporain VIP avec terrasse privatisable",
  },
  {
    id: "baie-des-rois",
    name: "La Baie des Rois — Promenade & Club House",
    category: "Espace Promenade",
    zone: "Glass",
    address: "Nouveau Front de Mer, Libreville",
    securityNote: "Nouveau quartier d'affaires surveillé, caméras et patrouilles privées",
  },
  {
    id: "residence-le-biniou",
    name: "Le Biniou Restaurant Gastronomique",
    category: "Hôtel & Restaurant",
    zone: "Owendo",
    address: "Avenue d'Owendo / Haut de Gué-Gué",
    securityNote: "Atmosphère feutrée, service impeccable pour dîners d'affaires",
  },
];

// Mode Données Réelles : La liste des profils est gérée exclusivement via la base Supabase.
export const COMPANIONS: Companion[] = [];
