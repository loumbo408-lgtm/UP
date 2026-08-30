import { Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import {
  BOOKING_STATUS_META,
  ESCROW_STATUS_LABEL,
  formatSlot,
  formatXaf,
} from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { EscrowActions } from './EscrowActions';
import type { Booking, EscrowTransaction, Payout } from '@/types/database';

export const metadata = { title: 'Séquestre · UP' };
export const dynamic = 'force-dynamic';

interface EscrowRow extends EscrowTransaction {
  booking: Pick<Booking, 'id' | 'reference' | 'status' | 'starts_at' | 'duration_hours'> | null;
}

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function EscrowAdminPage() {
  await requireRole('admin');
  const supabase = createClient();

  const [escrowResult, payoutResult] = await Promise.all([
    supabase
      .from('escrow_transactions')
      .select('*, booking:bookings (id, reference, status, starts_at, duration_hours)')
      .order('held_at', { ascending: false })
      .limit(100),
    supabase
      .from('payouts')
      .select('id, escrow_id, amount_xaf, status')
      .in('status', ['pending', 'failed']),
  ]);

  const escrows = (escrowResult.data ?? []).map((row) => ({
    ...(row as Record<string, unknown>),
    booking: firstOrNull((row as { booking: unknown }).booking as never),
  })) as EscrowRow[];

  const pendingPayouts = (payoutResult.data ?? []) as Pick<
    Payout,
    'id' | 'escrow_id' | 'amount_xaf' | 'status'
  >[];

  const payoutByEscrow = new Map(pendingPayouts.map((p) => [p.escrow_id, p]));

  // Les litiges d'abord : ce sont les seuls qui attendent une decision humaine.
  const sorted = [...escrows].sort((a, b) => {
    const rank = (status: string) => (status === 'disputed' ? 0 : status === 'held' ? 1 : 2);
    return rank(a.status) - rank(b.status);
  });

  return (
    <>
      <PageHeader title="Séquestre" subtitle="Fonds bloqués, arbitrages et reversements." />

      <div className="space-y-4 px-5">
        {sorted.length === 0 ? (
          <EmptyState
            icon={Lock}
            title="Aucun mouvement"
            description="Les séquestres apparaîtront ici dès le premier paiement confirmé."
          />
        ) : (
          sorted.map((escrow) => {
            const booking = escrow.booking;
            const payout = payoutByEscrow.get(escrow.id);

            return (
              <article key={escrow.id} className="up-card space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">
                      {booking?.reference ?? 'Mission'}
                    </p>
                    {booking && (
                      <p className="text-xs text-ink-faint">
                        {formatSlot(booking.starts_at, booking.duration_hours)}
                      </p>
                    )}
                  </div>
                  {booking && (
                    <Badge tone={BOOKING_STATUS_META[booking.status].tone}>
                      {BOOKING_STATUS_META[booking.status].label}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-ink-muted">
                    <span>Montant bloqué</span>
                    <span className="text-ink">{formatXaf(escrow.amount_xaf)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Part companion</span>
                    <span className="text-ink">{formatXaf(escrow.companion_payout_xaf)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Commission UP</span>
                    <span className="text-ink">{formatXaf(escrow.platform_fee_xaf)}</span>
                  </div>
                </div>

                <p className="text-xs text-ink-faint">{ESCROW_STATUS_LABEL[escrow.status]}</p>

                {booking && (
                  <EscrowActions
                    bookingId={booking.id}
                    bookingStatus={booking.status}
                    escrowStatus={escrow.status}
                    payoutId={payout?.id ?? null}
                  />
                )}
              </article>
            );
          })
        )}
      </div>
    </>
  );
}
