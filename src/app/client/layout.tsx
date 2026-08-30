"use client";

import type { ReactNode } from "react";
import { PersonaShell } from "@/components/persona-shell";
import { clientNav } from "@/lib/nav";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <PersonaShell items={clientNav}>{children}</PersonaShell>;
}
