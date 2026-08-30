import { ShieldCheck, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { formatDate, formatXaf } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { VerificationActions } from './VerificationActions';
import type { CompanionProfile } from '@/types/database';

export const metadata = { title: 'Vérifications · UP' };
export const dynamic = 'force-dynamic';

export default async function VerificationsPage() {
  await requireRole('admin');
  const supabase = createClient();

  const { data } = await supabase
    .from('companion_profiles')
    .select('*')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true });

  const companions = (data ?? []) as CompanionProfile[];

  return (
    <>
      <PageHeader
        title="Vérifications"
        subtitle="Fiches companion en attente de validation."
      />

      <div className="space-y-4 px-5">
        {companions.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Rien’a vérifier"
            description="Toutes les fiches soumises ont été traitees."
          />
        ) : (
          companions.map((companion) => (
            <article key={companion.id} className="up-card space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-medium text-ink">
                    {companion.display_name}
                  </h2>
                  <p className="text-xs text-ink-faint">
                    Inscrit le {formatDate(companion.created_at)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gold">
                  {formatXaf(companion.hourly_rate_xaf)}
                </span>
              </div>

              {companion.headline && (
                <p className="text-sm text-ink-muted">{companion.headline}</p>
              )}

              {companion.bio && (
                <p className="whitespace-pre-line text-xs leading-relaxed text-ink-faint">
                  {companion.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-ink-faint">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 text-gold" aria-hidden />
                  {companion.languages.join(', ') || 'Langues non renseignees'}
                </span>
              </div>

              <p className="text-xs text-ink-faint">
                Piece d’identité :{' '}
                {companion.id_document_path ? 'fournie' : 'non fournie'}
              </p>

              <VerificationActions companionId={companion.id} />
            </article>
          ))
        )}
      </div>
    </>
  );
}
