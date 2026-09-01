import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    // 1. Vérifier la session de l'utilisateur
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier votre photo de profil." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return NextResponse.json(
        { error: "URL ou données d'image invalides." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 2. Mettre à jour profiles
    const { error: profileErr } = await admin
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileErr) {
      console.error("Erreur mise à jour avatar profile:", profileErr);
      return NextResponse.json(
        { error: `Échec de la sauvegarde de la photo : ${profileErr.message}` },
        { status: 500 },
      );
    }

    // 3. Mettre à jour auth.users metadata pour la synchronisation globale
    try {
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          avatar_url: avatarUrl,
        },
      });
    } catch (metaErr) {
      console.warn("Mise à jour metadata avatar non bloquante:", metaErr);
    }

    return NextResponse.json({
      success: true,
      message: "Photo de profil enregistrée avec succès.",
      avatarUrl,
    });
  } catch (err: any) {
    console.error("Avatar API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur." },
      { status: 500 },
    );
  }
}
