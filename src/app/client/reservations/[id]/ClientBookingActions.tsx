'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Smartphone } from 'lucide-react';
import {
  cancelBookingAction,
  openDisputeAction,
  releaseEscrowAction,
} from '@/app/client/actions';
import { formatXaf, guessProvider, normalizeGabonPhone, PROVIDER_LABEL } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { BookingStatus, PaymentProvider } from '@/types/database';

const PROVIDERS: PaymentProvider[] = ['airtel_money', 'moov_money'];

export function ClientBookingActions({
  bookingId,
  status,
  totalXaf,
  defaultMsisdn,
}: {
  bookingId: string;
  status: BookingStatus;
  totalXaf: number;
  defaultMsisdn: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [msisdn, setMsisdn] = useState(defaultMsisdn ?? '');
  const [provider, setProvider] = useState<PaymentProvider>(
    defaultMsisdn ? guessProvider(defaultMsisdn) : 'airtel_money',
  );
  const [paying, setPaying] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handlePay() {
    setError(null);
    setNotice(null);

    const normalized = normalizeGabonPhone(msisdn);
    if (!normalized) {
      setError('Numéro gabonais invalide. Exemple : 077 12 34 56.');
      return;
    }

    setPaying(true);
    const response = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, provider, msisdn: normalized }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      sandbox?: boolean;
    };
    setPaying(false);

    if (!response.ok) {
      setError(payload.error ?? 'Le paiement n’a pas pu être lance.');
      return;
    }

    setNotice(
      payload.sandbox
        ? 'Demande enregistrée (mode simulation : aucun opérateur reel n’est appele).'
        : 'Demande envoyée. Validez le paiement sur votre téléphone, puis actualisez.',
    );
    refresh();
  }

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? 'Action impossible.');
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 pb-8">
      {error && <Alert tone="danger">{error}</Alert>}
      {notice && <Alert tone="info">{notice}</Alert>}

      {status === 'accepted' && (
        <section className="up-card space-y-4 p-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Régler la mission</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {formatXaf(totalXaf)} seront bloqués par UP et ne seront versés au
              companion qu’après votre validation de fin de mission.
            </p>
          </div>

          <div>
            <span className="up-label">Opérateur</span>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS.map((value) => {
                const active = provider === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setProvider(value)}
                    aria-pressed={active}
                    className={[
                      'rounded-xl border px-3 py-3 text-sm font-medium transition-colors',
                      active
                        ? 'border-gold bg-gold-dim text-gold'
                        : 'border-night-border bg-night-raised text-ink-muted',
                    ].join(' ')}
                  >
                    {PROVIDER_LABEL[value]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="up-label" htmlFor="msisdn">
              Numéro Mobile Money
            </label>
            <input
              id="msisdn"
              type="tel"
              inputMode="tel"
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value)}
              placeholder="077 12 34 56"
            />
          </div>

          <Button size="lg" fullWidth loading={paying} onClick={handlePay}>
            <Smartphone className="h-4 w-4" aria-hidden />
            Payer {formatXaf(totalXaf)}
          </Button>
        </section>
      )}

      {status === 'confirmed' && (
        <Alert tone="info">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Fonds sous séquestre
          </span>
          <br />
          Le companion vous retrouvera au lieu convenu. Les fonds ne seront
          libérés qu’après la mission.
        </Alert>
      )}

      {status === 'completed' && (
        <section className="up-card space-y-3 p-4">
          <h2 className="text-[15px] font-semibold text-ink">Valider la prestation</h2>
          <p className="text-xs leading-relaxed text-ink-muted">
            En validant, vous autorisez UP a verser {formatXaf(totalXaf)} au
            companion. Cette action’est définitive.
          </p>
          <Button
            size="lg"
            fullWidth
            loading={pending}
            onClick={() => runAction(() => releaseEscrowAction(bookingId))}
          >
            Valider et libérer les fonds
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={pending}
            onClick={() =>
              runAction(() =>
                openDisputeAction(bookingId, 'Prestation contestee par le client'),
              )
            }
          >
            Signaler un probleme
          </Button>
        </section>
      )}

      {(status === 'pending' || status === 'accepted') && (
        <Button
          variant="ghost"
          fullWidth
          disabled={pending}
          onClick={() => runAction(() => cancelBookingAction(bookingId, 'Annulée par le client'))}
        >
          Annuler la demande
        </Button>
      )}

      {status === 'in_progress' && (
        <Button
          variant="danger"
          fullWidth
          disabled={pending}
          onClick={() =>
            runAction(() => openDisputeAction(bookingId, 'Incident signale pendant la mission'))
          }
        >
          Signaler un incident
        </Button>
      )}

      {status === 'disputed' && (
        <Alert tone="warning">
          Litige ouvert. Les fonds sont gelés jusqu à l’arbitrage de l’équipe UP.
        </Alert>
      )}
    </div>
  );
}
