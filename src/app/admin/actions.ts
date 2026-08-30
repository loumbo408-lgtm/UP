'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/app/client/actions';
import type { VenueCategory } from '@/types/database';

/** Validation ou refus d'une fiche companion. */
export async function reviewCompanionAction(
  companionId: string,
  approve: boolean,
  notes?: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('review_companion', {
    p_companion_id: companionId,
    p_approve: approve,
    p_notes: notes ?? null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/vérifications');
  revalidatePath('/admin');
  return { ok: true };
}

/** Arbitrage d'un litige en faveur du companion : libération des fonds. */
export async function adminReleaseAction(bookingId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('release_escrow', { p_booking_id: bookingId });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/séquestre');
  return { ok: true };
}

/** Arbitrage en faveur du client : remboursement integral. */
export async function adminRefundAction(
  bookingId: string,
  notes: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc('refund_escrow', {
    p_booking_id: bookingId,
    p_notes: notes,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/séquestre');
  return { ok: true };
}

/**
 * Ajout d'un lieu au répertoire. `is_public` reste force a true : la
 * contrainte venues_public_only rejetterait toute autre valeur.
 */
export async function createVenueAction(input: {
  name: string;
  category: VenueCategory;
  address: string;
  district: string;
  city: string;
}): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('venues').insert({
    name: input.name,
    category: input.category,
    address: input.address,
    district: input.district || null,
    city: input.city,
    is_public: true,
    is_approved: true,
    created_by: user?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/lieux');
  return { ok: true };
}

export async function toggleVenueApprovalAction(
  venueId: string,
  approved: boolean,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('venues')
    .update({ is_approved: approved })
    .eq('id', venueId);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/lieux');
  return { ok: true };
}

/** Execute un reversement en attente vià la passerelle Mobile Money. */
export async function processPayoutAction(payoutId: string): Promise<ActionResult> {
  const { headers } = await import('next/headers');
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  const response = await fetch(`${protocol}://${host}/api/payouts/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: headers().get('cookie') ?? '',
    },
    body: JSON.stringify({ payoutId }),
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) return { ok: false, error: payload.error ?? 'Reversement échoué.' };

  revalidatePath('/admin/séquestre');
  return { ok: true };
}
