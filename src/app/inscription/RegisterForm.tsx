'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { normalizeGabonPhone } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

/**
 * Seuls 'client' et 'companion' sont proposes : le role admin ne s'obtient
 * pas par inscription (le trigger handle_new_user le refuse aussi en base).
 */
const ROLES = [
  {
    value: 'client' as const,
    label: 'Client',
    icon: Heart,
    hint: 'Réserver un accompagnement en lieu public.',
  },
  {
    value: 'companion' as const,
    label: 'Companion',
    icon: Sparkles,
    hint: 'Proposer un accompagnement, après vérification.',
  },
];

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<'client' | 'companion'>('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const msisdn = normalizeGabonPhone(phone);
    if (!msisdn) {
      setError('Numéro gabonais invalide. Exemple : 077 12 34 56.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Ces metadonnees alimentent le trigger handle_new_user qui créé
        // le profil (et la fiche companion le cas echeant).
        data: { full_name: fullName.trim(), phone: msisdn, role, city: 'Libreville' },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.replace(role === 'companion' ? '/companion' : '/client');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}

      <fieldset>
        <legend className="up-label">Je suis</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ value, label, icon: Icon, hint }) => {
            const active = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={active}
                className={[
                  'rounded-2xl border p-4 text-left transition-colors',
                  active
                    ? 'border-gold bg-gold-dim'
                    : 'border-night-border bg-night-soft hover:border-night-border/80',
                ].join(' ')}
              >
                <Icon
                  className={`h-5 w-5 ${active ? 'text-gold' : 'text-ink-faint'}`}
                  aria-hidden
                />
                <span
                  className={`mt-2 block text-sm font-medium ${active ? 'text-gold' : 'text-ink'}`}
                >
                  {label}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-ink-faint">{hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="up-label" htmlFor="fullName">
          Nom complet
        </label>
        <input
          id="fullName"
          required
          minLength={2}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nom et prenom"
        />
      </div>

      <div>
        <label className="up-label" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.ga"
        />
      </div>

      <div>
        <label className="up-label" htmlFor="phone">
          Téléphone Mobile Money
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="077 12 34 56"
        />
        <p className="mt-2 text-xs text-ink-faint">
          Ce numéro servira aux règlements Airtel Money ou Moov Money.
        </p>
      </div>

      <div>
        <label className="up-label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8 caractères minimum"
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Créer mon compte
      </Button>

      <p className="text-center text-xs leading-relaxed text-ink-faint">
        En continuant, vous confirmez être majeur et acceptez la charte UP :
        rencontres en lieu public uniquement.
      </p>
    </form>
  );
}
