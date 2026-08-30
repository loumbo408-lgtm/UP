import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { ROLE_HOME } from '@/lib/roles';
import type { AppRole, Profile } from '@/types/database';

export { ROLE_HOME };

export interface SessionUser {
  id: string;
  email: string | null;
  profile: Profile;
}

/** Retourne l'utilisateur connecte et son profil, ou null. Ne redirige pas. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return null;

  return { id: user.id, email: user.email ?? null, profile: profile as Profile };
}

/** Exige une session ; renvoie vers la connexion sinon. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Exige un role precis. Un utilisateur connecte au mauvais role est renvoye
 * vers son propre espace, jamais vers une page d'erreur : les trois espaces
 * sont hermétiques mais l'app reste utilisable.
 */
export async function requireRole(role: AppRole): Promise<SessionUser> {
  const user = await requireUser();
  if (user.profile.is_suspended) redirect('/compte-suspendu');
  if (user.profile.role !== role) redirect(ROLE_HOME[user.profile.role]);
  return user;
}
