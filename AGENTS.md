# Règles & Directives du Projet UP Gabon

Ce document définit les directives architecturales, techniques et de design pour le projet **UP** (conciergerie privée et accompagnement social au Gabon). Tous les agents doivent suivre ces règles sans exception.

---

## 1. Stack Technique & Environnement

- **Framework** : Next.js 15 (App Router) avec TypeScript strict.
- **Styling** : Tailwind CSS v4 via `@theme` dans `src/app/globals.css`.
- **Base de données & Auth** : Supabase PostgreSQL (`@supabase/ssr` et `@supabase/supabase-js`).
- **Gestion d'état** : Zustand (`src/lib/store.ts`).
- **Icônes** : Lucide React.
- **Langue** : Français exclusif pour toute l'interface et les messages d'erreur.

---

## 2. Charte Graphique Officielle — Violet Royal

La charte officielle est basée sur le **Violet Royal** (`#8807A8`) :

| Rôle | Token / Variable | Hex | Utilisation |
| :--- | :--- | :--- | :--- |
| **Primaire UP** | `--up-primary` / `bg-up-500` | `#8807A8` | Boutons CTA majeurs, accents prestige |
| **Survol CTA** | `--up-primary-hover` / `bg-up-600` | `#780395` | États hover et focus |
| **Contraste foncé** | `--up-primary-dark` / `text-up-700` | `#58026D` | Textes accentués, badges foncés |
| **Violet lumineux** | `--up-primary-light` / `text-up-400`| `#C616F2` | Éléments interactifs secondaires |
| **Fond doux** | `--up-primary-soft` / `bg-up-50` | `#FAF2FB` | Arrière-plan badges et icônes douces |
| **Bordure accent** | `--up-primary-border` / `border-up-200` | `#E7ACF5` | Bordures de cartes actives / focus |
| **Fond général** | `--up-bg-page` | `#FAF9FB` | Arrière-plan de l'application |
| **Cartes** | `--up-card-bg` | `#FFFFFF` | Fond des cartes et conteneurs |
| **Texte principal**| `--up-text-main` | `#1D0F24` | Titres et corps de texte haute lisibilité |
| **Texte muted** | `--up-text-muted` | `#6B5D73` | Sous-titres, dates, labels secondaires |

> **Important** : Ne pas utiliser l'ancienne palette or/noir (`#D4AF37` / `#0B0B0C`).

---

## 3. Intégrité des Données & Zéro Profil Fictif

1. **Aucun profil mocké / fictif** : Ne jamais ajouter de faux profils, fausses photos ou faux avis en dur dans le code source.
2. **Source de vérité** : Les profils proviennent exclusivement de Supabase (`profiles` et `companion_details`).
3. **Statut KYC** : Seuls les prestataires ayant `kyc_status = 'verified'` doivent être affichés dans les pages d'exploration publiques.
4. **État vide élégant** : Si la base ne contient aucun prestataire vérifié, afficher un écran d'état vide invitant à postuler ou à revenir ultérieurement.

---

## 4. Sécurité & Confidentialité

- **Lieux publics obligatoires** : Toute réservation impose un lieu public convenu (restaurant, café, hall d'hôtel).
- **Protection des coordonnées** : Les téléphones, e-mails et pièces d'identité ne doivent **jamais** être renvoyés par des API publiques ou affichés sur des pages non authentifiées.
- **Séquestre Mobile Money** : Les transactions (Airtel Money / Moov Money) transitent par un statut sous séquestre (`held`), débloqué par code OTP à l'issue de la mission.

---

## 5. Bonnes Pratiques Supabase & PostgreSQL

- Toujours consulter la compétence locale `.agents/skills/supabase` et `.agents/skills/supabase-postgres-best-practices`.
- Utiliser `createClient` depuis `@/lib/supabase/client` côté navigateur et depuis `@/lib/supabase/server` côté Server Components / Actions.
- Toutes les politiques RLS (Row Level Security) doivent être scrupuleusement testées et maintenues.
