import { supabase } from "../lib/supabaseClient.js";

export const listUsers = async (email) => {
  const query = supabase.from("users").select("*");
  if (email) {
    const { data, error } = await query.eq("email", email).limit(1).maybeSingle();
    if (error) throw error;
    return data ? [data] : [];
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const createUser = async (payload) => {
  const { data, error } = await supabase.from("users").insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const updateUser = async (id, payload) => {
  const { data, error } = await supabase.from("users").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
};
