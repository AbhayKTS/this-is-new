import { supabase } from "../lib/supabaseClient.js";

/**
 * Community Service
 * Handles college-wise communities where students connect and share experiences
 */

// Create a new college community
export const createCommunity = async (payload) => {
  const { name, college_id, description, cover_image_url, created_by } = payload;
  
  const { data, error } = await supabase
    .from("communities")
    .insert({
      name,
      college_id,
      description,
      cover_image_url,
      created_by,
      member_count: 1,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Auto-join creator to community
  await joinCommunity(data.id, created_by);
  
  return data;
};

// Get community by ID
export const getCommunity = async (communityId) => {
  const { data, error } = await supabase
    .from("communities")
    .select("*, colleges(name, location, established_year)")
    .eq("id", communityId)
    .single();
  
  if (error) throw error;
  return data;
};

// List all communities with optional filters
export const listCommunities = async ({ page = 1, pageSize = 20, collegeId = null, search = null }) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let query = supabase
    .from("communities")
    .select("*, colleges(name, location)", { count: "exact" });
  
  if (collegeId) {
    query = query.eq("college_id", collegeId);
  }
  
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  
  const { data, error, count } = await query
    .order("member_count", { ascending: false })
    .range(from, to);
  
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

// Join a community
export const joinCommunity = async (communityId, userId) => {
  const { data, error } = await supabase
    .from("community_members")
    .insert({
      community_id: communityId,
      user_id: userId,
      joined_at: new Date().toISOString(),
      role: "member",
    })
    .select()
    .single();
  
  if (error) {
    // Ignore duplicate join attempts
    if (error.code === "23505") return { alreadyMember: true };
    throw error;
  }
  
  // Increment member count
  await supabase.rpc("increment_community_members", { community_id: communityId });
  
  return data;
};

// Leave a community
export const leaveCommunity = async (communityId, userId) => {
  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);
  
  if (error) throw error;
  
  // Decrement member count
  await supabase.rpc("decrement_community_members", { community_id: communityId });
  
  return { success: true };
};

// Get user's joined communities
export const getUserCommunities = async (userId) => {
  const { data, error } = await supabase
    .from("community_members")
    .select("community_id, joined_at, role, communities(id, name, description, member_count, cover_image_url)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });
  
  if (error) throw error;
  return data;
};

// Get community members
export const getCommunityMembers = async (communityId, { page = 1, pageSize = 50 }) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from("community_members")
    .select("user_id, joined_at, role, users(id, name, email, is_verified_senior, verified_college)", { count: "exact" })
    .eq("community_id", communityId)
    .order("joined_at", { ascending: true })
    .range(from, to);
  
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

// Check if user is member
export const isMember = async (communityId, userId) => {
  const { data, error } = await supabase
    .from("community_members")
    .select("id")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
};
