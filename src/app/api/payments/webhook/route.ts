import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/payments/signature';
import { getMobileMoneyWebhookSecret } from '@/lib/env';
import type { Payment, PaymentStatus } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Correspondance entre les états opérateur et nos états internes. */
const STATUS_MAP: Record<string, PaymentStatus> = {
  SUCCESS: 'succeeded',
  SUCCESSFUL: 'succeeded',
  COMPLETED: 'succeeded',
  FAILED: 'failed',
  REJECTED: 'failed',
  EXPIRED: 'failed',
  CANCELLED: 'cancelled',
  PENDING: 'processing',
};

interface CallbackPayload {
  reference?: string;
  external_id?: string;
  idempotency_key?: string;
  status?: string;
  message?: string;
}

/**
 * Callback de la passerelle Mobile Money : unique source de verite du
 * paiement. Un callback authentifie et réussi declenche la mise sous
 * séquestre (capture_escrow), qui est elle-meme idempotente.
 */
export async function POST(request: Request) {
  let secret: string;
  try {
    secret = getMobileMoneyWebhookSecret();
  } catch {
    return NextResponse.json({ error: 'Webhook non configure' }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get('x-up-signature') ?? request.headers.get('x-signature');

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as CallbackPayload;
  const status = STATUS_MAP[(payload.status ?? '').toUpperCase()];

  if (!status) {
    return NextResponse.json({ error: 'Statut inconnu' }, { status: 400 });
  }

  const admin = createAdminClient();

  // L'opérateur peut renvoyer sa reference ou notre identifiant : on accepte
  // les deux, la clé d'idempotence restant la plus fiable.
  const query = admin.from('payments').select('*').limit(1);
  const { data: payments } = payload.idempotency_key
    ? await query.eq('idempotency_key', payload.idempotency_key)
    : payload.reference
      ? await query.eq('provider_reference', payload.reference)
      : { data: null };

  const payment = payments?.[0] as Payment | undefined;

  if (!payment) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  if (payment.status === 'succeeded' && status === 'succeeded') {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  await admin
    .from('payments')
    .update({
      status,
      provider_reference: payload.reference ?? payment.provider_reference,
      failure_reason: status === 'succeeded' ? null : (payload.message ?? null),
      raw_callback: payload as unknown as Record<string, unknown>,
    })
    .eq('id', payment.id);

  if (status !== 'succeeded') {
    return NextResponse.json({ ok: true, escrow: null });
  }

  // Bascule des fonds en séquestre. La fonction vérifié elle-meme que le
  // montant correspond à la mission et refuse un double séquestre.
  const { data: escrow, error } = await admin.rpc('capture_escrow', {
    p_payment_id: payment.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, escrow });
}
