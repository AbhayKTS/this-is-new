import { collegeService, comparisonsService, ratingsService, studentService } from './firebase/index.js';

export const getCollege = async (collegeId) => {
  const college = await collegeService.getById(collegeId);
  if (!college) {
    const error = new Error('College not found');
    error.status = 404;
    throw error;
  }
  return college;
};

export const listColleges = async ({ page = 1, pageSize = 20, search = null, location = null, type = null, sortBy = 'name' }) => {
  let colleges = await collegeService.getAll({ type: type || undefined, state: location || undefined });
  
  if (search) {
    const searchLower = search.toLowerCase();
    colleges = colleges.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.shortName?.toLowerCase().includes(searchLower) ||
      c.city?.toLowerCase().includes(searchLower)
    );
  }
  
  switch (sortBy) {
    case 'rating':
      colleges.sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
      break;
    case 'placements':
      colleges.sort((a, b) => (b.placementStats?.avgPackage || 0) - (a.placementStats?.avgPackage || 0));
      break;
    default:
      colleges.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  const total = colleges.length;
  const from = (page - 1) * pageSize;
  const paginatedColleges = colleges.slice(from, from + pageSize);
  
  return { data: paginatedColleges, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
};

export const getCollegeRatings = async (collegeId) => {
  const ratings = await ratingsService.getByCollege(collegeId);
  const distribution = await ratingsService.getRatingDistribution(collegeId);
  const branchWise = await ratingsService.getBranchWiseRatings(collegeId);
  return { ratings, distribution, branchWise };
};

export const submitCollegeRating = async (ratingData) => {
  const { college_id, user_id, ...ratings } = ratingData;
  
  // Increment user's ratings given count
  await studentService.incrementStat(user_id, "ratingsGiven");
  
  return await ratingsService.submitRating(user_id, college_id, ratings);
};

export const compareColleges = async (collegeIds) => {
  return await comparisonsService.compare(collegeIds);
};

export const getTrendingColleges = async (limit = 10) => {
  return await collegeService.getTopColleges(limit, 'overallRating');
};

export const searchColleges = async (query, limit = 10) => {
  return await collegeService.search(query, { limit });
};

// ============================================
// ADMIN OPERATIONS
// ============================================

// Create a new college (Admin only)
export const createCollege = async (collegeData) => {
  const { 
    name, 
    shortName, 
    type, 
    city, 
    state, 
    address,
    website,
    email,
    phone,
    establishedYear,
    description,
    branches,
    facilities,
    accreditation,
    affiliatedUniversity,
    placementStats,
    images,
  } = collegeData;
  
  // Check if college with same name exists
  const existing = await collegeService.search(name, { limit: 1 });
  if (existing.length > 0 && existing[0].name.toLowerCase() === name.toLowerCase()) {
    throw new Error('College with this name already exists');
  }
  
  return await collegeService.create({
    name,
    shortName: shortName || null,
    type: type || 'private',
    city,
    state,
    address: address || null,
    website: website || null,
    email: email || null,
    phone: phone || null,
    establishedYear: establishedYear || null,
    description: description || null,
    branches: branches || [],
    facilities: facilities || [],
    accreditation: accreditation || [],
    affiliatedUniversity: affiliatedUniversity || null,
    placementStats: placementStats || null,
    images: images || [],
  });
};

// Update a college (Admin only)
export const updateCollege = async (collegeId, updateData) => {
  const college = await collegeService.getById(collegeId);
  if (!college) {
    throw new Error('College not found');
  }
  
  return await collegeService.update(collegeId, updateData);
};

// Delete a college (Admin only)
export const deleteCollege = async (collegeId) => {
  const college = await collegeService.getById(collegeId);
  if (!college) {
    throw new Error('College not found');
  }
  
  await collegeService.delete(collegeId);
  return { success: true, message: 'College deleted successfully' };
};

// Get college statistics (Admin dashboard)
export const getCollegeStats = async (collegeId) => {
  const college = await getCollege(collegeId);
  const ratings = await getCollegeRatings(collegeId);
  const verifiedSeniors = await studentService.getByCollege(collegeId, { isVerifiedSenior: true });
  const students = await studentService.getByCollege(collegeId);
  
  return {
    college,
    totalRatings: ratings.ratings?.length || 0,
    ratingDistribution: ratings.distribution,
    verifiedSeniorsCount: verifiedSeniors.length,
    totalStudents: students.length,
  };
};
