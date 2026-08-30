# UP

Web app **mobile-first** de **conciergerie privée & accompagnement social** pour le Gabon.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (charte configurée dans `src/app/globals.css` via `@theme`)
- Lucide React (icônes)
- Zustand (état global : rôle actif, disponibilité prestataire)

## Charte graphique

| Rôle        | Token Tailwind    | Hex       |
| ----------- | ----------------- | --------- |
| Fond profond | `up-black`        | `#0B0B0C` |
| Surface     | `up-surface`      | `#121214` |
| Or prestige | `up-gold`         | `#D4AF37` |
| Or clair    | `up-gold-soft`    | `#F3E5AB` |
| Texte       | `up-white`        | `#FFFFFF` |
| Texte doux  | `up-gray`         | `#A1A1AA` |

## Arborescence

- `/` — aiguillage Client / Prestataire (`src/app/page.tsx`)
- `/client/*` — espace client, bottom nav : Découvrir · Réservations · VIP · Profil
- `/prestataire/*` — espace prestataire, bottom nav : Radar · Gains · Dispo · Profil

## Démarrer

```bash
npm install
npm run dev
```
