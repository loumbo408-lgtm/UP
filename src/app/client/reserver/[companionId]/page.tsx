import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { BookingForm } from './BookingForm';
import type { CompanionProfile, Venue } from '@/types/database';

export const metadata = { title: 'Réserver · UP' };
export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }: { params: { companionId: string } }) {
  await requireRole('client');
  const supabase = createClient();

  const [companionResult, venuesResult] = await Promise.all([
    supabase
      .from('companion_profiles')
      .select('id, display_name, hourly_rate_xaf, is_available')
      .eq('id', params.companionId)
      .maybeSingle<Pick<CompanionProfile, 'id' | 'display_name' | 'hourly_rate_xaf' | 'is_available'>>(),
    // Catalogue des lieux : la RLS ne laisse passer que les établissements
    // publics approuvés, ce qui garantit la regle "lieu public uniquement".
    supabase
      .from('venues')
      .select('id, name, category, address, district, city')
      .order('city')
      .order('name'),
  ]);

  const companion = companionResult.data;
  if (!companion) notFound();

  const venues = (venuesResult.data ?? []) as Pick<
    Venue,
    'id' | 'name' | 'category' | 'address' | 'district' | 'city'
  >[];

  return (
    <>
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <Link
          href={`/client/companions/${companion.id}`}
          aria-label="Retour"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-night-border"
        >
          <ArrowLeft className="h-5 w-5 text-ink-muted" aria-hidden />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-ink">
            Réserver {companion.display_name}
          </h1>
          <p className="text-xs text-ink-faint">Lieu public, créneau et durée</p>
        </div>
      </header>

      <div className="px-5">
        <BookingForm
          companionId={companion.id}
          hourlyRateXaf={companion.hourly_rate_xaf}
          venues={venues}
        />
      </div>
    </>
  );
}
