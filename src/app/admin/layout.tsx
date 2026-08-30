import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin');
  return <AppShell role="admin">{children}</AppShell>;
}
