'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export function SignOutButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace('/');
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} loading={loading} fullWidth={fullWidth}>
      <LogOut className="h-4 w-4" aria-hidden />
      Se déconnecter
    </Button>
  );
}
