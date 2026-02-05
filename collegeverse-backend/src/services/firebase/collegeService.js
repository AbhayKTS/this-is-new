/**
 * College Service - Firebase Operations
 */

import { db, collections } from "../../config/firebase.js";

const collegesRef = db.collection(collections.COLLEGES);

export const collegeService = {
  /**
   * Create a new college
   */
  async create(data) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    const collegeData = {
      id: slug,
      name: data.name,
      shortName: data.shortName || data.name,
      slug,
      
      city: data.city || "",
      state: data.state || "",
      country: data.country || "India",
      address: data.address || "",
      pincode: data.pincode || "",
      coordinates: data.coordinates || null,
      
      type: data.type || "private",
      establishedYear: data.establishedYear || null,
      accreditation: data.accreditation || [],
      affiliatedTo: data.affiliatedTo || null,
      website: data.website || "",
      logo: data.logo || null,
      coverImage: data.coverImage || null,
      images: data.images || [],
      
      courses: data.courses || [],
      totalStudents: data.totalStudents || 0,
      facultyCount: data.facultyCount || 0,
      
      emailDomains: data.emailDomains || [],
      
      overallRating: 0,
      ratingsCount: 0,
      ratings: {
        academics: 0,
        placements: 0,
        hostel: 0,
        campusCulture: 0,
        infrastructure: 0,
        valueForMoney: 0,
        faculty: 0,
        canteen: 0,
      },
      
      questionsCount: 0,
      reviewsCount: 0,
      verifiedSeniorsCount: 0,
      
      placementStats: data.placementStats || {
        avgPackage: 0,
        highestPackage: 0,
        medianPackage: 0,
        placementPercentage: 0,
        topRecruiters: [],
      },
      
      isVerified: data.isVerified || false,
      isActive: true,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await collegesRef.doc(slug).set(collegeData);
    return collegeData;
  },
  
  /**
   * Get college by ID/slug
   */
  async getById(id) {
    const doc = await collegesRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get all colleges
   */
  async getAll(options = {}) {
    let query = collegesRef.where("isActive", "==", true);
    
    if (options.type) {
      query = query.where("type", "==", options.type);
    }
    if (options.state) {
      query = query.where("state", "==", options.state);
    }
    if (options.orderBy) {
      query = query.orderBy(options.orderBy, options.order || "desc");
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Search colleges
   */
  async search(searchTerm, options = {}) {
    // Firestore doesn't support full-text search natively
    // This is a basic implementation - for production, consider Algolia/Elasticsearch
    const allColleges = await this.getAll(options);
    const term = searchTerm.toLowerCase();
    
    return allColleges.filter(college => 
      college.name.toLowerCase().includes(term) ||
      college.shortName?.toLowerCase().includes(term) ||
      college.city?.toLowerCase().includes(term) ||
      college.state?.toLowerCase().includes(term)
    );
  },
  
  /**
   * Get colleges by email domain
   */
  async getByEmailDomain(email) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return null;
    
    const snapshot = await collegesRef
      .where("emailDomains", "array-contains", domain)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Update college
   */
  async update(id, data) {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    await collegesRef.doc(id).update(updateData);
    return this.getById(id);
  },
  
  /**
   * Delete college (soft delete)
   */
  async delete(id) {
    await collegesRef.doc(id).update({
      isActive: false,
      deletedAt: new Date(),
    });
    return { success: true };
  },
  
  /**
   * Hard delete college
   */
  async hardDelete(id) {
    await collegesRef.doc(id).delete();
    return { success: true };
  },
  
  /**
   * Update aggregated ratings
   */
  async updateRatings(collegeId, newRatings, totalRatings) {
    const college = await this.getById(collegeId);
    if (!college) return null;
    
    // Calculate new averages
    const currentCount = college.ratingsCount || 0;
    const newCount = currentCount + 1;
    
    const updatedRatings = {};
    const ratingCategories = ['academics', 'placements', 'hostel', 'campusCulture', 'infrastructure', 'valueForMoney', 'faculty', 'canteen'];
    
    let totalSum = 0;
    let categoryCount = 0;
    
    for (const category of ratingCategories) {
      if (newRatings[category] !== undefined) {
        const currentAvg = college.ratings?.[category] || 0;
        const newAvg = ((currentAvg * currentCount) + newRatings[category]) / newCount;
        updatedRatings[category] = Math.round(newAvg * 10) / 10;
        totalSum += updatedRatings[category];
        categoryCount++;
      }
    }
    
    const overallRating = categoryCount > 0 ? Math.round((totalSum / categoryCount) * 10) / 10 : 0;
    
    await collegesRef.doc(collegeId).update({
      ratings: updatedRatings,
      overallRating,
      ratingsCount: newCount,
      updatedAt: new Date(),
    });
    
    return this.getById(collegeId);
  },
  
  /**
   * Increment counter
   */
  async incrementCounter(collegeId, counter, amount = 1) {
    const college = await this.getById(collegeId);
    if (!college) return null;
    
    const currentValue = college[counter] || 0;
    await collegesRef.doc(collegeId).update({
      [counter]: currentValue + amount,
      updatedAt: new Date(),
    });
  },
  
  /**
   * Compare colleges
   */
  async compare(collegeIds) {
    const colleges = await Promise.all(
      collegeIds.map(id => this.getById(id))
    );
    
    return colleges.filter(c => c !== null);
  },
  
  /**
   * Get top colleges
   */
  async getTopColleges(limit = 10, category = "overallRating") {
    const snapshot = await collegesRef
      .where("isActive", "==", true)
      .orderBy(category, "desc")
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

export default collegeService;

