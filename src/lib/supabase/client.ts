import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://gtxyoyxdesvjufsilkrt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "sb_publishable_4IzXoV3kL9UEERv0BzFHdA_vQN-oNYb";

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(url, key);
}
