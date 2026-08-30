# Checklist de Déploiement & Configuration Vercel — UP Gabon

## 1. Variables d'Environnement Requises (Vercel / Production)

Pour que les fonctionnalités Supabase, l'authentification et les requêtes réelles fonctionnent sur Vercel, renseignez les variables suivantes dans votre tableau de bord **Vercel > Project Settings > Environment Variables** :

| Nom de Variable | Exemple de Valeur | Obligatoire |
| :--- | :--- | :---: |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gtxyoyxdesvjufsilkrt.supabase.co` | **OUI** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_4IzXoV3kL9UEERv0BzFHdA_vQN-oNYb` | **OUI** |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_votre_cle_secrete_service_role` | **OUI** |
| `SUPABASE_JWKS_URL` | `https://gtxyoyxdesvjufsilkrt.supabase.co/auth/v1/.well-known/jwks.json` | **OUI** |

---

## 2. Déploiement Continu Automatique (CI/CD)

Le dépôt GitHub `https://github.com/loumbo408-lgtm/UP` est configuré sur la branche `main`.
Chaque `git push origin main` déclenche automatiquement un nouveau build et déploiement sur Vercel.

### Commande de build standard :
```bash
npm run build
```

---

## 3. Checklist de Validation Pré-Production

- [x] **Logo Officiel UP** : Fichiers vectoriels `up-logo.svg` et composant `UpLogo.tsx` configurés.
- [x] **Direction Artistique & Thème** : Tokens CSS `--up-background: #0B0B0D;`, `--up-gold: #D4AF37;`, etc. actifs.
- [x] **Responsive Universel** : Testé de 320px (iPhone SE) à 1920px (Desktop Full HD / 4K).
- [x] **Base de Données Supabase** : 4 tables `profiles`, `companion_details`, `missions`, `escrow_transactions` créées et opérationnelles.
- [x] **Intégrité des Données** : Zéro profil fictif, zéro faux avis dans le code source.
- [x] **Sécurité & Confidentialité** : Lieux publics obligatoires, adresses privées et documents KYC masqués.
- [x] **Flux d'Authentification** : Pages `/auth/login` et `/auth/signup` connectées avec gestion des rôles Client / Prestataire / Admin.
- [x] **Séquestre Mobile Money** : Simulation du flux Airtel Money / Moov Money avec code de fin de mission OTP.
