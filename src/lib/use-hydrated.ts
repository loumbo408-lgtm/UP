"use client";

import { useEffect, useState } from "react";

/**
 * true une fois que le composant est monté côté client.
 * Évite les décalages d'hydratation quand on affiche un état persisté (Zustand).
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
