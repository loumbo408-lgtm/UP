import { Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { listBookings } from '@/lib/queries';
import { formatXaf } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { BookingCard } from '@/components/BookingCard';
import type { BookingStatus, CompanionProfile } from '@/types/database';

export const metadata = { title: 'Mes missions · UP' };
export const dynamic = 'force-dynamic';

const ACTIVE: BookingStatus[] = ['pending', 'accepted', 'confirmed', 'in_progress', 'completed', 'disputed'];

export default async function CompanionHomePage() {
  const user = await requireRole('companion');
  const supabase = createClient();

  const [{ data: companionRow }, bookings] = await Promise.all([
    supabase
      .from('companion_profiles')
      .select('verification_status, is_available, missions_completed, rating_avg, rating_count')
      .eq('id', user.id)
      .maybeSingle<
        Pick<
          CompanionProfile,
          'verification_status' | 'is_available' | 'missions_completed' | 'rating_avg' | 'rating_count'
        >
      >(),
    listBookings(supabase, 'companion_id', user.id),
  ]);

  const pending = bookings.filter((b) => b.status === 'pending');
  const active = bookings.filter((b) => b.status !== 'pending' && ACTIVE.includes(b.status));
  const past = bookings.filter((b) => !ACTIVE.includes(b.status));

  // Somme déjà acquise : uniquement les missions dont le séquestre est libéré.
  const earned = bookings
    .filter((b) => b.escrow?.status === 'released')
    .reduce((sum, b) => sum + (b.escrow?.companion_payout_xaf ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Mes missions"
        subtitle={`${companionRow?.missions_completed ?? 0} missions terminées · ${formatXaf(earned)} percus`}
      />

      <div className="space-y-6 px-5">
        {companionRow?.verification_status === 'pending' && (
          <Alert tone="warning">
            Votre fiche est en cours de vérification. Elle n’apparaîtra dans le
            catalogue qu’après validation par l’équipe UP.
          </Alert>
        )}

        {companionRow?.verification_status === 'rejected' && (
          <Alert tone="danger">
            Votre fiche a été refusée. Completez votre profil et contactez le
            support pour un nouvel examen.
          </Alert>
        )}

        {companionRow?.verification_status === 'approved' && !companionRow.is_available && (
          <Alert tone="info">
            Vous etes actuellement masque du catalogue. Réactivez votre
            disponibilité depuis votre fiche.
          </Alert>
        )}

        {bookings.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="Aucune demande"
            description="Les demandes de mission apparaîtront ici. Soignez votre fiche pour être mis en avant."
          />
        )}

        {pending.length > 0 && (
          <section className="space-y-3">
            <h2 className="up-label">Demandes à traiter</h2>
            {pending.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                href={`/companion/missions/${booking.id}`}
                counterparty={booking.client?.full_name ?? 'Client'}
              />
            ))}
          </section>
        )}

        {active.length > 0 && (
          <section className="space-y-3">
            <h2 className="up-label">En cours</h2>
            {active.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                href={`/companion/missions/${booking.id}`}
                counterparty={booking.client?.full_name ?? 'Client'}
              />
            ))}
          </section>
        )}

        {past.length > 0 && (
          <section className="space-y-3">
            <h2 className="up-label">Historique</h2>
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                href={`/companion/missions/${booking.id}`}
                counterparty={booking.client?.full_name ?? 'Client'}
              />
            ))}
          </section>
        )}
      </div>
    </>
  );
}
