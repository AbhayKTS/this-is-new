import { supabase } from "../lib/supabaseClient.js";

/**
 * Senior Verification Service
 * Handles college ID verification for seniors to provide trusted guidance
 */

// Submit a verification request with college ID proof
export const submitVerification = async (payload) => {
  const { user_id, college_id, college_name, graduation_year, id_proof_url, student_email } = payload;
  
  const { data, error } = await supabase
    .from("senior_verifications")
    .insert({
      user_id,
      college_id,
      college_name,
      graduation_year,
      id_proof_url,
      student_email,
      status: "pending",
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get verification status for a user
export const getVerificationStatus = async (userId) => {
  const { data, error } = await supabase
    .from("senior_verifications")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Admin: List pending verifications
export const listPendingVerifications = async ({ page = 1, pageSize = 20 }) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from("senior_verifications")
    .select("*, users(name, email)", { count: "exact" })
    .eq("status", "pending")
    .order("submitted_at", { ascending: true })
    .range(from, to);
  
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

// Admin: Approve or reject verification
export const updateVerificationStatus = async (verificationId, status, reviewerNotes = null) => {
  const updateData = {
    status,
    reviewed_at: new Date().toISOString(),
  };
  
  if (reviewerNotes) {
    updateData.reviewer_notes = reviewerNotes;
  }
  
  const { data, error } = await supabase
    .from("senior_verifications")
    .update(updateData)
    .eq("id", verificationId)
    .select()
    .single();
  
  if (error) throw error;
  
  // If approved, update user's verified status and award badge
  if (status === "approved" && data) {
    await supabase
      .from("users")
      .update({ is_verified_senior: true, verified_college: data.college_name })
      .eq("id", data.user_id);
    
    // Award "Verified Senior" badge
    await supabase
      .from("user_badges")
      .upsert({
        user_id: data.user_id,
        badge_type: "verified_senior",
        awarded_at: new Date().toISOString(),
      }, { onConflict: "user_id,badge_type" });
  }
  
  return data;
};

// Get all verified seniors for a college
export const getVerifiedSeniors = async (collegeName) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, verified_college, created_at")
    .eq("is_verified_senior", true)
    .eq("verified_college", collegeName)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
};
