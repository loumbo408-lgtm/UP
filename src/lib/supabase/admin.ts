import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://gtxyoyxdesvjufsilkrt.supabase.co";

export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const secretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Missing Supabase URL or Secret Key (SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY).",
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
