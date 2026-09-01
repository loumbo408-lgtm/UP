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
      .eq("role", "companion");

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

export interface RealClientReservation {
  id: string;
  companionId: string;
  companionName: string;
  companionAvatar: string;
  companionZone: string;
  date: string;
  time: string;
  durationHours: number;
  venueName: string;
  venueAddress: string;
  serviceCategory: string;
  serviceLabel: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export async function fetchClientReservations(clientId?: string): Promise<RealClientReservation[]> {
  const supabase = createClient();
  try {
    let targetUserId = clientId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }
    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from("missions")
      .select(`
        id,
        scheduled_at,
        duration_hours,
        location_name,
        location_address,
        mission_type,
        escrow_amount_xaf,
        platform_fee_xaf,
        status,
        created_at,
        companion_id,
        profiles!companion_id (
          id,
          full_name,
          avatar_url,
          companion_details (zone_preference)
        )
      `)
      .eq("client_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((m: any) => {
      const comp = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      const details = comp?.companion_details
        ? (Array.isArray(comp.companion_details) ? comp.companion_details[0] : comp.companion_details)
        : null;

      const dateObj = new Date(m.scheduled_at);
      const dateStr = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      const timeStr = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      return {
        id: m.id,
        companionId: m.companion_id,
        companionName: comp?.full_name || "Prestataire UP",
        companionAvatar: comp?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
        companionZone: details?.zone_preference || "Libreville",
        date: dateStr,
        time: timeStr,
        durationHours: Number(m.duration_hours) || 2,
        venueName: m.location_name || "Établissement Agréé",
        venueAddress: m.location_address || "Libreville",
        serviceCategory: m.mission_type || "diner_affaires",
        serviceLabel: m.mission_type?.replace(/_/g, " ") || "Dîner d'affaires",
        totalAmount: (m.escrow_amount_xaf || 0) + (m.platform_fee_xaf || 0),
        status: m.status,
        createdAt: m.created_at,
      };
    });
  } catch (err) {
    console.error("fetchClientReservations error:", err);
    return [];
  }
}

export interface RealCompanionMission {
  id: string;
  clientName: string;
  clientVerified: boolean;
  service: string;
  date: string;
  time: string;
  venueName: string;
  venueZone: string;
  durationHours: number;
  netEarnings: number;
  status: string;
}

export async function fetchCompanionMissions(companionId?: string): Promise<RealCompanionMission[]> {
  const supabase = createClient();
  try {
    let targetUserId = companionId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }
    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from("missions")
      .select(`
        id,
        scheduled_at,
        duration_hours,
        location_name,
        location_address,
        mission_type,
        escrow_amount_xaf,
        status,
        profiles!client_id (
          full_name,
          kyc_status
        )
      `)
      .eq("companion_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((m: any) => {
      const client = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      const dateObj = new Date(m.scheduled_at);
      return {
        id: m.id,
        clientName: client?.full_name || "Client UP",
        clientVerified: client?.kyc_status === "verified",
        service: m.mission_type?.replace(/_/g, " ") || "Prestation UP",
        date: dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
        time: dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        venueName: m.location_name || "Lieu Public Agréé",
        venueZone: m.location_address || "Libreville",
        durationHours: Number(m.duration_hours) || 2,
        netEarnings: m.escrow_amount_xaf || 0,
        status: m.status,
      };
    });
  } catch (err) {
    console.error("fetchCompanionMissions error:", err);
    return [];
  }
}

export async function fetchCompanionFinancials(companionId?: string): Promise<{
  balance: number;
  completedMissionsCount: number;
  gains: { id: string; label: string; date: string; amount: number; settledAt: string }[];
}> {
  const supabase = createClient();
  try {
    let targetUserId = companionId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }
    if (!targetUserId) return { balance: 0, completedMissionsCount: 0, gains: [] };

    // Transactions de séquestre débloquées
    const { data: missions, error } = await supabase
      .from("missions")
      .select(`
        id,
        mission_type,
        escrow_amount_xaf,
        completed_at,
        status,
        escrow_transactions (
          id,
          amount_xaf,
          status,
          settled_at
        )
      `)
      .eq("companion_id", targetUserId)
      .eq("status", "completed");

    if (error || !missions) {
      return { balance: 0, completedMissionsCount: 0, gains: [] };
    }

    let totalBalance = 0;
    const gainsList = missions.map((m: any) => {
      const net = m.escrow_amount_xaf || 0;
      totalBalance += net;
      return {
        id: m.id,
        label: `Mission ${m.mission_type?.replace(/_/g, " ") || "UP"}`,
        date: m.completed_at ? new Date(m.completed_at).toLocaleDateString("fr-FR") : "Récemment",
        amount: net,
        settledAt: m.completed_at || new Date().toISOString(),
      };
    });

    return {
      balance: totalBalance,
      completedMissionsCount: missions.length,
      gains: gainsList,
    };
  } catch (err) {
    console.error("fetchCompanionFinancials error:", err);
    return { balance: 0, completedMissionsCount: 0, gains: [] };
  }
}

export async function fetchAdminMetrics(): Promise<{
  totalEscrowHeldXaf: number;
  totalCommissionsXaf: number;
  activeCompanionsCount: number;
  missionsTodayCount: number;
  pendingKycCount: number;
  disputedEscrowsCount: number;
}> {
  const supabase = createClient();
  try {
    // 1. Total sous séquestre
    const { data: escrows } = await supabase
      .from("escrow_transactions")
      .select("amount_xaf, status")
      .eq("status", "held");

    const totalEscrowHeldXaf = (escrows || []).reduce((acc, curr) => acc + (curr.amount_xaf || 0), 0);

    // 2. Total commissions réelles
    const { data: completedMissions } = await supabase
      .from("missions")
      .select("platform_fee_xaf")
      .eq("status", "completed");

    const totalCommissionsXaf = (completedMissions || []).reduce((acc, curr) => acc + (curr.platform_fee_xaf || 0), 0);

    // 3. Prestataires en ligne
    const { count: activeCompanionsCount } = await supabase
      .from("companion_details")
      .select("companion_id", { count: "exact", head: true })
      .eq("is_online", true);

    // 4. Missions du jour
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count: missionsTodayCount } = await supabase
      .from("missions")
      .select("id", { count: "exact", head: true })
      .gte("scheduled_at", startOfDay.toISOString());

    // 5. KYC en attente
    const { count: pendingKycCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("kyc_status", "pending");

    // 6. Litiges
    const { count: disputedEscrowsCount } = await supabase
      .from("missions")
      .select("id", { count: "exact", head: true })
      .eq("status", "disputed");

    return {
      totalEscrowHeldXaf: totalEscrowHeldXaf || 0,
      totalCommissionsXaf: totalCommissionsXaf || 0,
      activeCompanionsCount: activeCompanionsCount || 0,
      missionsTodayCount: missionsTodayCount || 0,
      pendingKycCount: pendingKycCount || 0,
      disputedEscrowsCount: disputedEscrowsCount || 0,
    };
  } catch (err) {
    console.error("fetchAdminMetrics error:", err);
    return {
      totalEscrowHeldXaf: 0,
      totalCommissionsXaf: 0,
      activeCompanionsCount: 0,
      missionsTodayCount: 0,
      pendingKycCount: 0,
      disputedEscrowsCount: 0,
    };
  }
}

export async function fetchUserProfile(userId?: string): Promise<{
  id: string;
  role: "client" | "companion" | "admin";
  fullName: string;
  avatarUrl: string;
  email?: string;
  kycStatus: "pending" | "verified" | "rejected";
} | null> {
  const supabase = createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = userId || user?.id;
    if (!uid) return null;

    // Contrôle Super-Admin officiel
    const isSuperAdminEmail = user?.email?.toLowerCase() === "obamestephel20@gmail.com";

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, full_name, avatar_url, kyc_status")
      .eq("id", uid)
      .maybeSingle();

    const role = isSuperAdminEmail ? "admin" : (profile?.role || "client");

    return {
      id: uid,
      role: role as any,
      fullName: profile?.full_name || user?.user_metadata?.full_name || "Utilisateur UP",
      avatarUrl: profile?.avatar_url || "",
      email: user?.email,
      kycStatus: profile?.kyc_status || "pending",
    };
  } catch (err) {
    console.error("fetchUserProfile error:", err);
    return null;
  }
}

