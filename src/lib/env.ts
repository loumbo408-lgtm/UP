/**
 * Acces centralise aux variables d'environnement.
 *
 * Le build doit passer sans secrets (CI, previews). On expose donc des
 * valeurs de repli inertes et un drapeau `isSupabaseConfigured` : les pages
 * affichent un état "hors ligne" plutot que de planter au rendu.
 */

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'public-anon-key-placeholder';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDER_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PLACEHOLDER_KEY;

export const isSupabaseConfigured =
  supabaseUrl !== PLACEHOLDER_URL && supabaseAnonKey !== PLACEHOLDER_KEY;

/** Cle service role : serveur uniquement, jamais exposee au navigateur. */
export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY manquante : les opérations de paiement nécessitent la clé service role.',
    );
  }
  return key;
}

export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/** Secret partage avec la passerelle Mobile Money pour signer les callbacks. */
export function getMobileMoneyWebhookSecret(): string {
  const secret = process.env.MOBILE_MONEY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('MOBILE_MONEY_WEBHOOK_SECRET manquante : impossible de vérifier les callbacks.');
  }
  return secret;
}
