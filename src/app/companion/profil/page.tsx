import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { PageHeader } from '@/components/ui/PageHeader';
import { SignOutButton } from '@/components/SignOutButton';
import { Badge } from '@/components/ui/Badge';
import { CompanionProfileForm } from './CompanionProfileForm';
import type { CompanionProfile, VerificationStatus } from '@/types/database';

export const metadata = { title: 'Ma fiche · UP' };
export const dynamic = 'force-dynamic';

const VERIFICATION_META: Record<VerificationStatus, { label: string; tone: string }> = {
  pending: {
    label: 'En vérification',
    tone: 'bg-status-warning/10 text-status-warning border-status-warning/30',
  },
  approved: {
    label: 'Profil vérifié',
    tone: 'bg-status-success/10 text-status-success border-status-success/30',
  },
  rejected: {
    label: 'Refusé',
    tone: 'bg-status-danger/10 text-status-danger border-status-danger/30',
  },
};

export default async function CompanionProfilePage() {
  const user = await requireRole('companion');
  const supabase = createClient();

  const { data: companion } = await supabase
    .from('companion_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<CompanionProfile>();

  if (!companion) notFound();

  const verification = VERIFICATION_META[companion.verification_status];

  return (
    <>
      <PageHeader
        title="Ma fiche"
        subtitle="Ce que les clients voient de vous."
        action={<Badge tone={verification.tone}>{verification.label}</Badge>}
      />

      <div className="space-y-6 px-5">
        <CompanionProfileForm companion={companion} />
        <SignOutButton fullWidth />
      </div>
    </>
  );
}
