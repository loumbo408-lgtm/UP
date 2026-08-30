import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requestDisbursement } from '@/lib/payments/provider';
import type { Payout, Profile } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Execute un reversement en attente vers un companion (admin uniquement).
 * Les ordres de reversement sont créés par release_escrow ; cette route ne
 * fait que les pousser a l'opérateur et consigner le résultat.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'role'>>();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { payoutId?: string } | null;
  if (!body?.payoutId) {
    return NextResponse.json({ error: 'Requete incomplete' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: payout } = await admin
    .from('payouts')
    .select('*')
    .eq('id', body.payoutId)
    .maybeSingle<Payout>();

  if (!payout) {
    return NextResponse.json({ error: 'Reversement introuvable' }, { status: 404 });
  }

  if (payout.status !== 'pending' && payout.status !== 'failed') {
    return NextResponse.json({ error: 'Reversement déjà traite' }, { status: 409 });
  }

  await admin.from('payouts').update({ status: 'processing' }).eq('id', payout.id);

  const result = await requestDisbursement({
    provider: payout.provider,
    msisdn: payout.msisdn,
    amountXaf: payout.amount_xaf,
    externalId: payout.id,
    description: 'Reversement mission UP',
  });

  await admin
    .from('payouts')
    .update({
      status: result.accepted ? 'paid' : 'failed',
      provider_reference: result.providerReference,
      failure_reason: result.failureReason ?? null,
    })
    .eq('id', payout.id);

  await admin.from('admin_actions').insert({
    admin_id: user.id,
    action: result.accepted ? 'payout_sent' : 'payout_failed',
    target_type: 'payout',
    target_id: payout.id,
    metadata: { amount_xaf: payout.amount_xaf, provider: payout.provider },
  });

  return NextResponse.json({ ok: result.accepted, error: result.failureReason ?? null });
}
