import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requestCollection, isSandbox } from '@/lib/payments/provider';
import { normalizeGabonPhone } from '@/lib/format';
import type { Booking, Payment, PaymentProvider } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROVIDERS: PaymentProvider[] = ['airtel_money', 'moov_money'];

/**
 * Declenche le paiement Mobile Money d'une mission acceptée.
 *
 * Cette route ne confirme rien : elle pousse la demande vers l'opérateur.
 * La mise sous séquestre n'a lieu qu'à la reception du callback signe
 * (/api/payments/webhook), qui seul fait foi.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    bookingId?: string;
    provider?: PaymentProvider;
    msisdn?: string;
  } | null;

  if (!body?.bookingId || !body.provider || !body.msisdn) {
    return NextResponse.json({ error: 'Requete incomplete' }, { status: 400 });
  }

  if (!PROVIDERS.includes(body.provider)) {
    return NextResponse.json({ error: 'Opérateur non supporte' }, { status: 400 });
  }

  const msisdn = normalizeGabonPhone(body.msisdn);
  if (!msisdn) {
    return NextResponse.json({ error: 'Numéro gabonais invalide' }, { status: 400 });
  }

  // Lecture sous RLS : un client ne peut viser que ses propres missions.
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', body.bookingId)
    .maybeSingle<Booking>();

  if (!booking || booking.client_id !== user.id) {
    return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
  }

  if (booking.status !== 'accepted') {
    return NextResponse.json(
      { error: 'Cette mission n’attend pas de paiement' },
      { status: 409 },
    );
  }

  const admin = createAdminClient();

  // Cle d'idempotence stable pour une mission et un montant : un double clic
  // ou un rejeu réseau retombe sur la même demande de paiement.
  const idempotencyKey = `${booking.id}:${booking.total_xaf}`;

  const { data: existing } = await admin
    .from('payments')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle<Payment>();

  if (existing && ['pending', 'processing', 'succeeded'].includes(existing.status)) {
    return NextResponse.json({
      paymentId: existing.id,
      status: existing.status,
      providerReference: existing.provider_reference,
      sandbox: isSandbox(existing.provider),
    });
  }

  const { data: payment, error: insertError } = await admin
    .from('payments')
    .upsert(
      {
        booking_id: booking.id,
        payer_id: user.id,
        provider: body.provider,
        msisdn,
        amount_xaf: booking.total_xaf,
        status: 'pending',
        idempotency_key: idempotencyKey,
      },
      { onConflict: 'idempotency_key' },
    )
    .select('*')
    .single<Payment>();

  if (insertError || !payment) {
    return NextResponse.json({ error: 'Impossible d’enregistrer le paiement' }, { status: 500 });
  }

  const result = await requestCollection({
    provider: body.provider,
    msisdn,
    amountXaf: booking.total_xaf,
    externalId: booking.reference,
    idempotencyKey,
    description: `Mission UP ${booking.reference}`,
  });

  await admin
    .from('payments')
    .update({
      status: result.accepted ? 'processing' : 'failed',
      provider_reference: result.providerReference,
      failure_reason: result.failureReason ?? null,
    })
    .eq('id', payment.id);

  if (!result.accepted) {
    return NextResponse.json(
      { error: result.failureReason ?? 'Paiement refuse par l’opérateur' },
      { status: 402 },
    );
  }

  return NextResponse.json({
    paymentId: payment.id,
    status: 'processing',
    providerReference: result.providerReference,
    sandbox: isSandbox(body.provider),
  });
}
