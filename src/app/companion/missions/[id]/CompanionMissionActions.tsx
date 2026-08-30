'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  completeMissionAction,
  openDisputeAction,
  respondToBookingAction,
  startMissionAction,
} from '@/app/companion/actions';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { BookingStatus } from '@/types/database';

export function CompanionMissionActions({
  bookingId,
  status,
  startsAt,
}: {
  bookingId: string;
  status: BookingStatus;
  startsAt: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Le démarrage n'est ouvert qu'à partir de 30 min avant le créneau ;
  // la base applique la même regle, ceci n'est qu'un garde-fou d'interface.
  const canStart = Date.now() >= new Date(startsAt).getTime() - 30 * 60_000;

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
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
    <div className="space-y-3 pb-8">
      {error && <Alert tone="danger">{error}</Alert>}

      {status === 'pending' && (
        <>
          <Button
            size="lg"
            fullWidth
            loading={pending}
            onClick={() => runAction(() => respondToBookingAction(bookingId, true))}
          >
            Accepter la mission
          </Button>
          <Button
            variant="ghost"
            fullWidth
            disabled={pending}
            onClick={() =>
              runAction(() =>
                respondToBookingAction(bookingId, false, 'Indisponible sur ce créneau'),
              )
            }
          >
            Refuser
          </Button>
        </>
      )}

      {status === 'accepted' && (
        <Alert tone="info">
          Mission acceptée. Elle sera confirmee dès que le client aura regle :
          les fonds passent alors sous séquestre.
        </Alert>
      )}

      {status === 'confirmed' && (
        <>
          <Alert tone="success">
            Fonds bloqués par UP. Vous pouvez vous rendre au lieu convenu.
          </Alert>
          <Button
            size="lg"
            fullWidth
            loading={pending}
            disabled={!canStart}
            onClick={() => runAction(() => startMissionAction(bookingId))}
          >
            {canStart ? 'Démarrer la mission' : 'Démarrage possible 30 min avant'}
          </Button>
        </>
      )}

      {status === 'in_progress' && (
        <>
          <Button
            size="lg"
            fullWidth
            loading={pending}
            onClick={() => runAction(() => completeMissionAction(bookingId))}
          >
            Terminer la mission
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={pending}
            onClick={() =>
              runAction(() => openDisputeAction(bookingId, 'Incident signale par le companion'))
            }
          >
            Signaler un incident
          </Button>
        </>
      )}

      {status === 'completed' && (
        <Alert tone="info">
          Mission terminée. Le versement part dès que le client valide la
          prestation. Sans réponse de sa part, l’équipe UP arbitre.
        </Alert>
      )}

      {status === 'released' && (
        <Alert tone="success">Fonds libérés. Le reversement est en cours de traitement.</Alert>
      )}

      {status === 'disputed' && (
        <Alert tone="warning">
          Litige en cours. Les fonds sont gelés jusqu à l’arbitrage de l’équipe UP.
        </Alert>
      )}
    </div>
  );
}
