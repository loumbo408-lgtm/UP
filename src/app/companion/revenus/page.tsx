import { Lock, TrendingUp, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { formatDate, formatXaf } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Payout, PayoutStatus } from '@/types/database';

export const metadata = { title: 'Revenus · UP' };
export const dynamic = 'force-dynamic';

const PAYOUT_LABEL: Record<PayoutStatus, string> = {
  pending: 'En attente',
  processing: 'En cours',
  paid: 'Versé',
  failed: 'Echec',
};

export default async function CompanionEarningsPage() {
  const user = await requireRole('companion');
  const supabase = createClient();

  // Les fonds encore sous séquestre sont lisibles via les missions du companion
  // (policy escrow: parties de la mission), et ne sont pas encore acquis.
  const [{ data: payoutRows }, { data: bookingRows }] = await Promise.all([
    supabase
      .from('payouts')
      .select('id, amount_xaf, status, provider, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('id, escrow:escrow_transactions (status, companion_payout_xaf)')
      .eq('companion_id', user.id),
  ]);

  const payouts = (payoutRows ?? []) as Pick<
    Payout,
    'id' | 'amount_xaf' | 'status' | 'provider' | 'created_at'
  >[];

  const escrows = (bookingRows ?? []).flatMap((row) => {
    const escrow = (row as { escrow: unknown }).escrow;
    const list = Array.isArray(escrow) ? escrow : escrow ? [escrow] : [];
    return list as { status: string; companion_payout_xaf: number }[];
  });

  const heldXaf = escrows
    .filter((e) => e.status === 'held')
    .reduce((sum, e) => sum + e.companion_payout_xaf, 0);

  const paidXaf = payouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount_xaf, 0);

  return (
    <>
      <PageHeader title="Revenus" subtitle="Séquestre en cours et reversements Mobile Money." />

      <div className="space-y-5 px-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="up-card p-4">
            <Lock className="h-4 w-4 text-gold" aria-hidden />
            <p className="mt-2 text-lg font-semibold text-ink">{formatXaf(heldXaf)}</p>
            <p className="text-[11px] leading-snug text-ink-faint">Sous séquestre</p>
          </div>
          <div className="up-card p-4">
            <TrendingUp className="h-4 w-4 text-status-success" aria-hidden />
            <p className="mt-2 text-lg font-semibold text-ink">{formatXaf(paidXaf)}</p>
            <p className="text-[11px] leading-snug text-ink-faint">Deja versé</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-ink-faint">
          Les montants sous séquestre sont bloqués par UP jusqu à la validation
          de la mission par le client. Ils ne sont pas encore disponibles.
        </p>

        <section className="space-y-3">
          <h2 className="up-label">Reversements</h2>
          {payouts.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Aucun reversement"
              description="Vos versements apparaîtront ici après validation de vos premières missions."
            />
          ) : (
            <ul className="space-y-3">
              {payouts.map((payout) => (
                <li key={payout.id} className="up-card flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{formatXaf(payout.amount_xaf)}</p>
                    <p className="text-xs text-ink-faint">{formatDate(payout.created_at)}</p>
                  </div>
                  <span
                    className={[
                      'text-xs font-medium',
                      payout.status === 'paid'
                        ? 'text-status-success'
                        : payout.status === 'failed'
                          ? 'text-status-danger'
                          : 'text-ink-muted',
                    ].join(' ')}
                  >
                    {PAYOUT_LABEL[payout.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
