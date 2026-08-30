import {
  Building2,
  CalendarCheck,
  CircleDot,
  Compass,
  Crown,
  LayoutDashboard,
  MapPin,
  Radar,
  Scale,
  ShieldCheck,
  User,
  UserCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Bottom navigation — espace Client. */
export const clientNav: NavItem[] = [
  { href: "/explore", label: "Découvrir", icon: Compass },
  { href: "/client/reservations", label: "Réservations", icon: CalendarCheck },
  { href: "/client/vip", label: "VIP", icon: Crown },
  { href: "/client/profil", label: "Profil", icon: User },
];

/** Bottom navigation — espace Prestataire. */
export const prestataireNav: NavItem[] = [
  { href: "/dashboard/companion", label: "Radar", icon: Radar },
  { href: "/prestataire/gains", label: "Gains", icon: Wallet },
  { href: "/prestataire/disponibilite", label: "Dispo", icon: CircleDot },
  { href: "/prestataire/profil", label: "Profil", icon: User },
];

/** Bottom / Sidebar navigation — Espace Administration & Modération UP. */
export const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Aperçu", icon: LayoutDashboard },
  { href: "/dashboard/admin/kyc", label: "Modération KYC", icon: UserCheck },
  { href: "/dashboard/admin/escrows", label: "Séquestres", icon: Scale },
  { href: "/dashboard/admin/venues", label: "Lieux Publics", icon: Building2 },
];
