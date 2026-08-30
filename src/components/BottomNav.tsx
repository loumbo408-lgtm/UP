'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_BY_ROLE } from '@/lib/navigation';
import type { AppRole } from '@/types/database';

/**
 * Navigation basse mobile-first. Elle repose sur `pb-[env(safe-area-inset-bottom)]`
 * pour ne pas passer sous la barre gestuelle des iPhone.
 */
export function BottomNav({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-night-border bg-night-soft/95 backdrop-blur-lg"
    >
      <ul className="mx-auto flex max-w-md items-stretch pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          // L'accueil de chaque espace ne doit pas rester actif sur ses sous-pages.
          const isRoot = href.split('/').length === 2;
          const active = isRoot ? pathname === href : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 transition-colors',
                  active ? 'text-gold' : 'text-ink-faint hover:text-ink-muted',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-8 w-12 items-center justify-center rounded-lg transition-colors',
                    active ? 'bg-gold-dim' : '',
                  ].join(' ')}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
