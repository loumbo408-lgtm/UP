'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Booking } from '@/types/database';

export interface ActionResult<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

/**
 * Toutes ces actions delegent la regle métier aux fonctions Postgres
 * (migration 0003). Le serveur Next ne fait que transmettre là session :
 * il n'y a pas de logique d'autorisation dupliquee ici.
 */

export async function createBookingAction(input: {
  companionId: string;
  venueId: string;
  startsAt: string;
  durationHours: number;
  note?: string;
}): Promise<ActionResult<Booking>> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('request_booking', {
    p_companion_id: input.companionId,
    p_venue_id: input.venueId,
    p_starts_at: input.startsAt,
    p_duration_hours: input.durationHours,
    p_client_note: input.note ?? null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/client/réservations');
  return { ok: true, data: data as Booking };
}

export async function cancelBookingAction(
  bookingId: string,
  reason: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('cancel_booking', {
    p_booking_id: bookingId,
    p_reason: reason,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/client/réservations');
  revalidatePath(`/client/réservations/${bookingId}`);
  return { ok: true };
}

/** Le client valide la prestation : c'est ce geste qui debloque les fonds. */
export async function releaseEscrowAction(bookingId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('release_escrow', { p_booking_id: bookingId });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/client/réservations');
  revalidatePath(`/client/réservations/${bookingId}`);
  return { ok: true };
}

export async function openDisputeAction(
  bookingId: string,
  reason: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('open_dispute', {
    p_booking_id: bookingId,
    p_reason: reason,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/client/réservations/${bookingId}`);
  return { ok: true };
}
