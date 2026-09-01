# UP

Web app **mobile-first** de **conciergerie privée & accompagnement social** pour le Gabon.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (charte configurée dans `src/app/globals.css` via `@theme`)
- Lucide React (icônes)
- Zustand (état global : rôle actif, disponibilité prestataire)

## Charte graphique

| Rôle                  | Token Tailwind / Var | Hex       |
| --------------------- | -------------------- | --------- |
| Violet UP officiel    | `up-500` / Primary   | `#8807A8` |
| Violet hover          | `up-600`             | `#780395` |
| Violet sombre         | `up-700`             | `#58026D` |
| Violet clair          | `up-400`             | `#C616F2` |
| Fond doux / badges    | `up-50`              | `#FAF2FB` |
| Fond général          | `--up-bg-page`       | `#FAF9FB` |
| Cartes                | `--up-card-bg`       | `#FFFFFF` |
| Texte principal       | `--up-text-main`     | `#1D0F24` |
| Texte secondaire      | `--up-text-muted`    | `#6B5D73` |

## Arborescence

- `/` — aiguillage Client / Prestataire (`src/app/page.tsx`)
- `/client/*` — espace client, bottom nav : Découvrir · Réservations · VIP · Profil
- `/prestataire/*` — espace prestataire, bottom nav : Radar · Gains · Dispo · Profil

## Démarrer

```bash
npm install
npm run dev
```
