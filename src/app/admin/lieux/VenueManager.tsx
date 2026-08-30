'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus } from 'lucide-react';
import { createVenueAction, toggleVenueApprovalAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import type { Venue, VenueCategory } from '@/types/database';

type VenueRow = Pick<
  Venue,
  'id' | 'name' | 'category' | 'address' | 'district' | 'city' | 'is_approved'
>;

const CATEGORIES: VenueCategory[] = [
  'restaurant',
  'cafe',
  'salon',
  'hotel_lounge',
  'événement',
  'culture',
];

export function VenueManager({
  venues,
  categoryLabels,
}: {
  venues: VenueRow[];
  categoryLabels: Record<VenueCategory, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<VenueCategory>('restaurant');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('Libreville');

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createVenueAction({
        name: name.trim(),
        category,
        address: address.trim(),
        district: district.trim(),
        city: city.trim(),
      });

      if (!result.ok) {
        setError(result.error ?? 'Création impossible.');
        return;
      }

      setName('');
      setAddress('');
      setDistrict('');
      setShowForm(false);
      router.refresh();
    });
  }

  function toggle(venueId: string, approved: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await toggleVenueApprovalAction(venueId, approved);
      if (!result.ok) {
        setError(result.error ?? 'Mise à jour impossible.');
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}

      {showForm ? (
        <form onSubmit={handleCreate} className="up-card space-y-4 p-4">
          <h2 className="text-[15px] font-semibold text-ink">Nouvel établissement</h2>

          <div>
            <label className="up-label" htmlFor="venue-name">
              Nom
            </label>
            <input
              id="venue-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Le Cristal"
            />
          </div>

          <div>
            <label className="up-label" htmlFor="venue-category">
              Catégorie
            </label>
            <select
              id="venue-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as VenueCategory)}
            >
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {categoryLabels[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="up-label" htmlFor="venue-address">
              Adresse
            </label>
            <input
              id="venue-address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Boulevard du Bord de Mer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="up-label" htmlFor="venue-district">
                Quartier
              </label>
              <input
                id="venue-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Louis"
              />
            </div>
            <div>
              <label className="up-label" htmlFor="venue-city">
                Ville
              </label>
              <input
                id="venue-city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-ink-faint">
            Tout lieu ajoute est necessairement un espace public : la base
            rejette toute autre nature d’établissement.
          </p>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" loading={pending}>
              Ajouter
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowForm(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" fullWidth onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter un lieu
        </Button>
      )}

      <ul className="space-y-3">
        {venues.map((venue) => (
          <li key={venue.id} className="up-card p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-dim">
                <MapPin className="h-4 w-4 text-gold" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[15px] font-medium text-ink">{venue.name}</p>
                  <Badge
                    tone={
                      venue.is_approved
                        ? 'bg-status-success/10 text-status-success border-status-success/30'
                        : 'bg-night-raised text-ink-muted border-night-border'
                    }
                  >
                    {venue.is_approved ? 'Approuvé' : 'Suspendu'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {categoryLabels[venue.category]} · {venue.address}
                  {venue.district ? `, ${venue.district}` : ''} · {venue.city}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 px-0"
                  disabled={pending}
                  onClick={() => toggle(venue.id, !venue.is_approved)}
                >
                  {venue.is_approved ? 'Retirer du catalogue' : 'Remettre au catalogue'}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
