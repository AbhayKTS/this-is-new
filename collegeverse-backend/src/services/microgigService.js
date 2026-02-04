import { supabase } from "../lib/supabaseClient.js";

export const listMicrogigs = async () => {
  const { data, error } = await supabase
    .from("micro_gigs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const createMicrogig = async (payload) => {
  const { data, error } = await supabase
    .from("micro_gigs")
    .insert({ ...payload, status: "open" })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const applyToMicrogig = async (id, payload) => {
  const { data, error } = await supabase
    .from("micro_gig_applications")
    .insert({ ...payload, micro_gig_id: id, status: "applied" })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateMicrogigStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("micro_gigs")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
