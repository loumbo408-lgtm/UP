"use client";

import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import type { NavItem } from "@/lib/nav";

/**
 * Coquille commune aux espaces Client / Prestataire :
 * zone de contenu scrollable + Bottom Navigation Bar fixe.
 */
export function PersonaShell({
  items,
  children,
}: {
  items: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav items={items} />
    </div>
  );
}
