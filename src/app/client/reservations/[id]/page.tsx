import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Lock, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { getBooking } from '@/lib/queries';
import {
  BOOKING_STATUS_META,
  ESCROW_STATUS_LABEL,
  formatSlot,
  formatXaf,
  VENUE_CATEGORY_LABEL,
} from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { EscrowTimeline } from '@/components/EscrowTimeline';
import { ClientBookingActions } from './ClientBookingActions';

export const dynamic = 'force-dynamic';

export default async function ClientBookingDetailPage({ params }: { params: { id: string } }) {
  const user = await requireRole('client');
  const supabase = createClient();

  const booking = await getBooking(supabase, params.id);
  if (!booking || booking.client_id !== user.id) notFound();

  const meta = BOOKING_STATUS_META[booking.status];

  return (
    <>
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <Link
          href="/client/réservations"
          aria-label="Retour"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-night-border"
        >
          <ArrowLeft className="h-5 w-5 text-ink-muted" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-ink">
            {booking.companion?.display_name ?? 'Mission'}
          </h1>
          <p className="text-xs text-ink-faint">{booking.reference}</p>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </header>

      <div className="space-y-5 px-5">
        <p className="text-sm leading-relaxed text-ink-muted">{meta.description}</p>

        <section className="up-card space-y-4 p-4">
          <div>
            <h2 className="up-label">Creneau</h2>
            <p className="text-sm text-ink">
              {formatSlot(booking.starts_at, booking.duration_hours)}
            </p>
          </div>

          {booking.venue && (
            <div>
              <h2 className="up-label">Lieu public</h2>
              <p className="flex items-start gap-2 text-sm text-ink">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <span>
                  {booking.venue.name}
                  <span className="block text-xs text-ink-faint">
                    {VENUE_CATEGORY_LABEL[booking.venue.category]} · {booking.venue.address}
                    {booking.venue.district ? `, ${booking.venue.district}` : ''} ·{' '}
                    {booking.venue.city}
                  </span>
                </span>
              </p>
            </div>
          )}

          {booking.client_note && (
            <div>
              <h2 className="up-label">Votre note</h2>
              <p className="whitespace-pre-line text-sm text-ink-muted">{booking.client_note}</p>
            </div>
          )}
        </section>

        <section className="up-card space-y-2 p-4">
          <h2 className="up-label">Détail du montant</h2>
          <div className="flex justify-between text-sm text-ink-muted">
            <span>
              {formatXaf(booking.hourly_rate_xaf)} × {booking.duration_hours} h
            </span>
            <span className="text-ink">{formatXaf(booking.subtotal_xaf)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-muted">
            <span>Frais de service UP</span>
            <span className="text-ink">{formatXaf(booking.service_fee_xaf)}</span>
          </div>
          <div className="up-rule my-1" />
          <div className="flex justify-between text-base font-semibold">
            <span className="text-ink">Total</span>
            <span className="text-gold">{formatXaf(booking.total_xaf)}</span>
          </div>

          {booking.escrow && (
            <p className="mt-2 flex items-center gap-2 rounded-lg bg-night-raised px-3 py-2 text-xs text-ink-muted">
              <Lock className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
              {ESCROW_STATUS_LABEL[booking.escrow.status]} ·{' '}
              {formatXaf(booking.escrow.amount_xaf)}
            </p>
          )}
        </section>

        <section className="up-card p-4">
          <h2 className="up-label">Suivi</h2>
          <EscrowTimeline status={booking.status} />
        </section>

        {booking.cancel_reason && (
          <section className="up-card p-4">
            <h2 className="up-label">Motif</h2>
            <p className="text-sm text-ink-muted">{booking.cancel_reason}</p>
          </section>
        )}

        <ClientBookingActions
          bookingId={booking.id}
          status={booking.status}
          totalXaf={booking.total_xaf}
          defaultMsisdn={user.profile.phone}
        />
      </div>
    </>
  );
}
