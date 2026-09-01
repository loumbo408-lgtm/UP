import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // 1. Vérifier la session de l'utilisateur appelant
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié. Veuillez vous reconnecter." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      avatarUrl,
      bio,
      educationLevel,
      hourlyRate,
      eveningRate,
      servicesOffered,
      languages,
      zonePreference,
      isOnline,
    } = body;

    const admin = createAdminClient();
    const userId = user.id;

    // 2. Vérifier si le profil existe déjà
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, role, kyc_status, full_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    const userEmail = (user.email || "").toLowerCase().trim();
    const isAdmin = userEmail === "obamstephel20@gmail.com";
    const userRole = isAdmin
      ? "admin"
      : existingProfile?.role || user.user_metadata?.role || "companion";

    // 3. Mettre à jour ou insérer le profil dans `profiles`
    const finalAvatarUrl =
      avatarUrl !== undefined && avatarUrl !== null && avatarUrl.trim() !== ""
        ? avatarUrl
        : (existingProfile?.avatar_url || user.user_metadata?.avatar_url || null);

    const { data: updatedProfile, error: profileErr } = await admin
      .from("profiles")
      .upsert({
        id: userId,
        role: userRole,
        full_name: fullName !== undefined ? fullName.trim() : (existingProfile?.full_name || user.user_metadata?.full_name || "Membre UP"),
        phone: phone !== undefined ? phone : null,
        avatar_url: finalAvatarUrl,
        kyc_status: "verified", // Tout profil complété/actif est validé pour apparaître sur Explore
      })
      .select()
      .single();

    if (profileErr) {
      console.error("Profile upsert error:", profileErr);
      return NextResponse.json(
        { error: `Erreur lors de la mise à jour du profil : ${profileErr.message}` },
        { status: 500 },
      );
    }

    // 4. Si prestataire (ou si des détails prestataire sont transmis), mettre à jour `companion_details`
    let updatedDetails = null;
    if (userRole === "companion" || bio !== undefined || hourlyRate !== undefined) {
      const detailsPayload: any = {
        companion_id: userId,
        bio: bio !== undefined ? bio.trim() : "Accompagnateur d'élite certifié UP Gabon.",
        hourly_rate_xaf: hourlyRate !== undefined ? Number(hourlyRate) : 25000,
        evening_rate_xaf: eveningRate !== undefined ? Number(eveningRate) : 75000,
        zone_preference: zonePreference || "Libreville",
        is_online: isOnline !== undefined ? Boolean(isOnline) : true,
      };

      if (educationLevel !== undefined) {
        detailsPayload.education_level = educationLevel;
      }
      if (Array.isArray(servicesOffered)) {
        detailsPayload.services_offered = servicesOffered;
      }
      if (Array.isArray(languages)) {
        detailsPayload.languages = languages;
      }

      const { data: cd, error: cdErr } = await admin
        .from("companion_details")
        .upsert(detailsPayload)
        .select()
        .single();

      if (cdErr) {
        console.error("Companion details upsert error:", cdErr);
        return NextResponse.json(
          { error: `Erreur lors de la mise à jour des détails prestataire : ${cdErr.message}` },
          { status: 500 },
        );
      }
      updatedDetails = cd;
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      details: updatedDetails,
    });
  } catch (err: any) {
    console.error("API /api/user/profile error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur serveur inattendue." },
      { status: 500 },
    );
  }
}
