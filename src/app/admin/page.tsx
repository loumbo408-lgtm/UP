import Link from 'next/link';
import { AlertTriangle, Lock, ShieldCheck, Users, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { formatXaf } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = { title: 'Pilotage · UP' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireRole('admin');
  const supabase = createClient();

  const [pendingCompanions, disputes, escrowRows, bookingsCount] = await Promise.all([
    supabase
      .from('companion_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'disputed'),
    supabase.from('escrow_transactions').select('amount_xaf, platform_fee_xaf, status'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
  ]);

  const escrows = (escrowRows.data ?? []) as {
    amount_xaf: number;
    platform_fee_xaf: number;
    status: string;
  }[];

  const heldXaf = escrows
    .filter((e) => e.status === 'held' || e.status === 'disputed')
    .reduce((sum, e) => sum + e.amount_xaf, 0);

  // Le revenu n'est acquis qu'une fois le séquestre libéré.
  const revenueXaf = escrows
    .filter((e) => e.status === 'released')
    .reduce((sum, e) => sum + e.platform_fee_xaf, 0);

  const tiles = [
    {
      href: '/admin/vérifications',
      icon: ShieldCheck,
      label: 'Fiches a vérifier',
      value: String(pendingCompanions.count ?? 0),
      tone: 'text-status-warning',
    },
    {
      href: '/admin/séquestre',
      icon: AlertTriangle,
      label: 'Litiges ouverts',
      value: String(disputes.count ?? 0),
      tone: 'text-status-danger',
    },
    {
      href: '/admin/séquestre',
      icon: Lock,
      label: 'Fonds bloqués',
      value: formatXaf(heldXaf),
      tone: 'text-gold',
    },
    {
      href: '/admin/séquestre',
      icon: Wallet,
      label: 'Commissions acquises',
      value: formatXaf(revenueXaf),
      tone: 'text-status-success',
    },
  ];

  return (
    <>
      <PageHeader title="Pilotage" subtitle="État de la plateforme et des flux financiers." />

      <div className="space-y-5 px-5">
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ href, icon: Icon, label, value, tone }) => (
            <Link key={label} href={href} className="up-card p-4 transition-colors hover:border-gold/40">
              <Icon className={`h-4 w-4 ${tone}`} aria-hidden />
              <p className="mt-2 truncate text-lg font-semibold text-ink">{value}</p>
              <p className="text-[11px] leading-snug text-ink-faint">{label}</p>
            </Link>
          ))}
        </div>

        <div className="up-card flex items-center gap-3 p-4">
          <Users className="h-4 w-4 shrink-0 text-gold" aria-hidden />
          <div>
            <p className="text-sm font-medium text-ink">{bookingsCount.count ?? 0} missions</p>
            <p className="text-xs text-ink-faint">Total depuis le lancement</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-ink-faint">
          Les fonds bloqués appartiennent aux clients jusqu à la validation de
          leur mission. Ils ne constituent pas un revenu de la plateforme.
        </p>
      </div>
    </>
  );
}
