import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Languages, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { formatXaf } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import type { CompanionProfile, Review } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function CompanionDetailPage({ params }: { params: { id: string } }) {
  await requireRole('client');
  const supabase = createClient();

  const { data: companion } = await supabase
    .from('companion_profiles')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<CompanionProfile>();

  // La RLS masque les fiches non approuvées : l'absence de résultat vaut 404.
  if (!companion) notFound();

  const { data: reviewRows } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at')
    .eq('target_id', params.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const reviews = (reviewRows ?? []) as Pick<Review, 'id' | 'rating' | 'comment' | 'created_at'>[];
  const cover = companion.photos[0];

  return (
    <>
      <div className="relative h-72 w-full bg-night-raised">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-6xl font-semibold text-gold/20">
            {companion.display_name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />

        <Link
          href="/client"
          aria-label="Retour"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-night/70 backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5 text-ink" aria-hidden />
        </Link>
      </div>

      <div className="-mt-10 space-y-6 px-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {companion.display_name}
            </h1>
            <BadgeCheck className="h-5 w-5 text-gold" aria-label="Profil vérifié" />
          </div>
          {companion.headline && (
            <p className="mt-1 text-sm text-ink-muted">{companion.headline}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
              {companion.rating_count > 0
                ? `${companion.rating_avg.toFixed(1)} · ${companion.rating_count} avis`
                : 'Nouveau profil'}
            </span>
            <span>{companion.missions_completed} missions</span>
          </div>
        </div>

        {companion.bio && (
          <section className="up-card p-4">
            <h2 className="up-label">A propos</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
              {companion.bio}
            </p>
          </section>
        )}

        {companion.interests.length > 0 && (
          <section>
            <h2 className="up-label">Centres d’intérêt</h2>
            <ul className="flex flex-wrap gap-2">
              {companion.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full border border-night-border bg-night-soft px-3 py-1.5 text-xs text-ink-muted"
                >
                  {interest}
                </li>
              ))}
            </ul>
          </section>
        )}

        {companion.languages.length > 0 && (
          <section className="flex items-center gap-2 text-sm text-ink-muted">
            <Languages className="h-4 w-4 text-gold" aria-hidden />
            {companion.languages.join(' · ')}
          </section>
        )}

        {reviews.length > 0 && (
          <section className="space-y-3">
            <h2 className="up-label">Derniers avis</h2>
            {reviews.map((review) => (
              <article key={review.id} className="up-card p-4">
                <div className="flex gap-0.5" aria-label={`${review.rating} sur 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating ? 'fill-gold text-gold' : 'text-night-border'
                      }`}
                      aria-hidden
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{review.comment}</p>
                )}
              </article>
            ))}
          </section>
        )}
      </div>

      {/* Barre d'action fixe, posee juste au-dessus de la navigation basse. */}
      <div className="fixed inset-x-0 bottom-[72px] z-30 mx-auto max-w-md border-t border-night-border bg-night-soft/95 px-5 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gold">
              {formatXaf(companion.hourly_rate_xaf)}
            </p>
            <p className="text-[11px] text-ink-faint">par heure</p>
          </div>
          <Link href={`/client/réserver/${companion.id}`} className="flex-1">
            <Button size="lg" fullWidth disabled={!companion.is_available}>
              {companion.is_available ? 'Réserver' : 'Indisponible'}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
