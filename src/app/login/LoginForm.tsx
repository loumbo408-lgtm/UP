'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ROLE_HOME } from '@/lib/roles';
import type { AppRole } from '@/types/database';

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data.user) {
      setError(
        signInError?.message === 'Invalid login credentials'
          ? 'Identifiants incorrects.'
          : (signInError?.message ?? 'Connexion impossible.'),
      );
      setLoading(false);
      return;
    }

    // Le role decide de la destination : chaque espace est distinct.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    const role = (profile?.role ?? 'client') as AppRole;
    router.replace(nextPath ?? ROLE_HOME[role]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <div>
        <label className="up-label" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.ga"
        />
      </div>

      <div>
        <label className="up-label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Se connecter
      </Button>
    </form>
  );
}
