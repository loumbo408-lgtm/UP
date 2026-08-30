import Link from 'next/link';
import { Star, BadgeCheck } from 'lucide-react';
import { formatXaf } from '@/lib/format';
import type { CompanionProfile } from '@/types/database';

type CardCompanion = Pick<
  CompanionProfile,
  'id' | 'display_name' | 'headline' | 'photos' | 'hourly_rate_xaf' | 'rating_avg' | 'rating_count' | 'interests'
>;

export function CompanionCard({ companion }: { companion: CardCompanion }) {
  const photo = companion.photos[0];

  return (
    <Link
      href={`/client/companions/${companion.id}`}
      className="up-card group flex gap-4 p-3 transition-colors hover:border-gold/40"
    >
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-night-raised">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-gold/40">
            {companion.display_name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[15px] font-medium text-ink">{companion.display_name}</h3>
          <BadgeCheck className="h-4 w-4 shrink-0 text-gold" aria-label="Profil vérifié" />
        </div>

        {companion.headline && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {companion.headline}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
            {companion.rating_count > 0 ? companion.rating_avg.toFixed(1) : 'Nouveau'}
            {companion.rating_count > 0 && ` (${companion.rating_count})`}
          </span>
        </div>

        <p className="mt-2 text-sm font-semibold text-gold">
          {formatXaf(companion.hourly_rate_xaf)}
          <span className="font-normal text-ink-faint"> / heure</span>
        </p>
      </div>
    </Link>
  );
}
