import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

const supabaseKey = env.supabaseServiceRole || env.supabaseKey;

export const supabase = createClient(env.supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
