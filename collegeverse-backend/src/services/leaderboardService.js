import { supabase } from "../lib/supabaseClient.js";

export const fetchLeaderboard = async ({ page = 1, pageSize = 20 }) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from("leaderboard")
    .select("*", { count: "exact" })
    .order("score", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

export const upsertLeaderboard = async ({ user_id, score }) => {
  const { data, error } = await supabase
    .from("leaderboard")
    .upsert({ user_id, score }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
};
