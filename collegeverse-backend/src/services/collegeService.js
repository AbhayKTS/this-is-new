import { supabase } from "../lib/supabaseClient.js";

/**
 * College Service
 * Handles college information, ratings, and comparison features
 */

// Get college by ID
export const getCollege = async (collegeId) => {
  const { data, error } = await supabase
    .from("colleges")
    .select("*")
    .eq("id", collegeId)
    .single();
  
  if (error) throw error;
  return data;
};

// List all colleges with optional filters
export const listColleges = async ({
  page = 1,
  pageSize = 20,
  search = null,
  location = null,
  type = null,
  sortBy = "name"
}) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let query = supabase
    .from("colleges")
    .select("*", { count: "exact" });
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
  }
  
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }
  
  if (type) {
    query = query.eq("type", type);
  }
  
  // Sort options
  switch (sortBy) {
    case "rating":
      query = query.order("overall_rating", { ascending: false });
      break;
    case "placements":
      query = query.order("placement_rating", { ascending: false });
      break;
    default:
      query = query.order("name", { ascending: true });
  }
  
  const { data, error, count } = await query.range(from, to);
  
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

// Get college ratings
export const getCollegeRatings = async (collegeId) => {
  const { data, error } = await supabase
    .from("college_ratings")
    .select("*")
    .eq("college_id", collegeId);
  
  if (error) throw error;
  
  // Calculate average ratings
  const ratings = {
    academics: 0,
    placements: 0,
    hostel: 0,
    campus_culture: 0,
    infrastructure: 0,
    value_for_money: 0,
    overall: 0,
    total_reviews: data.length,
  };
  
  if (data.length > 0) {
    const categories = ["academics", "placements", "hostel", "campus_culture", "infrastructure", "value_for_money"];
    
    for (const cat of categories) {
      const sum = data.reduce((acc, r) => acc + (r[cat] || 0), 0);
      ratings[cat] = Math.round((sum / data.length) * 10) / 10;
    }
    
    ratings.overall = Math.round(
      ((ratings.academics + ratings.placements + ratings.hostel + 
        ratings.campus_culture + ratings.infrastructure + ratings.value_for_money) / 6) * 10
    ) / 10;
  }
  
  return ratings;
};

// Submit a college rating (verified seniors only)
export const submitCollegeRating = async (payload) => {
  const { user_id, college_id, academics, placements, hostel, campus_culture, infrastructure, value_for_money, review_text } = payload;
  
  // Check if user is verified senior
  const { data: user } = await supabase
    .from("users")
    .select("is_verified_senior, verified_college")
    .eq("id", user_id)
    .single();
  
  if (!user?.is_verified_senior) {
    throw new Error("Only verified seniors can rate colleges");
  }
  
  const { data, error } = await supabase
    .from("college_ratings")
    .upsert({
      user_id,
      college_id,
      academics,
      placements,
      hostel,
      campus_culture,
      infrastructure,
      value_for_money,
      review_text,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,college_id" })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update college's cached ratings
  await updateCollegeCachedRatings(college_id);
  
  return data;
};

// Update cached ratings on college table
const updateCollegeCachedRatings = async (collegeId) => {
  const ratings = await getCollegeRatings(collegeId);
  
  await supabase
    .from("colleges")
    .update({
      overall_rating: ratings.overall,
      academics_rating: ratings.academics,
      placement_rating: ratings.placements,
      hostel_rating: ratings.hostel,
      campus_rating: ratings.campus_culture,
      infrastructure_rating: ratings.infrastructure,
      total_reviews: ratings.total_reviews,
    })
    .eq("id", collegeId);
};

// Compare multiple colleges
export const compareColleges = async (collegeIds) => {
  if (!Array.isArray(collegeIds) || collegeIds.length < 2) {
    throw new Error("At least 2 colleges required for comparison");
  }
  
  if (collegeIds.length > 5) {
    throw new Error("Maximum 5 colleges can be compared at once");
  }
  
  const { data, error } = await supabase
    .from("colleges")
    .select("*")
    .in("id", collegeIds);
  
  if (error) throw error;
  
  // Get ratings for each college
  const collegesWithRatings = await Promise.all(
    data.map(async (college) => {
      const ratings = await getCollegeRatings(college.id);
      return { ...college, ratings };
    })
  );
  
  return {
    colleges: collegesWithRatings,
    comparison_categories: [
      { id: "academics", name: "Academics", description: "Teaching quality, curriculum, faculty" },
      { id: "placements", name: "Placements", description: "Job opportunities, packages, companies" },
      { id: "hostel", name: "Hostel Life", description: "Accommodation, food, facilities" },
      { id: "campus_culture", name: "Campus Culture", description: "Events, clubs, diversity" },
      { id: "infrastructure", name: "Infrastructure", description: "Labs, library, sports" },
      { id: "value_for_money", name: "Value for Money", description: "Fees vs quality" },
    ],
  };
};

// Get trending colleges (most discussed)
export const getTrendingColleges = async (limit = 10) => {
  const { data, error } = await supabase
    .from("colleges")
    .select("*")
    .order("question_count", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

// Search colleges by name
export const searchColleges = async (query, limit = 10) => {
  const { data, error } = await supabase
    .from("colleges")
    .select("id, name, location, type")
    .ilike("name", `%${query}%`)
    .limit(limit);
  
  if (error) throw error;
  return data;
};
