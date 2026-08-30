/**
 * Grille tarifaire UP.
 *
 * Ces valeurs doivent rester alignees sur `public.up_service_fee` (migration
 * 0003) : le calcul côté client n'est qu'un affichage, la base recalcule et
 * fait foi. Toute evolution se fait dans les deux endroits à la fois.
 */

export const SERVICE_FEE_RATE = 0.15;
export const SERVICE_FEE_MIN_XAF = 500;

export const MIN_DURATION_HOURS = 1;
export const MAX_DURATION_HOURS = 12;

/** Delai minimal entre la demande et le debut de la mission. */
export const MIN_LEAD_TIME_HOURS = 2;

export interface PriceBreakdown {
  subtotalXaf: number;
  serviceFeeXaf: number;
  totalXaf: number;
  /** Part reversee au companion après libération du séquestre. */
  companionPayoutXaf: number;
}

export function computePrice(hourlyRateXaf: number, durationHours: number): PriceBreakdown {
  const subtotalXaf = hourlyRateXaf * durationHours;
  const serviceFeeXaf = Math.max(SERVICE_FEE_MIN_XAF, Math.round(subtotalXaf * SERVICE_FEE_RATE));

  return {
    subtotalXaf,
    serviceFeeXaf,
    totalXaf: subtotalXaf + serviceFeeXaf,
    companionPayoutXaf: subtotalXaf,
  };
}

/** Borne basse du selecteur de date, au format attendu par datetime-local. */
export function earliestStartLocalValue(now: Date = new Date()): string {
  const earliest = new Date(now.getTime() + MIN_LEAD_TIME_HOURS * 3_600_000);
  earliest.setMinutes(earliest.getMinutes() - earliest.getTimezoneOffset());
  return earliest.toISOString().slice(0, 16);
}
