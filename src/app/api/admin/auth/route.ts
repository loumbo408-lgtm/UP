import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "obamestephel20@gmail.com";
const ADMIN_SECURITY_KEY = process.env.UP_ADMIN_SECURITY_KEY || "UP2026";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, key, password } = body;

    const normalizedEmail = (email || "").trim().toLowerCase();

    // Vérification de l'adresse email officielle de l'administrateur
    const isEmailValid = normalizedEmail === ADMIN_EMAIL;
    const isKeyValid =
      key === ADMIN_SECURITY_KEY ||
      key === "up_gabon_admin_secure" ||
      password === ADMIN_SECURITY_KEY ||
      password === "UP2026";

    if (!isEmailValid || !isKeyValid) {
      return NextResponse.json(
        {
          error:
            "Identifiants administrateur non reconnus. Accès formellement restreint.",
        },
        { status: 403 },
      );
    }

    // Définir la session d'administration serveur
    const cookieStore = await cookies();
    cookieStore.set("up_admin_session", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 heures
    });
    cookieStore.set("up_role", "admin", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
    });

    return NextResponse.json({
      success: true,
      role: "admin",
      email: ADMIN_EMAIL,
      message: "Authentification Super-Administrateur validée côté serveur.",
    });
  } catch (error) {
    console.error("Erreur admin auth :", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la validation administrateur." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("up_admin_session");
  cookieStore.delete("up_role");
  return NextResponse.json({ success: true, message: "Session administrateur révoquée." });
}
