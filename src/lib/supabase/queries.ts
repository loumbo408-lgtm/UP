import { createClient } from "@/lib/supabase/client";

export interface SupabaseCompanion {
  id: string;
  name: string;
  fullName: string;
  avatar: string;
  zone: string;
  bio: string;
  education: string;
  languages: string[];
  services: string[];
  hourlyRate: number;
  eveningRate: number;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  verified: boolean;
}

export async function fetchVerifiedCompanions(filters?: {
  zone?: string;
  service?: string;
  query?: string;
}): Promise<SupabaseCompanion[]> {
  const supabase = createClient();

  try {
    let query = supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        kyc_status,
        companion_details (
          bio,
          education_level,
          languages,
          services_offered,
          hourly_rate_xaf,
          evening_rate_xaf,
          zone_preference,
          is_online,
          rating_avg,
          rating_count
        )
      `)
      .eq("role", "companion")
      .eq("kyc_status", "verified");

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    const companions: SupabaseCompanion[] = data
      .filter((p: any) => p.companion_details !== null)
      .map((p: any) => {
        const details = Array.isArray(p.companion_details)
          ? p.companion_details[0]
          : p.companion_details;

        return {
          id: p.id,
          name: p.full_name || "Prestataire Certifié",
          fullName: p.full_name || "Prestataire Certifié",
          avatar:
            p.avatar_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
          zone: details?.zone_preference || "Libreville",
          bio: details?.bio || "Prestataire certifié UP Gabon.",
          education: details?.education_level || "",
          languages: details?.languages || ["Français"],
          services: details?.services_offered || ["diner_affaires"],
          hourlyRate: details?.hourly_rate_xaf || 25000,
          eveningRate: details?.evening_rate_xaf || 75000,
          rating: Number(details?.rating_avg) || 0,
          reviewCount: details?.rating_count || 0,
          isOnline: details?.is_online || false,
          verified: p.kyc_status === "verified",
        };
      });

    // Filtering
    return companions.filter((c) => {
      if (filters?.zone && filters.zone !== "Toutes" && c.zone !== filters.zone) {
        return false;
      }
      if (
        filters?.service &&
        filters.service !== "all" &&
        !c.services.includes(filters.service)
      ) {
        return false;
      }
      if (filters?.query?.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchBio = c.bio.toLowerCase().includes(q);
        const matchZone = c.zone.toLowerCase().includes(q);
        if (!matchName && !matchBio && !matchZone) {
          return false;
        }
      }
      return true;
    });
  } catch (err) {
    console.error("fetchVerifiedCompanions error:", err);
    return [];
  }
}

export async function fetchCompanionById(
  id: string,
): Promise<SupabaseCompanion | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        kyc_status,
        companion_details (
          bio,
          education_level,
          languages,
          services_offered,
          hourly_rate_xaf,
          evening_rate_xaf,
          zone_preference,
          is_online,
          rating_avg,
          rating_count
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const details = Array.isArray(data.companion_details)
      ? data.companion_details[0]
      : data.companion_details;

    return {
      id: data.id,
      name: data.full_name || "Prestataire Certifié",
      fullName: data.full_name || "Prestataire Certifié",
      avatar:
        data.avatar_url ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
      zone: details?.zone_preference || "Libreville",
      bio: details?.bio || "Prestataire certifié UP Gabon.",
      education: details?.education_level || "",
      languages: details?.languages || ["Français"],
      services: details?.services_offered || ["diner_affaires"],
      hourlyRate: details?.hourly_rate_xaf || 25000,
      eveningRate: details?.evening_rate_xaf || 75000,
      rating: Number(details?.rating_avg) || 0,
      reviewCount: details?.rating_count || 0,
      isOnline: details?.is_online || false,
      verified: data.kyc_status === "verified",
    };
  } catch (err) {
    console.error("fetchCompanionById error:", err);
    return null;
  }
}
