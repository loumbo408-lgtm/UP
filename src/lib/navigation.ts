import {
  CalendarCheck,
  Compass,
  LayoutDashboard,
  MapPin,
  Receipt,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppRole } from '@/types/database';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Barre de navigation basse, propre à chaque role. Les trois jeux sont
 * disjoints : aucun lien ne traverse d'un espace a l'autre.
 */
export const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  client: [
    { href: '/client', label: 'Découvrir', icon: Compass },
    { href: '/client/réservations', label: 'Missions', icon: CalendarCheck },
    { href: '/client/lieux', label: 'Lieux', icon: MapPin },
    { href: '/client/profil', label: 'Profil', icon: User },
  ],
  companion: [
    { href: '/companion', label: 'Missions', icon: Sparkles },
    { href: '/companion/revenus', label: 'Revenus', icon: Wallet },
    { href: '/companion/profil', label: 'Ma fiche', icon: User },
  ],
  admin: [
    { href: '/admin', label: 'Pilotage', icon: LayoutDashboard },
    { href: '/admin/vérifications', label: 'Vérifs', icon: ShieldCheck },
    { href: '/admin/séquestre', label: 'Séquestre', icon: Receipt },
    { href: '/admin/lieux', label: 'Lieux', icon: MapPin },
  ],
};
