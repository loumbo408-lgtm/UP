'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';

/** Client Supabase du navigateur : porte là session de l'utilisateur, soumis à la RLS. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
