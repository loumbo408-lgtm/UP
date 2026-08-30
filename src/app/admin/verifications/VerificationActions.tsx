'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reviewCompanionAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function VerificationActions({ companionId }: { companionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function decide(approve: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await reviewCompanionAction(
        companionId,
        approve,
        approve ? 'Dossier conforme' : 'Dossier incomplet',
      );
      if (!result.ok) {
        setError(result.error ?? 'Action impossible.');
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 pt-1">
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" loading={pending} onClick={() => decide(true)}>
          Approuver
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="flex-1"
          disabled={pending}
          onClick={() => decide(false)}
        >
          Refuser
        </Button>
      </div>
    </div>
  );
}
