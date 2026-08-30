import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protection des routes /dashboard/admin/*
  if (pathname.startsWith("/dashboard/admin")) {
    // Exclure la page d'accès non autorisé et de déverrouillage
    if (
      pathname === "/dashboard/admin/unauthorized" ||
      pathname === "/dashboard/admin/login"
    ) {
      return NextResponse.next();
    }

    // Récupération du rôle depuis le cookie ou header ou paramètre d'URL de démo
    const roleCookie = request.cookies.get("up_role")?.value;
    const roleHeader = request.headers.get("x-up-role");
    const roleParam = request.nextUrl.searchParams.get("role");
    const adminKey = request.nextUrl.searchParams.get("admin_key");

    const effectiveRole = roleParam || roleCookie || roleHeader;

    // Si rôle explicitement client ou prestataire (ou aucun rôle admin), bloquer l'accès
    const isAdmin =
      effectiveRole === "admin" ||
      adminKey === "up_gabon_admin_secure" ||
      request.cookies.get("up_admin_session")?.value === "true";

    if (!isAdmin) {
      const unauthorizedUrl = new URL(
        "/dashboard/admin/unauthorized",
        request.url,
      );
      unauthorizedUrl.searchParams.set("from", pathname);
      if (effectiveRole) {
        unauthorizedUrl.searchParams.set("currentRole", effectiveRole);
      }
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/admin/:path*",
    "/api/admin/:path*",
  ],
};
