import { ShieldAlert } from 'lucide-react';
import { SignOutButton } from '@/components/SignOutButton';

export const metadata = { title: 'Compte suspendu · UP' };

export default function SuspendedPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-status-danger/10">
        <ShieldAlert className="h-7 w-7 text-status-danger" aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold text-ink">Compte suspendu</h1>
      <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
        Votre accès a UP est temporairement suspendu. Contactez le support pour
        connaitre le motif et les suites possibles.
      </p>
      <SignOutButton />
    </div>
  );
}
