import { MapPin, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { VENUE_CATEGORY_LABEL } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Venue } from '@/types/database';

export const metadata = { title: 'Lieux · UP' };
export const dynamic = 'force-dynamic';

export default async function VenuesPage() {
  await requireRole('client');
  const supabase = createClient();

  const { data } = await supabase
    .from('venues')
    .select('id, name, category, address, district, city, photo_url')
    .order('city')
    .order('name');

  const venues = (data ?? []) as Pick<
    Venue,
    'id' | 'name' | 'category' | 'address' | 'district' | 'city' | 'photo_url'
  >[];

  const byCity = venues.reduce<Record<string, typeof venues>>((acc, venue) => {
    (acc[venue.city] ??= []).push(venue);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Lieux répertoriés"
        subtitle="Les missions UP se deroulent exclusivement dans ces établissements publics."
      />

      <div className="px-5">
        <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold-dim px-4 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <p className="text-xs leading-relaxed text-gold-soft">
            Chaque adresse est vérifiée par l’équipe UP. Aucune rencontre en
            domicile prive n’est possible sur la plateforme.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-8 px-5">
        {venues.length === 0 && (
          <EmptyState
            icon={MapPin}
            title="Catalogue vide"
            description="Aucun lieu n’est encore approuvé. Revenez bientot."
          />
        )}

        {Object.entries(byCity).map(([city, cityVenues]) => (
          <section key={city} className="space-y-3">
            <h2 className="up-label">{city}</h2>
            <ul className="space-y-3">
              {cityVenues.map((venue) => (
                <li key={venue.id} className="up-card flex gap-3 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-dim">
                    <MapPin className="h-4 w-4 text-gold" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">{venue.name}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {VENUE_CATEGORY_LABEL[venue.category]} · {venue.address}
                      {venue.district ? `, ${venue.district}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
