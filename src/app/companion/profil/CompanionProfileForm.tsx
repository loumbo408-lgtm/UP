'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCompanionProfileAction } from '@/app/companion/actions';
import { formatXaf } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { CompanionProfile } from '@/types/database';

/** Bornes alignees sur la contrainte CHECK de companion_profiles.hourly_rate_xaf. */
const MIN_RATE = 5_000;
const MAX_RATE = 500_000;

export function CompanionProfileForm({ companion }: { companion: CompanionProfile }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState(companion.display_name);
  const [headline, setHeadline] = useState(companion.headline ?? '');
  const [bio, setBio] = useState(companion.bio ?? '');
  const [rate, setRate] = useState(companion.hourly_rate_xaf);
  const [interests, setInterests] = useState(companion.interests.join(', '));
  const [languages, setLanguages] = useState(companion.languages.join(', '));
  const [isAvailable, setIsAvailable] = useState(companion.is_available);

  function splitList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (rate < MIN_RATE || rate > MAX_RATE) {
      setError(`Le tarif doit être compris entre ${formatXaf(MIN_RATE)} et ${formatXaf(MAX_RATE)}.`);
      return;
    }

    startTransition(async () => {
      const result = await updateCompanionProfileAction({
        displayName: displayName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        hourlyRateXaf: rate,
        interests: splitList(interests),
        languages: splitList(languages),
        isAvailable,
      });

      if (!result.ok) {
        setError(result.error ?? 'Enregistrement impossible.');
        return;
      }

      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}
      {saved && <Alert tone="success">Fiche mise à jour.</Alert>}

      <label className="up-card flex items-center justify-between gap-4 p-4">
        <span>
          <span className="block text-sm font-medium text-ink">Disponible</span>
          <span className="mt-0.5 block text-xs leading-snug text-ink-faint">
            Masque votre fiche du catalogue quand c’est désactivé.
          </span>
        </span>
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-6 w-6 shrink-0 rounded-md accent-gold"
        />
      </label>

      <div>
        <label className="up-label" htmlFor="displayName">
          Nom affiche
        </label>
        <input
          id="displayName"
          required
          minLength={2}
          maxLength={40}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <label className="up-label" htmlFor="headline">
          Accroche
        </label>
        <input
          id="headline"
          maxLength={120}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Accompagnement diner d’affaires et evenements"
        />
      </div>

      <div>
        <label className="up-label" htmlFor="bio">
          Présentation
        </label>
        <textarea
          id="bio"
          rows={5}
          maxLength={1200}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Parlez de votre parcours, de votre aisance en société…"
        />
      </div>

      <div>
        <label className="up-label" htmlFor="rate">
          Tarif horaire : {formatXaf(rate)}
        </label>
        <input
          id="rate"
          type="range"
          min={MIN_RATE}
          max={100_000}
          step={2_500}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full border-0 bg-night-raised p-0 accent-gold"
        />
        <p className="mt-1 text-xs text-ink-faint">
          UP prélève ses frais de service aupres du client : vous percevez
          l’intégralité de ce tarif.
        </p>
      </div>

      <div>
        <label className="up-label" htmlFor="interests">
          Centres d’intérêt
        </label>
        <input
          id="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="Gastronomie, art, voyages"
        />
        <p className="mt-1 text-xs text-ink-faint">Separes par des virgules.</p>
      </div>

      <div>
        <label className="up-label" htmlFor="languages">
          Langues
        </label>
        <input
          id="languages"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="Français, anglais, fang"
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={pending}>
        Enregistrer
      </Button>
    </form>
  );
}
