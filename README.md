# UP — Conciergerie privée (Gabon)

Application mobile-first de conciergerie privée : un **client** réserve
l'accompagnement d'un **companion** vérifié, dans un **lieu public répertorié**,
et règle en **Mobile Money** (Airtel / Moov) avec **mise sous séquestre**
obligatoire des fonds jusqu'à la fin de la mission.

## Stack

| Couche | Choix |
| --- | --- |
| Framework | Next.js 14 (App Router), TypeScript strict |
| UI | Tailwind CSS, Lucide React |
| Données | Supabase — PostgreSQL, Auth, Storage, RLS |
| Paiement | Passerelle Mobile Money (Airtel Money / Moov Money), FCFA (XAF) |

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase
npm run dev
```

Sans clés Supabase, le build et les pages publiques fonctionnent : l'app
affiche un état « non configuré » au lieu de planter.

### Base de données

Appliquer les migrations dans l'ordre, puis les données de départ :

```bash
supabase db push          # ou psql -f sur chaque fichier
psql "$DATABASE_URL" -f supabase/seed.sql
```

| Fichier | Contenu |
| --- | --- |
| `supabase/migrations/0001_schema.sql` | Types, tables, contraintes, triggers |
| `supabase/migrations/0002_rls.sql` | Row Level Security des trois rôles |
| `supabase/migrations/0003_booking_flow.sql` | Machine à états mission + séquestre |
| `supabase/seed.sql` | Catalogue initial des lieux publics |

Le premier administrateur se crée en base — le rôle `admin` n'est jamais
attribuable à l'inscription :

```sql
update public.profiles set role = 'admin' where id = '<uuid utilisateur>';
```

## Les trois rôles

Les espaces sont **hermétiques** : navigation, pages et policies distinctes.

| Rôle | Espace | Peut |
| --- | --- | --- |
| `client` | `/client` | Parcourir les companions, réserver, payer, **libérer les fonds** |
| `companion` | `/companion` | Accepter/refuser, démarrer et terminer une mission, suivre ses revenus |
| `admin` | `/admin` | Vérifier les fiches, arbitrer les litiges, gérer le répertoire des lieux |

## Le séquestre

Aucun transfert direct entre client et companion. Le parcours nominal :

```
pending → accepted → confirmed → in_progress → completed → released
        (companion) (paiement)  (companion)   (companion)  (client)
```

- `confirmed` n'est atteint **que** par le callback signé de l'opérateur
  (`/api/payments/webhook`), jamais depuis le navigateur.
- Les fonds restent `held` jusqu'à ce que **le client** valide la prestation.
- Un litige (`disputed`) gèle les fonds ; seul un admin tranche, par
  `release_escrow` (companion) ou `refund_escrow` (client).
- La commission UP (15 %, minimum 500 FCFA) est prélevée **sur le client** :
  le companion perçoit l'intégralité de son tarif horaire.

Toutes les transitions vivent dans des fonctions PostgreSQL `security definer`
(migration 0003). Les tables `bookings`, `escrow_transactions`, `payments` et
`payouts` n'ont **aucune policy d'écriture** : il est impossible de faire bouger
de l'argent en écrivant directement dedans, même avec un jeton valide.

## Lieux publics uniquement

Une mission pointe obligatoirement vers un `venue` **approuvé** du répertoire.
La règle est tenue à trois niveaux : contrainte `venues_public_only` en base,
vérification dans `request_booking`, et catalogue filtré par la RLS côté client.
Seul un admin ajoute un établissement.

## Paiement Mobile Money

`/api/payments/initiate` pousse une demande à l'opérateur ; elle ne confirme
rien. Le callback `/api/payments/webhook`, dont la signature HMAC-SHA256 est
vérifiée à temps constant, est la seule source de vérité et déclenche
`capture_escrow`. Les rejeux sont sans effet : la clé d'idempotence est unique
par mission et par montant, et `capture_escrow` retourne le séquestre existant.

Sans identifiants opérateur, l'app tourne en **mode simulation** : le parcours
complet se déroule avec des références factices.

## Tests

Les scénarios de bout en bout s'exécutent sur un PostgreSQL local et couvrent
le cycle de vie complet ainsi que le cloisonnement RLS des trois rôles :

```bash
PGHOST=/tmp PGPORT=5432 ./supabase/tests/run.sh
```

Ils recréent la base `up` à chaque exécution — à ne jamais pointer vers une
base de production.

```bash
npm run typecheck   # TypeScript strict
npm run lint        # ESLint
npm run build       # build de production
```

## Structure

```
src/
  app/
    (public)          page d'accueil, /login, /inscription
    client/           espace client   — découverte, réservation, paiement
    companion/        espace companion — missions, revenus, fiche
    admin/            espace admin    — vérifications, séquestre, lieux
    api/payments/     initiation et callback Mobile Money
  components/         UI partagée (BottomNav, BookingCard, EscrowTimeline…)
  lib/                Supabase, auth, tarification, formatage FCFA
supabase/
  migrations/         schéma, RLS, machine à états
  tests/              scénarios de bout en bout
```
