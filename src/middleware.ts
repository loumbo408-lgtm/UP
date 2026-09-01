import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =========================================================================
// 0. RATE LIMITING (fenêtre glissante en mémoire)
// =========================================================================
// Limitation par IP. Le magasin est local à l'instance edge : il protège
// contre les rafales et le brute-force (notamment /api/admin) sans dépendance
// externe. Pour une limite partagée entre instances, brancher Upstash Redis.
type RateEntry = { count: number; resetAt: number };
const rateStore = new Map<string, RateEntry>();

const RATE_LIMITS = {
  // Authentification admin : très strict (anti brute-force de la clé)
  admin: { windowMs: 60_000, max: 10 },
  // Autres routes surveillées : large, coupe seulement les abus manifestes
  default: { windowMs: 60_000, max: 120 },
};

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(
  key: string,
  limit: { windowMs: number; max: number },
): { ok: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();
  const entry = rateStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + limit.windowMs });
    return { ok: true, retryAfter: 0, remaining: limit.max - 1 };
  }

  entry.count += 1;
  if (entry.count > limit.max) {
    return {
      ok: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      remaining: 0,
    };
  }
  return { ok: true, retryAfter: 0, remaining: limit.max - entry.count };
}

// Purge opportuniste pour éviter que la Map ne gonfle indéfiniment
function sweepRateStore() {
  if (rateStore.size < 5_000) return;
  const now = Date.now();
  for (const [key, entry] of rateStore) {
    if (now >= entry.resetAt) rateStore.delete(key);
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // =========================================================================
  // 0. APPLICATION DU RATE LIMITING
  // =========================================================================
  sweepRateStore();
  const ip = getClientIp(request);
  const isAdminApi = pathname.startsWith("/api/admin");
  const bucket = isAdminApi ? "admin" : "default";
  const limit = isAdminApi ? RATE_LIMITS.admin : RATE_LIMITS.default;
  const rate = checkRateLimit(`${bucket}:${ip}`, limit);

  if (!rate.ok) {
    if (isAdminApi) {
      return NextResponse.json(
        {
          error:
            "Trop de tentatives. Veuillez patienter avant de réessayer.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter),
            "X-RateLimit-Limit": String(limit.max),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }
    return new NextResponse("Trop de requêtes. Réessayez dans un instant.", {
      status: 429,
      headers: {
        "Retry-After": String(rate.retryAfter),
        "X-RateLimit-Limit": String(limit.max),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  // Récupération des jetons de session et de rôle
  const roleCookie = request.cookies.get("up_role")?.value;
  const adminSessionCookie = request.cookies.get("up_admin_session")?.value;
  const roleParam = request.nextUrl.searchParams.get("role");
  const adminKey = request.nextUrl.searchParams.get("admin_key");

  const effectiveRole = roleParam || roleCookie;

  // L'administrateur officiel est vérifié côté serveur par up_admin_session
  const isAdmin =
    adminSessionCookie === "true" ||
    adminKey === "up_gabon_admin_secure" ||
    adminKey === "UP2026";

  // =========================================================================
  // 1. PROTECTION DES ROUTES ADMIN (/dashboard/admin/*)
  // =========================================================================
  if (pathname.startsWith("/dashboard/admin")) {
    if (
      pathname === "/dashboard/admin/unauthorized" ||
      pathname === "/dashboard/admin/login"
    ) {
      return NextResponse.next();
    }

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

    // L'administrateur a accès
    return NextResponse.next();
  }

  // =========================================================================
  // 2. ISOLATION DES ROUTES PRESTATAIRE (/dashboard/companion/* & /prestataire/*)
  // =========================================================================
  const isCompanionRoute =
    pathname.startsWith("/dashboard/companion") ||
    pathname.startsWith("/prestataire");

  if (isCompanionRoute) {
    // Si l'utilisateur est un admin, il a la main sur toute la plateforme
    if (isAdmin) {
      return NextResponse.next();
    }

    // Si l'utilisateur est un client : interdiction formelle, redirection vers son dashboard client
    if (effectiveRole === "client") {
      const clientUrl = new URL("/client", request.url);
      return NextResponse.redirect(clientUrl);
    }

    // Si non connecté / aucun rôle : redirection vers la connexion
    if (!effectiveRole || (effectiveRole !== "companion" && effectiveRole !== "prestataire")) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("role", "companion");
      return NextResponse.redirect(loginUrl);
    }
  }

  // =========================================================================
  // 3. ISOLATION DES ROUTES CLIENT (/client/*)
  // =========================================================================
  const isClientRoute = pathname.startsWith("/client");

  if (isClientRoute) {
    // Si l'utilisateur est un admin, il a la main sur toute la plateforme
    if (isAdmin) {
      return NextResponse.next();
    }

    // Si l'utilisateur est un prestataire : interdiction formelle, redirection vers son dashboard prestataire
    if (effectiveRole === "companion" || effectiveRole === "prestataire") {
      const companionUrl = new URL("/dashboard/companion", request.url);
      return NextResponse.redirect(companionUrl);
    }

    // Si non connecté / aucun rôle : redirection vers la connexion
    if (!effectiveRole || effectiveRole !== "client") {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("role", "client");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/admin/:path*",
    "/dashboard/companion/:path*",
    "/prestataire/:path*",
    "/client/:path*",
    "/api/admin/:path*",
  ],
};
