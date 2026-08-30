import type {
  BookingStatus,
  EscrowStatus,
  PaymentProvider,
  VenueCategory,
} from '@/types/database';

/**
 * Le FCFA n'a pas de subdivision : on affiche toujours des entiers,
 * séparés par des espaces insecables fines (3 500 FCFA).
 */
export function formatXaf(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Cree un intervalle lisible : "sam. 12 oct. · 19:00 – 22:00". */
export function formatSlot(startsAt: string, durationHours: number): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationHours * 3_600_000);
  const day = start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day} · ${formatTime(start.toISOString())} – ${formatTime(end.toISOString())}`;
}

interface StatusMeta {
  label: string;
  /** Classes Tailwind du badge (fond + texte + bordure). */
  tone: string;
  description: string;
}

export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  pending: {
    label: 'En attente',
    tone: 'bg-status-warning/10 text-status-warning border-status-warning/30',
    description: 'Le companion doit accepter la demande.',
  },
  accepted: {
    label: 'A payer',
    tone: 'bg-gold-dim text-gold border-gold/30',
    description: 'Acceptée. Reglez pour bloquer le créneau.',
  },
  confirmed: {
    label: 'Fonds bloqués',
    tone: 'bg-status-info/10 text-status-info border-status-info/30',
    description: 'Le montant est sous séquestre jusqu à la fin de la mission.',
  },
  in_progress: {
    label: 'En cours',
    tone: 'bg-status-info/10 text-status-info border-status-info/30',
    description: 'La mission’a démarré.',
  },
  completed: {
    label: 'A valider',
    tone: 'bg-gold-dim text-gold border-gold/30',
    description: 'Validez la prestation pour libérer les fonds.',
  },
  released: {
    label: 'Terminée',
    tone: 'bg-status-success/10 text-status-success border-status-success/30',
    description: 'Fonds versés au companion.',
  },
  cancelled: {
    label: 'Annulée',
    tone: 'bg-night-raised text-ink-muted border-night-border',
    description: 'Mission annulée avant paiement.',
  },
  refunded: {
    label: 'Remboursée',
    tone: 'bg-night-raised text-ink-muted border-night-border',
    description: 'Le montant a été rendu au client.',
  },
  disputed: {
    label: 'Litige',
    tone: 'bg-status-danger/10 text-status-danger border-status-danger/30',
    description: 'Fonds gelés, arbitrage en cours.',
  },
};

export const ESCROW_STATUS_LABEL: Record<EscrowStatus, string> = {
  held: 'Sous séquestre',
  released: 'Versé au companion',
  refunded: 'Rembourse au client',
  disputed: 'Gelé (litige)',
};

export const VENUE_CATEGORY_LABEL: Record<VenueCategory, string> = {
  restaurant: 'Restaurant',
  salon: 'Salon',
  événement: 'Événement',
  hotel_lounge: 'Lounge d’hôtel',
  cafe: 'Cafe',
  culture: 'Culture',
};

export const PROVIDER_LABEL: Record<PaymentProvider, string> = {
  airtel_money: 'Airtel Money',
  moov_money: 'Moov Money',
};

/** Numeros gabonais : +241 suivi de 7 a 9 chiffres. */
export function normalizeGabonPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, '');
  const local = digits.replace(/^(\+?241)?0?/, '');
  if (!/^\d{7,9}$/.test(local)) return null;
  return `+241${local}`;
}

/**
 * Pre-selection de l'opérateur d'après le préfixe : Airtel sur 04, 05 et 07,
 * Moov sur 01, 02, 03 et 06. Ce n'est qu'une suggestion d'interface —
 * l'utilisateur reste libre de choisir l'autre opérateur.
 */
export function guessProvider(msisdn: string): PaymentProvider {
  const local = msisdn.replace('+241', '').replace(/^0/, '');
  return /^[457]/.test(local) ? 'airtel_money' : 'moov_money';
}
