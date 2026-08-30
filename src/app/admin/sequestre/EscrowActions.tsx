'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminRefundAction, adminReleaseAction, processPayoutAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { BookingStatus, EscrowStatus } from '@/types/database';

export function EscrowActions({
  bookingId,
  bookingStatus,
  escrowStatus,
  payoutId,
}: {
  bookingId: string;
  bookingStatus: BookingStatus;
  escrowStatus: EscrowStatus;
  payoutId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  // Un admin peut libérer sur une mission terminée, et trancher un litige
  // dans les deux sens. release_escrow refait ces contrôles côté base.
  const canRelease =
    escrowStatus !== 'released' &&
    escrowStatus !== 'refunded' &&
    (bookingStatus === 'completed' || bookingStatus === 'disputed');
  const canRefund = escrowStatus === 'held' || escrowStatus === 'disputed';

  return (
    <div className="space-y-2 pt-1">
      {error && <Alert tone="danger">{error}</Alert>}

      {payoutId && (
        <Button
          size="sm"
          fullWidth
          loading={pending}
          onClick={() => runAction(() => processPayoutAction(payoutId))}
        >
          Exécuter le reversement
        </Button>
      )}

      {(canRelease || canRefund) && (
        <div className="flex gap-2">
          {canRelease && (
            <Button
              size="sm"
              className="flex-1"
              disabled={pending}
              onClick={() => runAction(() => adminReleaseAction(bookingId))}
            >
              Libérer
            </Button>
          )}
          {canRefund && (
            <Button
              size="sm"
              variant="danger"
              className="flex-1"
              disabled={pending}
              onClick={() =>
                runAction(() => adminRefundAction(bookingId, 'Arbitrage en faveur du client'))
              }
            >
              Rembourser
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
