import { supabase } from "../lib/supabaseClient.js";

export const upsertProfile = async (payload) => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
};
