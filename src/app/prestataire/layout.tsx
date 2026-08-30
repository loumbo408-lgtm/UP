"use client";

import type { ReactNode } from "react";
import { PersonaShell } from "@/components/persona-shell";
import { prestataireNav } from "@/lib/nav";

export default function PrestataireLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PersonaShell items={prestataireNav}>{children}</PersonaShell>;
}
