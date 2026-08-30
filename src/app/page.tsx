import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BadgeCheck, Lock, MapPin, ArrowRight } from 'lucide-react';
import { getSessionUser, ROLE_HOME } from '@/lib/auth';

const PILLARS = [
  {
    icon: BadgeCheck,
    title: 'Profils vérifiés',
    text: "Chaque companion’est valide manuellement par l'equipe UP avant d'apparaitre.",
  },
  {
    icon: MapPin,
    title: 'Lieux publics uniquement',
    text: 'Les rencontres se tiennent dans des établissements répertoriés et approuvés.',
  },
  {
    icon: Lock,
    title: 'Paiement sous séquestre',
    text: 'Votre règlement Mobile Money reste bloqué jusqu à la fin de la mission.',
  },
];

export default async function LandingPage() {
  // Une session active repart directement vers son espace.
  const user = await getSessionUser();
  if (user) redirect(ROLE_HOME[user.profile.role]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-16">
      <div className="animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-dim px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-gold">
          Gabon · Libreville
        </span>

        <h1 className="mt-8 text-5xl font-semibold leading-[1.05] tracking-tight text-ink">
          UP
          <span className="mt-3 block text-2xl font-normal text-ink-muted">
            La conciergerie privee,
            <br />
            pensee pour la discretion.
          </span>
        </h1>

        <div className="up-rule my-8" />

        <ul className="space-y-5">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-dim">
                <Icon className="h-[18px] w-[18px] text-gold" aria-hidden />
              </span>
              <div>
                <h2 className="text-[15px] font-medium text-ink">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto space-y-3 pt-12">
        <Link
          href="/inscription"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-semibold text-night shadow-gold transition-colors hover:bg-gold-soft"
        >
          Créer un compte
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/login"
          className="flex h-14 w-full items-center justify-center rounded-xl border border-night-border text-[15px] text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
        >
          J ai dejà un compte
        </Link>
        <p className="pt-2 text-center text-xs leading-relaxed text-ink-faint">
          Service réservé aux personnes majeures. UP est une plateforme
          d’accompagnement en lieu public.
        </p>
      </div>
    </div>
  );
}
