import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser, ROLE_HOME } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/env';
import { Alert } from '@/components/ui/Alert';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Connexion · UP' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const user = await getSessionUser();
  if (user) redirect(ROLE_HOME[user.profile.role]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-16">
      <Link href="/" className="text-2xl font-semibold tracking-tight text-gold">
        UP
      </Link>

      <h1 className="mt-10 text-3xl font-semibold tracking-tight text-ink">Bon retour</h1>
      <p className="mt-2 text-sm text-ink-muted">Connectez-vous à votre espace prive.</p>

      <div className="mt-8 space-y-4">
        {!isSupabaseConfigured && (
          <Alert tone="warning">
            Supabase n’est pas configure. Renseignez <code>NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans <code>.env.local</code>.
          </Alert>
        )}
        <LoginForm nextPath={searchParams.next} />
      </div>

      <p className="mt-auto pt-10 text-center text-sm text-ink-muted">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-medium text-gold hover:text-gold-soft">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
