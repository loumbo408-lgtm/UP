"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrestataireRadarRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/companion");
  }, [router]);

  return null;
}
