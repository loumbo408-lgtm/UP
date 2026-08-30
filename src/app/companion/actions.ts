'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/app/client/actions';

/** Reponse à une demande de mission (acceptation ou refus motive). */
export async function respondToBookingAction(
  bookingId: string,
  accept: boolean,
  reason?: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('respond_to_booking', {
    p_booking_id: bookingId,
    p_accept: accept,
    p_reason: reason ?? null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/companion');
  revalidatePath(`/companion/missions/${bookingId}`);
  return { ok: true };
}

/** Démarrage sur place. Refusé tant que les fonds ne sont pas sous séquestre. */
export async function startMissionAction(bookingId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('start_mission', { p_booking_id: bookingId });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/companion/missions/${bookingId}`);
  return { ok: true };
}

export async function completeMissionAction(bookingId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('complete_mission', { p_booking_id: bookingId });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/companion/missions/${bookingId}`);
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

  revalidatePath(`/companion/missions/${bookingId}`);
  return { ok: true };
}

/** Mise à jour de la fiche vitrine par le companion lui-meme. */
export async function updateCompanionProfileAction(input: {
  displayName: string;
  headline: string;
  bio: string;
  hourlyRateXaf: number;
  interests: string[];
  languages: string[];
  isAvailable: boolean;
}): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'Session expiree.' };

  const { error } = await supabase
    .from('companion_profiles')
    .update({
      display_name: input.displayName,
      headline: input.headline || null,
      bio: input.bio || null,
      hourly_rate_xaf: input.hourlyRateXaf,
      interests: input.interests,
      languages: input.languages,
      is_available: input.isAvailable,
    })
    .eq('id', user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/companion/profil');
  return { ok: true };
}
