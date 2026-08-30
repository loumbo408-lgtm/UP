import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import { BOOKING_STATUS_META, formatSlot, formatXaf } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import type { BookingWithRelations } from '@/types/database';

/**
 * Carte de mission partagee entre l'espace client et l'espace companion.
 * `counterparty` porte le nom a afficher : le companion pour un client,
 * le client pour un companion.
 */
export function BookingCard({
  booking,
  href,
  counterparty,
}: {
  booking: BookingWithRelations;
  href: string;
  counterparty: string;
}) {
  const meta = BOOKING_STATUS_META[booking.status];

  return (
    <Link href={href} className="up-card block p-4 transition-colors hover:border-gold/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-ink">{counterparty}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{booking.reference}</p>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        {formatSlot(booking.starts_at, booking.duration_hours)}
      </p>

      {booking.venue && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          <span className="truncate">
            {booking.venue.name} · {booking.venue.city}
          </span>
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-night-border pt-3">
        <span className="text-sm font-semibold text-gold">{formatXaf(booking.total_xaf)}</span>
        <ChevronRight className="h-4 w-4 text-ink-faint" aria-hidden />
      </div>
    </Link>
  );
}
