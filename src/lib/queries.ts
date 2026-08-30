import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookingWithRelations } from '@/types/database';

/**
 * Sélection commune des missions avec leurs relations. La RLS filtre déjà
 * les lignes accessibles : ces requetes n'ajoutent aucun contrôle d'accès,
 * seulement un tri et une pagination.
 */
const BOOKING_SELECT = `
  *,
  venue:venues (id, name, category, address, district, city),
  companion:companion_profiles (id, display_name, photos, rating_avg),
  client:profiles!bookings_client_id_fkey (id, full_name, avatar_url),
  escrow:escrow_transactions (id, status, amount_xaf, companion_payout_xaf)
`;

/** Supabase renvoie les relations 1-1 tantot en objet, tantot en tableau. */
function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalize(row: Record<string, unknown>): BookingWithRelations {
  return {
    ...row,
    venue: firstOrNull(row.venue as never),
    companion: firstOrNull(row.companion as never),
    client: firstOrNull(row.client as never),
    escrow: firstOrNull(row.escrow as never),
  } as BookingWithRelations;
}

export async function listBookings(
  supabase: SupabaseClient,
  column: 'client_id' | 'companion_id',
  userId: string,
): Promise<BookingWithRelations[]> {
  const { data } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq(column, userId)
    .order('starts_at', { ascending: false });

  return (data ?? []).map((row) => normalize(row as Record<string, unknown>));
}

export async function getBooking(
  supabase: SupabaseClient,
  bookingId: string,
): Promise<BookingWithRelations | null> {
  const { data } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', bookingId)
    .maybeSingle();

  return data ? normalize(data as Record<string, unknown>) : null;
}
