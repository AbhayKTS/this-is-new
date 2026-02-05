/**
 * Comparisons Service - Firebase Operations
 */

import { db, collections } from "../../config/firebase.js";
import collegeService from "./collegeService.js";

const comparisonsRef = db.collection(collections.COMPARISONS);

export const comparisonsService = {
  /**
   * Save a comparison
   */
  async save(userId, collegeIds, notes = null) {
    if (collegeIds.length < 2 || collegeIds.length > 5) {
      throw new Error("Must compare between 2 and 5 colleges");
    }
    
    // Get all colleges
    const colleges = await Promise.all(
      collegeIds.map(id => collegeService.getById(id))
    );
    
    const validColleges = colleges.filter(c => c !== null);
    if (validColleges.length < 2) {
      throw new Error("Not enough valid colleges to compare");
    }
    
    // Build comparison data
    const comparisonData = {};
    for (const college of validColleges) {
      comparisonData[college.id] = {
        name: college.name,
        shortName: college.shortName,
        overallRating: college.overallRating,
        ratings: college.ratings,
        placementStats: college.placementStats,
        type: college.type,
        city: college.city,
        state: college.state,
      };
    }
    
    const comparison = {
      userId,
      collegeIds: validColleges.map(c => c.id),
      collegeNames: validColleges.map(c => c.name),
      comparisonData,
      notes,
      decision: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await comparisonsRef.add(comparison);
    return { id: docRef.id, ...comparison };
  },
  
  /**
   * Get comparison by ID
   */
  async getById(id) {
    const doc = await comparisonsRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get user's comparisons
   */
  async getByUser(userId, limit = 10) {
    const snapshot = await comparisonsRef
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Update comparison (add notes/decision)
   */
  async update(id, userId, data) {
    const comparison = await this.getById(id);
    if (!comparison) throw new Error("Comparison not found");
    if (comparison.userId !== userId) throw new Error("Unauthorized");
    
    await comparisonsRef.doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    
    return this.getById(id);
  },
  
  /**
   * Delete comparison
   */
  async delete(id, userId) {
    const comparison = await this.getById(id);
    if (!comparison) throw new Error("Comparison not found");
    if (comparison.userId !== userId) throw new Error("Unauthorized");
    
    await comparisonsRef.doc(id).delete();
    return { success: true };
  },
  
  /**
   * Compare colleges (without saving)
   */
  async compare(collegeIds) {
    const colleges = await Promise.all(
      collegeIds.map(id => collegeService.getById(id))
    );
    
    const validColleges = colleges.filter(c => c !== null);
    
    // Build comparison result
    const result = {
      colleges: validColleges.map(c => ({
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        city: c.city,
        state: c.state,
        type: c.type,
        overallRating: c.overallRating,
        ratingsCount: c.ratingsCount,
        ratings: c.ratings,
        placementStats: c.placementStats,
        verifiedSeniorsCount: c.verifiedSeniorsCount,
        questionsCount: c.questionsCount,
        reviewsCount: c.reviewsCount,
      })),
      
      // Highlights
      highlights: {
        bestOverall: validColleges.reduce((best, c) => 
          c.overallRating > (best?.overallRating || 0) ? c : best, null)?.name,
        bestPlacements: validColleges.reduce((best, c) => 
          (c.ratings?.placements || 0) > (best?.ratings?.placements || 0) ? c : best, null)?.name,
        bestAcademics: validColleges.reduce((best, c) => 
          (c.ratings?.academics || 0) > (best?.ratings?.academics || 0) ? c : best, null)?.name,
        bestHostel: validColleges.reduce((best, c) => 
          (c.ratings?.hostel || 0) > (best?.ratings?.hostel || 0) ? c : best, null)?.name,
        bestValue: validColleges.reduce((best, c) => 
          (c.ratings?.valueForMoney || 0) > (best?.ratings?.valueForMoney || 0) ? c : best, null)?.name,
        highestPackage: validColleges.reduce((best, c) => 
          (c.placementStats?.highestPackage || 0) > (best?.placementStats?.highestPackage || 0) ? c : best, null)?.name,
      },
    };
    
    return result;
  },
};

export default comparisonsService;

