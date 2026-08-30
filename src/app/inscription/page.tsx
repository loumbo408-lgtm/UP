import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser, ROLE_HOME } from '@/lib/auth';
import { RegisterForm } from './RegisterForm';

export const metadata = { title: 'Inscription · UP' };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_HOME[user.profile.role]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-16">
      <Link href="/" className="text-2xl font-semibold tracking-tight text-gold">
        UP
      </Link>

      <h1 className="mt-10 text-3xl font-semibold tracking-tight text-ink">Créer un compte</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Choisissez votre rôle. Il détermine votre espace et ne peut pas être modifié ensuite.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-auto pt-10 text-center text-sm text-ink-muted">
        Deja inscrit ?{' '}
        <Link href="/login" className="font-medium text-gold hover:text-gold-soft">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
