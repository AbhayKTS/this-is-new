/**
 * Ratings Service - Firebase Operations
 * Handles college ratings by verified seniors
 */

import { db, collections } from "../../config/firebase.js";
import studentService from "./studentService.js";
import collegeService from "./collegeService.js";

const ratingsRef = db.collection(collections.RATINGS);

export const ratingsService = {
  /**
   * Submit or update a rating
   */
  async submitRating(userId, collegeId, data) {
    // Get user to verify they're a senior
    const user = await studentService.getById(userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "senior" && user.role !== "admin") {
      throw new Error("Only verified seniors can submit ratings");
    }
    
    // Get college
    const college = await collegeService.getById(collegeId);
    if (!college) throw new Error("College not found");
    
    // Check if user already rated this college
    const existingRating = await this.getByUserAndCollege(userId, collegeId);
    
    const ratingData = {
      userId,
      collegeId,
      collegeName: college.name,
      
      authorRole: user.role,
      isVerifiedSenior: user.isVerifiedSenior,
      branch: user.branch,
      graduationYear: user.year,
      
      // Ratings (1-5)
      academics: data.academics,
      placements: data.placements,
      hostel: data.hostel,
      campusCulture: data.campusCulture,
      infrastructure: data.infrastructure,
      valueForMoney: data.valueForMoney,
      faculty: data.faculty || null,
      canteen: data.canteen || null,
      
      // Calculate overall
      overall: this.calculateOverall(data),
      
      // Optional comments
      comments: data.comments || {},
      
      updatedAt: new Date(),
    };
    
    if (existingRating) {
      // Update existing rating
      await ratingsRef.doc(existingRating.id).update(ratingData);
      
      // Recalculate college ratings
      await this.recalculateCollegeRatings(collegeId);
      
      return { id: existingRating.id, ...ratingData };
    } else {
      // Create new rating
      ratingData.createdAt = new Date();
      const docRef = await ratingsRef.add(ratingData);
      
      // Update user stats
      await studentService.incrementStat(userId, "ratingsGiven");
      
      // Update college ratings
      await collegeService.updateRatings(collegeId, data);
      
      // Award reputation
      await studentService.updateReputation(userId, 15);
      
      return { id: docRef.id, ...ratingData };
    }
  },
  
  /**
   * Calculate overall rating
   */
  calculateOverall(data) {
    const fields = ['academics', 'placements', 'hostel', 'campusCulture', 'infrastructure', 'valueForMoney'];
    let sum = 0;
    let count = 0;
    
    for (const field of fields) {
      if (data[field] !== undefined && data[field] !== null) {
        sum += data[field];
        count++;
      }
    }
    
    return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  },
  
  /**
   * Get rating by ID
   */
  async getById(id) {
    const doc = await ratingsRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get rating by user and college
   */
  async getByUserAndCollege(userId, collegeId) {
    const snapshot = await ratingsRef
      .where("userId", "==", userId)
      .where("collegeId", "==", collegeId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get all ratings for a college
   */
  async getByCollege(collegeId, options = {}) {
    let query = ratingsRef.where("collegeId", "==", collegeId);
    
    if (options.branch) {
      query = query.where("branch", "==", options.branch);
    }
    
    query = query.orderBy("createdAt", "desc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get ratings by user
   */
  async getByUser(userId) {
    const snapshot = await ratingsRef
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Recalculate college ratings (when a rating is updated or deleted)
   */
  async recalculateCollegeRatings(collegeId) {
    const allRatings = await this.getByCollege(collegeId);
    
    if (allRatings.length === 0) {
      // Reset college ratings to 0
      await collegeService.update(collegeId, {
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
      });
      return;
    }
    
    const categories = ['academics', 'placements', 'hostel', 'campusCulture', 'infrastructure', 'valueForMoney', 'faculty', 'canteen'];
    const sums = {};
    const counts = {};
    
    for (const category of categories) {
      sums[category] = 0;
      counts[category] = 0;
    }
    
    for (const rating of allRatings) {
      for (const category of categories) {
        if (rating[category] !== undefined && rating[category] !== null) {
          sums[category] += rating[category];
          counts[category]++;
        }
      }
    }
    
    const averages = {};
    let totalSum = 0;
    let totalCount = 0;
    
    for (const category of categories) {
      if (counts[category] > 0) {
        averages[category] = Math.round((sums[category] / counts[category]) * 10) / 10;
        totalSum += averages[category];
        totalCount++;
      } else {
        averages[category] = 0;
      }
    }
    
    const overallRating = totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : 0;
    
    await collegeService.update(collegeId, {
      overallRating,
      ratingsCount: allRatings.length,
      ratings: averages,
    });
  },
  
  /**
   * Get rating distribution for a college
   */
  async getRatingDistribution(collegeId, category = "overall") {
    const allRatings = await this.getByCollege(collegeId);
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    for (const rating of allRatings) {
      const value = Math.round(rating[category] || rating.overall);
      if (value >= 1 && value <= 5) {
        distribution[value]++;
      }
    }
    
    return distribution;
  },
  
  /**
   * Get branch-wise ratings for a college
   */
  async getBranchWiseRatings(collegeId) {
    const allRatings = await this.getByCollege(collegeId);
    
    const branchRatings = {};
    
    for (const rating of allRatings) {
      const branch = rating.branch || "Unknown";
      if (!branchRatings[branch]) {
        branchRatings[branch] = { count: 0, totalOverall: 0 };
      }
      branchRatings[branch].count++;
      branchRatings[branch].totalOverall += rating.overall;
    }
    
    // Calculate averages
    const result = {};
    for (const [branch, data] of Object.entries(branchRatings)) {
      result[branch] = {
        count: data.count,
        averageRating: Math.round((data.totalOverall / data.count) * 10) / 10,
      };
    }
    
    return result;
  },
};

export default ratingsService;

