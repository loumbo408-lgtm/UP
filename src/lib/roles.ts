import type { AppRole } from '@/types/database';

/**
 * Espace d'accueil de chaque role.
 *
 * Volontairement isole dans un module sans dependance serveur : les
 * composants client s'en servent pour rediriger après connexion, sans
 * embarquer `next/headers` via `@/lib/auth`.
 */
export const ROLE_HOME: Record<AppRole, string> = {
  client: '/client',
  companion: '/companion',
  admin: '/admin',
};
