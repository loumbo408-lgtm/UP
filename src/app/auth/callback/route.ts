import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const roleParam = requestUrl.searchParams.get("role");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const userEmail = (data.user.email || "").toLowerCase().trim();
      const isAdmin = userEmail === "obamstephel20@gmail.com";

      // Récupération du rôle réel en base
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      const role = isAdmin
        ? "admin"
        : profile?.role || roleParam || "client";

      let destination = "/client";
      if (role === "admin") {
        destination = "/dashboard/admin";
      } else if (role === "companion" || role === "prestataire") {
        destination = "/dashboard/companion";
      } else {
        destination = "/client";
      }

      const response = NextResponse.redirect(new URL(destination, request.url));
      response.cookies.set("up_role", role, {
        path: "/",
        maxAge: 86400,
        sameSite: "lax",
      });

      if (role === "admin") {
        response.cookies.set("up_admin_session", "true", {
          path: "/",
          maxAge: 86400,
          sameSite: "lax",
        });
      }

      return response;
    }
  }

  // Si pas de code ou erreur, redirection vers la mire de connexion avec message de succès ou confirmation
  return NextResponse.redirect(
    new URL("/auth/login?confirmed=true", request.url),
  );
}
