import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';

export default async function CompanionLayout({ children }: { children: React.ReactNode }) {
  await requireRole('companion');
  return <AppShell role="companion">{children}</AppShell>;
}
