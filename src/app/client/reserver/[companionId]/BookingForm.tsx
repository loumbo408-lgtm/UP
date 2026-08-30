'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, MapPin } from 'lucide-react';
import { createBookingAction } from '@/app/client/actions';
import { computePrice, earliestStartLocalValue, MAX_DURATION_HOURS, MIN_DURATION_HOURS } from '@/lib/pricing';
import { formatXaf, VENUE_CATEGORY_LABEL } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { Venue } from '@/types/database';

type VenueOption = Pick<Venue, 'id' | 'name' | 'category' | 'address' | 'district' | 'city'>;

export function BookingForm({
  companionId,
  hourlyRateXaf,
  venues,
}: {
  companionId: string;
  hourlyRateXaf: number;
  venues: VenueOption[];
}) {
  const router = useRouter();
  const [venueId, setVenueId] = useState<string>(venues[0]?.id ?? '');
  const [startsAt, setStartsAt] = useState<string>('');
  const [duration, setDuration] = useState(2);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const minStart = useMemo(() => earliestStartLocalValue(), []);
  const price = useMemo(() => computePrice(hourlyRateXaf, duration), [hourlyRateXaf, duration]);

  // Regroupement par ville pour que le choix reste lisible sur mobile.
  const venuesByCity = useMemo(() => {
    const groups = new Map<string, VenueOption[]>();
    for (const venue of venues) {
      const list = groups.get(venue.city) ?? [];
      list.push(venue);
      groups.set(venue.city, list);
    }
    return [...groups.entries()];
  }, [venues]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!venueId) {
      setError('Choisissez un lieu public dans le catalogue.');
      return;
    }
    if (!startsAt) {
      setError('Indiquez la date et l’heure de la mission.');
      return;
    }

    setLoading(true);
    const result = await createBookingAction({
      companionId,
      venueId,
      startsAt: new Date(startsAt).toISOString(),
      durationHours: duration,
      note: note.trim() || undefined,
    });

    if (!result.ok || !result.data) {
      setError(result.error ?? 'La demande n’a pas pu être envoyée.');
      setLoading(false);
      return;
    }

    router.replace(`/client/réservations/${result.data.id}`);
  }

  if (venues.length === 0) {
    return (
      <Alert tone="warning">
        Aucun lieu public n’est encore répertorié. Une mission ne peut pas être
        créée tant que le catalogue est vide.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {error && <Alert tone="danger">{error}</Alert>}

      <div>
        <label className="up-label" htmlFor="venue">
          Lieu de la rencontre
        </label>
        <select id="venue" value={venueId} onChange={(e) => setVenueId(e.target.value)} required>
          {venuesByCity.map(([city, cityVenues]) => (
            <optgroup key={city} label={city}>
              {cityVenues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} — {VENUE_CATEGORY_LABEL[venue.category]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-faint">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          Seuls les établissements publics approuvés par UP sont proposes.
        </p>
      </div>

      <div>
        <label className="up-label" htmlFor="startsAt">
          Date et heure
        </label>
        <input
          id="startsAt"
          type="datetime-local"
          required
          min={minStart}
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
        <p className="mt-2 text-xs text-ink-faint">Au moins 2 heures à l’avance.</p>
      </div>

      <div>
        <label className="up-label" htmlFor="duration">
          Durée : {duration} h
        </label>
        <input
          id="duration"
          type="range"
          min={MIN_DURATION_HOURS}
          max={MAX_DURATION_HOURS}
          step={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full border-0 bg-night-raised p-0 accent-gold"
        />
        <div className="mt-1 flex justify-between text-[11px] text-ink-faint">
          <span>{MIN_DURATION_HOURS} h</span>
          <span>{MAX_DURATION_HOURS} h</span>
        </div>
      </div>

      <div>
        <label className="up-label" htmlFor="note">
          Note pour le companion <span className="normal-case text-ink-faint">(optionnel)</span>
        </label>
        <textarea
          id="note"
          rows={3}
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contexte, code vestimentaire, préférences…"
        />
      </div>

      <section className="up-card space-y-2 p-4">
        <div className="flex justify-between text-sm text-ink-muted">
          <span>
            {formatXaf(hourlyRateXaf)} × {duration} h
          </span>
          <span className="text-ink">{formatXaf(price.subtotalXaf)}</span>
        </div>
        <div className="flex justify-between text-sm text-ink-muted">
          <span>Frais de service UP</span>
          <span className="text-ink">{formatXaf(price.serviceFeeXaf)}</span>
        </div>
        <div className="up-rule my-1" />
        <div className="flex justify-between text-base font-semibold">
          <span className="text-ink">Total</span>
          <span className="text-gold">{formatXaf(price.totalXaf)}</span>
        </div>
        <p className="flex items-start gap-1.5 pt-1 text-xs leading-relaxed text-ink-faint">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          Rien n’est débité maintenant. Le paiement intervient après
          l’acceptation du companion, et reste sous séquestre jusqu à la fin de
          la mission.
        </p>
      </section>

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Envoyer la demande
      </Button>
    </form>
  );
}
