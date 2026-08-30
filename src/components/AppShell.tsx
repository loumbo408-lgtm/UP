import { BottomNav } from '@/components/BottomNav';
import type { AppRole } from '@/types/database';

/**
 * Gabarit commun aux trois espaces : colonne unique calee sur une largeur
 * de téléphone, avec la réserve de place nécessaire à la barre basse.
 */
export function AppShell({ role, children }: { role: AppRole; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-night">
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav role={role} />
    </div>
  );
}
