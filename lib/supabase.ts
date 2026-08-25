import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ryeatluyltpxqxqbosrz.supabase.co";
const supabasePublishableKey = "sb_publishable_5BLpupKqIQXc7fazyfK4Lg_pWe_ng_O";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
