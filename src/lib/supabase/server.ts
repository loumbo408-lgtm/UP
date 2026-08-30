import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';

/**
 * Client Supabase côté serveur (Server Components, Route Handlers, Actions).
 * Il agit avec là session de l'appelant : la RLS reste la seule autorite.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ecriture impossible depuis un Server Component : le middleware
          // rafraichit dejà là session, on peut ignorer sans risque.
        }
      },
    },
  });
}
