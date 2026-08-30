import { createClient } from '@supabase/supabase-js';
import { getServiceRoleKey, supabaseUrl } from '@/lib/env';

/**
 * Client service role : contourne la RLS.
 *
 * Réservé aux traitements serveur qui n'ont pas d'utilisateur appelant —
 * essentiellement les callbacks de la passerelle Mobile Money. Ne jamais
 * l'importer depuis un composant client.
 */
export function createAdminClient() {
  return createClient(supabaseUrl, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
