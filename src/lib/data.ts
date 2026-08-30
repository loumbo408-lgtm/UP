export type Zone =
  | "Toutes"
  | "Akanda"
  | "Sablière"
  | "Louis"
  | "Batterie IV"
  | "Glass"
  | "Owendo";

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

export const COMPANIONS: Companion[] = [
  {
    id: "awa-n",
    name: "Awa N.",
    age: 26,
    headline: "Hôtesse de prestige & Accompagnement protocolaire",
    bio: "Diplômée en Relations Internationales et Communication à Libreville, j'apporte une présence soignée, élégante et un sens aigu du protocole lors de vos dîners d'affaires, réceptions officielles et événements caritatifs. Trilingue et habituée aux cercles diplomatiques et exécutifs.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
    ],
    verified: true,
    zone: "Glass",
    services: ["diner_affaires", "evenementiel", "discussion_cafe"],
    serviceLabels: ["Dîner d'affaires", "Événementiel prestige", "Accueil VIP"],
    hourlyRate: 25000,
    eveningRate: 75000,
    rating: 4.9,
    reviewCount: 38,
    languages: ["Français (Natif)", "Anglais (Courant C1)", "Espagnol (Intermédiaire)"],
    skills: ["Protocole diplomatique", "Discrétion absolue", "Excellente culture générale", "Éloquence"],
    education: "Master en Communication & Relations Publiques (UOB Libreville)",
    availabilityNote: "Disponible en soirée et week-ends sur réservation préalable (24h)",
    reviews: [
      {
        id: "rev-1",
        author: "Alain M.",
        date: "Il y a 3 jours",
        rating: 5,
        comment: "Prestation remarquable lors d'un dîner d'affaires au Radisson Blu. Awa maîtrise parfaitement les codes de bienséance et sait mettre à l'aise des interlocuteurs internationaux.",
        missionType: "Dîner d'affaires",
      },
      {
        id: "rev-2",
        author: "Sophie B.",
        date: "14 août 2026",
        rating: 5,
        comment: "Ponctuelle, raffinée et d'une discrétion exemplaire pour notre gala caritatif à la Sablière. Je recommande vivement ses services.",
        missionType: "Événementiel",
      },
      {
        id: "rev-3",
        author: "Directeur Général Cabinet",
        date: "28 juillet 2026",
        rating: 4.8,
        comment: "Excellente discussion et accompagnement impeccable. Présentation irréprochable.",
        missionType: "Discussion / Café",
      },
    ],
  },
  {
    id: "steeve-m",
    name: "Steeve M.",
    age: 30,
    headline: "Assistant personnel VIP & Chauffeur exécutif",
    bio: "Ancien officier de sécurité privée reconverti dans l'accompagnement exécutif. Je combine discrétion totale, maîtrise parfaite des itinéraires de Libreville (Akanda, Port-Gentil navettes) et gestion logistique complète de vos déplacements et rendez-vous confidentiels.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    ],
    verified: true,
    zone: "Batterie IV",
    services: ["aide_logistique", "evenementiel", "diner_affaires"],
    serviceLabels: ["Aide logistique VIP", "Chauffeur & Sécurité", "Escorte événementielle"],
    hourlyRate: 20000,
    eveningRate: 65000,
    rating: 4.8,
    reviewCount: 42,
    languages: ["Français (Natif)", "Anglais (Professionnel)"],
    skills: ["Conduite défensive", "Coordination logistique", "Assistance aéroport", "Gestion du temps"],
    education: "Certification Sécurité Privée & Transport VIP",
    availabilityNote: "Disponible 7j/7 avec préavis de 2h",
    reviews: [
      {
        id: "rev-4",
        author: "M. Ndong",
        date: "28 août 2026",
        rating: 5,
        comment: "Steeve est d'un professionnalisme sans faille. Itinéraires fluides malgré les embouteillages d'Oloumi, véhicule impeccable et tenue soignée.",
        missionType: "Aide logistique",
      },
      {
        id: "rev-5",
        author: "Jean-Christophe V.",
        date: "10 août 2026",
        rating: 4.7,
        comment: "Prise en charge à l'aéroport Léon-Mba et transfert sécurisé vers l'hôtel Nomad. Recommandé.",
        missionType: "Aide logistique",
      },
    ],
  },
  {
    id: "grace-k",
    name: "Grace K.",
    age: 25,
    headline: "Consultante culturelle & Hôtesse d'accueil haut de gamme",
    bio: "Passionnée d'art contemporain africain, d'histoire du Gabon et de haute gastronomie. J'accompagne dirigeants d'entreprises, investisseurs en visite et personnalités lors de leurs sorties culturelles, déjeuners à la Voile Rouge et vernissages exclusifs.",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop",
    ],
    verified: true,
    zone: "Sablière",
    services: ["diner_affaires", "discussion_cafe", "evenementiel"],
    serviceLabels: ["Dîner d'affaires", "Sortie culturelle & Café", "Cocktails privés"],
    hourlyRate: 30000,
    eveningRate: 90000,
    rating: 5.0,
    reviewCount: 29,
    languages: ["Français (Natif)", "Anglais (Bilingue)", "Mandarin (Notions d'affaires)"],
    skills: ["Guide culturel & Art", "Histoire locale", "Aisance relationnelle", "Écoute active"],
    education: "Licence en Médiation Culturelle & Tourisme Haut de Gamme",
    availabilityNote: "Disponible en journée et début de soirée à Akanda / Sablière",
    reviews: [
      {
        id: "rev-6",
        author: "Mme Okome",
        date: "24 août 2026",
        rating: 5,
        comment: "Une compagnie très stimulante et raffinée. Grace a su nous orienter vers les meilleures tables de la Sablière pour notre délégation.",
        missionType: "Dîner d'affaires",
      },
      {
        id: "rev-7",
        author: "Marc T.",
        date: "5 août 2026",
        rating: 5,
        comment: "Parfaite maîtrise des sujets économiques et artistiques. Un vrai plus lors d'une après-midi de networking.",
        missionType: "Discussion / Café",
      },
    ],
  },
  {
    id: "malik-b",
    name: "Malik B.",
    age: 28,
    headline: "Accompagnateur d'affaires & Traducteur bilingue",
    bio: "Spécialiste du monde des affaires pétrolier et minier au Gabon, j'assure l'accompagnement de délégations anglophones et francophones. Synthèse de réunions en amont, convivialité lors des déjeuners et respect scrupuleux des clauses de non-divulgation.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1000&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
    ],
    verified: true,
    zone: "Louis",
    services: ["diner_affaires", "aide_logistique", "discussion_cafe"],
    serviceLabels: ["Traduction & Interprétariat", "Dîner d'affaires", "Assistance délégations"],
    hourlyRate: 25000,
    eveningRate: 70000,
    rating: 4.9,
    reviewCount: 31,
    languages: ["Français (Natif)", "Anglais (Bilingue - Oxford C2)", "Portugais (Intermédiaire)"],
    skills: ["Traduction simultanée de courtoisie", "Connaissance du secteur pétro-gazier", "Patience", "Tenue de soirée"],
    education: "Master en Négociation Commerciale Internationale",
    availabilityNote: "Disponible semaine et week-ends sur Libreville et Port-Gentil",
    reviews: [
      {
        id: "rev-8",
        author: "David H. (Houston, TX)",
        date: "19 août 2026",
        rating: 5,
        comment: "Malik was instrumental in making our business dinner seamless. His English fluency and grasp of local business etiquette are unmatched.",
        missionType: "Dîner d'affaires",
      },
    ],
  },
  {
    id: "charlotte-m",
    name: "Charlotte M.",
    age: 27,
    headline: "Concierge privée & Accompagnement VIP de prestige",
    bio: "Dotée d'un carnet d'adresses d'exception à Libreville et d'une grande rigueur, j'assure l'accompagnement de personnalités exigeantes. Réservations exclusives, sens du détail, écoute et discrétion garantie sous contrat UP VIP.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop",
    ],
    verified: true,
    zone: "Akanda",
    services: ["evenementiel", "diner_affaires", "discussion_cafe", "aide_logistique"],
    serviceLabels: ["Conciergerie privée", "Soirées de prestige", "Dîner gastronomique"],
    hourlyRate: 35000,
    eveningRate: 100000,
    rating: 5.0,
    reviewCount: 45,
    languages: ["Français (Natif)", "Anglais (Courant)", "Italien (Intermédiaire)"],
    skills: ["Sommellerie & Gastronomie", "Protocole privé", "Réservations prioritaires", "Élégance naturelle"],
    education: "Diplôme de Management de l'Hôtellerie de Luxe",
    availabilityNote: "Réservé en priorité aux membres UP VIP",
    reviews: [
      {
        id: "rev-9",
        author: "Patrice K.",
        date: "22 août 2026",
        rating: 5,
        comment: "Charlotte représente l'excellence du service. Table parfaite à l'Hôtel Nomad, organisation au millimètre et présence très agréable.",
        missionType: "Dîner d'affaires",
      },
    ],
  },
  {
    id: "alexandre-b",
    name: "Alexandre B.",
    age: 29,
    headline: "Guide exécutif & Assistant logistique événementiel",
    bio: "Spécialisé dans l'assistance opérationnelle et le guidage pour les investisseurs et délégations à Owendo et Libreville. Organisation des transferts portuaires, sécurisation des plannings et accompagnement courtois lors des réceptions d'entreprises.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    ],
    verified: true,
    zone: "Owendo",
    services: ["aide_logistique", "evenementiel", "discussion_cafe"],
    serviceLabels: ["Aide logistique & Port", "Accueil délégations", "Organisation de planning"],
    hourlyRate: 20000,
    eveningRate: 60000,
    rating: 4.8,
    reviewCount: 22,
    languages: ["Français (Natif)", "Anglais (Intermédiaire)"],
    skills: ["Réseau Owendo / Zone économique", "Logistique terrain", "Ponctualité stricte", "Sens de l'écoute"],
    education: "Licence en Gestion Logistique & Transport",
    availabilityNote: "Disponible en journée et soirées sur Owendo / Libreville Sud",
    reviews: [
      {
        id: "rev-10",
        author: "Gaston E.",
        date: "12 août 2026",
        rating: 4.8,
        comment: "Très bonne prise en charge de nos partenaires à Owendo. Fiable et très courtois.",
        missionType: "Aide logistique",
      },
    ],
  },
];
