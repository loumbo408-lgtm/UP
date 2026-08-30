import { Compass, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CompanionCard } from '@/components/CompanionCard';
import type { CompanionProfile } from '@/types/database';

export const metadata = { title: 'Découvrir · UP' };
export const dynamic = 'force-dynamic';

export default async function DiscoverPage() {
  const user = await requireRole('client');
  const supabase = createClient();

  // La RLS ne renvoie que les fiches approuvées : pas de filtre a dupliquer ici.
  const { data } = await supabase
    .from('companion_profiles')
    .select(
      'id, display_name, headline, photos, hourly_rate_xaf, rating_avg, rating_count, interests',
    )
    .eq('is_available', true)
    .order('rating_avg', { ascending: false })
    .limit(50);

  const companions = (data ?? []) as Pick<
    CompanionProfile,
    'id' | 'display_name' | 'headline' | 'photos' | 'hourly_rate_xaf' | 'rating_avg' | 'rating_count' | 'interests'
  >[];

  const firstName = user.profile.full_name.split(' ')[0] ?? '';

  return (
    <>
      <PageHeader
        title={`Bonsoir, ${firstName}`}
        subtitle="Sélection de companions vérifiés, disponibles à Libreville."
      />

      <div className="px-5">
        <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold-dim px-4 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <p className="text-xs leading-relaxed text-gold-soft">
            Toutes les missions se deroulent dans un lieu public répertorié, et
            votre règlement reste bloqué jusqu à la fin de la prestation.
          </p>
        </div>
      </div>

      <section className="mt-6 space-y-3 px-5">
        {companions.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Aucun companion disponible"
            description="Les profils en cours de vérification apparaîtront ici des qu’ils seront valides par l’équipe UP."
          />
        ) : (
          companions.map((companion) => (
            <CompanionCard key={companion.id} companion={companion} />
          ))
        )}
      </section>
    </>
  );
}
