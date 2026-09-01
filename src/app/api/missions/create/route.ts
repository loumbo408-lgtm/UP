import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentification requise pour réserver." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      companionId,
      date,
      time,
      durationHours,
      venueName,
      venueAddress,
      serviceCategory,
      companionFee,
      platformFee,
      notes,
    } = body;

    if (!companionId) {
      return NextResponse.json(
        { error: "Identifiant du prestataire manquant." },
        { status: 400 },
      );
    }

    // Mapping serviceCategory vers enum postgres public.mission_type
    const typeMapping: Record<string, string> = {
      diner_affaires: "dinner_companion",
      evenementiel: "event_hostess",
      visite_guidee: "city_tour",
      accueil_vip: "vip_welcome",
      assistance_affaires: "business_assistant",
      traduction: "translation",
    };

    const missionType = typeMapping[serviceCategory] || "other";

    // Date & heure programmée
    let scheduledAt = new Date();
    if (date && time) {
      scheduledAt = new Date(`${date}T${time}:00`);
    } else if (date) {
      scheduledAt = new Date(date);
    }

    const admin = createAdminClient();

    // S'assurer que le profil client existe bien
    await admin.from("profiles").upsert({
      id: user.id,
      role: user.user_metadata?.role || "client",
      full_name: user.user_metadata?.full_name || "Client UP",
      kyc_status: "verified",
    });

    // Insérer la mission dans la table postgres missions
    const { data: newMission, error: missionError } = await admin
      .from("missions")
      .insert({
        client_id: user.id,
        companion_id: companionId,
        scheduled_at: scheduledAt.toISOString(),
        duration_hours: Number(durationHours) || 2,
        location_name: venueName || "Lieu Public Convenu",
        location_address: venueAddress || "Libreville, Gabon",
        mission_type: missionType,
        escrow_amount_xaf: Number(companionFee) || 50000,
        platform_fee_xaf: Number(platformFee) || 10000,
        status: "requested",
      })
      .select()
      .single();

    if (missionError) {
      console.error("Mission creation error:", missionError);
      return NextResponse.json(
        { error: `Erreur création mission : ${missionError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      mission: newMission,
      missionId: newMission.id,
    });
  } catch (err: any) {
    console.error("API /api/missions/create error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur serveur lors de la réservation." },
      { status: 500 },
    );
  }
}
