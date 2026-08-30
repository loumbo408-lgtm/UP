import { CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { listBookings } from '@/lib/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookingCard } from '@/components/BookingCard';
import { Button } from '@/components/ui/Button';
import type { BookingStatus } from '@/types/database';

export const metadata = { title: 'Mes missions · UP' };
export const dynamic = 'force-dynamic';

/** Une mission’est "active" tant qu'elle peut encore evoluer. */
const ACTIVE: BookingStatus[] = ['pending', 'accepted', 'confirmed', 'in_progress', 'completed', 'disputed'];

export default async function ClientBookingsPage() {
  const user = await requireRole('client');
  const supabase = createClient();
  const bookings = await listBookings(supabase, 'client_id', user.id);

  const active = bookings.filter((b) => ACTIVE.includes(b.status));
  const past = bookings.filter((b) => !ACTIVE.includes(b.status));

  return (
    <>
      <PageHeader title="Mes missions" subtitle="Suivi de vos réservations et de vos paiements." />

      <div className="space-y-8 px-5">
        {bookings.length === 0 && (
          <EmptyState
            icon={CalendarCheck}
            title="Aucune mission"
            description="Vos réservations apparaîtront ici dès votre première demande."
            action={
              <Link href="/client">
                <Button size="sm">Découvrir les companions</Button>
              </Link>
            }
          />
        )}

        {active.length > 0 && (
          <section className="space-y-3">
            <h2 className="up-label">En cours</h2>
            {active.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                href={`/client/réservations/${booking.id}`}
                counterparty={booking.companion?.display_name ?? 'Companion'}
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
                href={`/client/réservations/${booking.id}`}
                counterparty={booking.companion?.display_name ?? 'Companion'}
              />
            ))}
          </section>
        )}
      </div>
    </>
  );
}
