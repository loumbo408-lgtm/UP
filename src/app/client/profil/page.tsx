import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SignOutButton } from '@/components/SignOutButton';

export const metadata = { title: 'Profil · UP' };
export const dynamic = 'force-dynamic';

export default async function ClientProfilePage() {
  const user = await requireRole('client');
  const { profile } = user;

  return (
    <>
      <PageHeader title="Mon profil" />

      <div className="space-y-5 px-5">
        <section className="up-card flex items-center gap-4 p-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim text-xl font-semibold text-gold">
            {profile.full_name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-ink">{profile.full_name}</p>
            <p className="text-xs text-ink-faint">Membre depuis {formatDate(profile.created_at)}</p>
          </div>
        </section>

        <section className="up-card divide-y divide-night-border">
          <div className="flex items-center gap-3 p-4">
            <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-ink-faint">E-mail</p>
              <p className="truncate text-sm text-ink">{user.email ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-ink-faint">Mobile Money</p>
              <p className="truncate text-sm text-ink">{profile.phone ?? 'Non renseigne'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-gold" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-ink-faint">Rôle</p>
              <p className="text-sm text-ink">Client</p>
            </div>
          </div>
        </section>

        <SignOutButton fullWidth />
      </div>
    </>
  );
}
