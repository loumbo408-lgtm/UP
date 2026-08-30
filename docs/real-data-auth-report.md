# Rapport Données Réelles & Authentification Supabase — UP Gabon

## 1. Intégrité des Données & Zéro Profil Fictif

Conformément aux directives strictes du projet :
- **Aucun profil fictif, faux avis ou fausse donnée** n'est hardcodé comme source de vérité.
- La constante `COMPANIONS` dans `src/lib/data.ts` a été purgée des mocks locaux et sert uniquement de conteneur vide.
- Toutes les requêtes d'exploration et de fiches détaillées interrogent directement la base de données PostgreSQL Supabase via le helper `fetchVerifiedCompanions()` et `fetchCompanionById()`.

---

## 2. Structure des Tables Supabase Actives

Le projet est connecté à l'instance Supabase de production (`https://gtxyoyxdesvjufsilkrt.supabase.co`) avec les 4 tables créées et vérifiées :

1. **`profiles`** :
   - `id` (UUID, clé primaire liée à `auth.users.id`)
   - `role` (`client` | `companion` | `admin`)
   - `full_name` (Nom et prénom réels)
   - `phone` (Numéro de téléphone gabonais / Mobile Money)
   - `avatar_url` (Photo de profil certifiée)
   - `id_card_url` (Document d'identité pour le KYC)
   - `kyc_status` (`pending` | `verified` | `rejected`)
   - `created_at` (Horodatage de création)

2. **`companion_details`** :
   - `companion_id` (UUID lié à `profiles.id`)
   - `bio` (Présentation et parcours professionnel)
   - `education_level` (Diplômes et cursus)
   - `languages` (Langues maîtrisées : Français, Anglais, Espagnol...)
   - `services_offered` (Prestations proposées)
   - `hourly_rate_xaf` (Tarif horaire en FCFA)
   - `evening_rate_xaf` (Forfait soirée en FCFA)
   - `zone_preference` (Quartier d'intervention : Libreville, Akanda, Owendo...)
   - `is_online` (Disponibilité radar en temps réel)
   - `rating_avg` & `rating_count` (Notes et avis réels issus de missions complétées)

3. **`missions`** :
   - `id` (UUID)
   - `client_id` (UUID client)
   - `companion_id` (UUID prestataire)
   - `scheduled_at` (Date et heure de rendez-vous)
   - `duration_hours` (Durée en heures)
   - `location_name` & `location_address` (Lieu public sécurisé obligatoire)
   - `mission_type` (Type de prestation)
   - `escrow_amount_xaf` & `platform_fee_xaf` (Montants sous séquestre)
   - `status` (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `disputed`)

4. **`escrow_transactions`** :
   - `id` (UUID)
   - `mission_id` (UUID mission)
   - `payment_operator` (`airtel_money` | `moov_money`)
   - `transaction_ref` (Référence unique de transaction Mobile Money)
   - `amount_xaf` (Montant consigné)
   - `status` (`held` | `released_to_companion` | `refunded_to_client`)

---

## 3. Flux d'Authentification & Confidentialité

### Parcours de Connexion (`/auth/login`)
- Authentification par e-mail et mot de passe via `supabase.auth.signInWithPassword()`.
- Gestion des erreurs en français (« Adresse e-mail ou mot de passe incorrect »).
- Redirection intelligente selon le rôle de l'utilisateur ou le paramètre `redirect`.

### Parcours d'Inscription (`/auth/signup`)
- Sélecteur de rôle en amont : **Client** ou **Prestataire**.
- Création du compte dans Supabase Auth + enregistrement automatique du profil avec `kyc_status: 'pending'`.
- Si le profil est un prestataire, initialisation de ses `companion_details`.

### Protection des Données Privées
- Les coordonnées téléphoniques, e-mails privés et pièces d'identité ne sont **jamais** exposés sur les fiches publiques.
- Seuls les profils ayant le statut `kyc_status = 'verified'` sont retournés par l'API d'exploration.
- En l'absence de prestataires actuellement vérifiés en base, un **état vide élégant** invite les utilisateurs à postuler ou à revenir prochainement.
