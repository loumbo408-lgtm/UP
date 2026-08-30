import { Check, Lock } from 'lucide-react';
import type { BookingStatus } from '@/types/database';

/** Etapes nominales d'une mission, dans l'ordre du parcours des fonds. */
const STEPS: { statuses: BookingStatus[]; label: string; hint: string }[] = [
  { statuses: ['pending'], label: 'Demande envoyée', hint: 'En attente du companion' },
  { statuses: ['accepted'], label: 'Acceptée', hint: 'Règlement Mobile Money attendu' },
  { statuses: ['confirmed'], label: 'Fonds sous séquestre', hint: 'Montant bloqué par UP' },
  { statuses: ['in_progress'], label: 'Mission en cours', hint: 'Rencontre démarrée' },
  { statuses: ['completed'], label: 'Mission terminée', hint: 'Validation du client attendue' },
  { statuses: ['released'], label: 'Fonds libérés', hint: 'Verses au companion' },
];

const ORDER: BookingStatus[] = [
  'pending',
  'accepted',
  'confirmed',
  'in_progress',
  'completed',
  'released',
];

export function EscrowTimeline({ status }: { status: BookingStatus }) {
  // Les états hors parcours nominal (annule, rembourse, litige) n'ont pas de
  // position sur la frise : on ne coche alors aucune etape suivante.
  const currentIndex = ORDER.indexOf(status);

  return (
    <ol className="space-y-0">
      {STEPS.map((step, index) => {
        const stepIndex = ORDER.indexOf(step.statuses[0]!);
        const done = currentIndex >= 0 && stepIndex < currentIndex;
        const current = currentIndex === stepIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <li key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                  done
                    ? 'border-gold bg-gold text-night'
                    : current
                      ? 'border-gold bg-gold-dim text-gold'
                      : 'border-night-border bg-night-raised text-ink-faint',
                ].join(' ')}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : current ? (
                  <Lock className="h-3 w-3" aria-hidden />
                ) : (
                  <span className="text-[10px]">{index + 1}</span>
                )}
              </span>
              {!isLast && (
                <span
                  className={`w-px flex-1 ${done ? 'bg-gold/50' : 'bg-night-border'}`}
                  aria-hidden
                />
              )}
            </div>

            <div className={isLast ? 'pb-0' : 'pb-5'}>
              <p
                className={`text-sm font-medium ${
                  done || current ? 'text-ink' : 'text-ink-faint'
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-ink-faint">{step.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
