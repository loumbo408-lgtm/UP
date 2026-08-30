import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { VENUE_CATEGORY_LABEL } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { VenueManager } from './VenueManager';
import type { Venue } from '@/types/database';

export const metadata = { title: 'Lieux · UP' };
export const dynamic = 'force-dynamic';

export default async function AdminVenuesPage() {
  await requireRole('admin');
  const supabase = createClient();

  // Vue admin : inclut les lieux non approuvés, invisibles côté client.
  const { data } = await supabase
    .from('venues')
    .select('id, name, category, address, district, city, is_approved')
    .order('city')
    .order('name');

  const venues = (data ?? []) as Pick<
    Venue,
    'id' | 'name' | 'category' | 'address' | 'district' | 'city' | 'is_approved'
  >[];

  return (
    <>
      <PageHeader
        title="Répertoire des lieux"
        subtitle="Seuls les lieux approuvés peuvent accueillir une mission."
      />

      <div className="px-5">
        <VenueManager venues={venues} categoryLabels={VENUE_CATEGORY_LABEL} />
      </div>
    </>
  );
}
