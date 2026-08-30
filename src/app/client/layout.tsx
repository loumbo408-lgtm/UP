import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await requireRole('client');
  return <AppShell role="client">{children}</AppShell>;
}
