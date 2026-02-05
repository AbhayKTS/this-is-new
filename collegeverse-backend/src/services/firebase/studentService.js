/**
 * Student Service - Firebase Operations
 */

import { db, collections, auth } from "../../config/firebase.js";

const studentsRef = db.collection(collections.STUDENTS);

export const studentService = {
  /**
   * Create a new student
   */
  async create(uid, data) {
    const studentData = {
      uid,
      email: data.email?.toLowerCase(),
      name: data.name || "",
      phone: data.phone || null,
      avatar: data.avatar || null,
      bio: "",
      
      role: data.role || "explorer",
      isCollegeEmail: data.isCollegeEmail || false,
      
      collegeId: data.collegeId || null,
      collegeName: data.collegeName || null,
      branch: data.branch || null,
      year: data.year || null,
      enrollmentNumber: data.enrollmentNumber || null,
      
      isVerifiedSenior: false,
      verificationStatus: null,
      verificationId: null,
      
      reputation: 0,
      questionsAsked: 0,
      answersGiven: 0,
      reviewsWritten: 0,
      ratingsGiven: 0,
      helpfulVotes: 0,
      
      savedColleges: [],
      interests: [],
      notificationPrefs: {
        email: true,
        push: true,
        digest: "weekly",
      },
      
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    };
    
    await studentsRef.doc(uid).set(studentData);
    return studentData;
  },
  
  /**
   * Get student by ID
   */
  async getById(uid) {
    const doc = await studentsRef.doc(uid).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get student by email
   */
  async getByEmail(email) {
    const snapshot = await studentsRef
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Update student
   */
  async update(uid, data) {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    await studentsRef.doc(uid).update(updateData);
    return this.getById(uid);
  },
  
  /**
   * Update last login
   */
  async updateLastLogin(uid) {
    await studentsRef.doc(uid).update({
      lastLoginAt: new Date(),
    });
  },
  
  /**
   * Upgrade role
   */
  async upgradeRole(uid, newRole, additionalData = {}) {
    await studentsRef.doc(uid).update({
      role: newRole,
      ...additionalData,
      updatedAt: new Date(),
    });
  },
  
  /**
   * Update reputation
   */
  async updateReputation(uid, points) {
    const student = await this.getById(uid);
    if (!student) return null;
    
    const newReputation = Math.max(0, student.reputation + points);
    await studentsRef.doc(uid).update({
      reputation: newReputation,
      updatedAt: new Date(),
    });
    
    return newReputation;
  },
  
  /**
   * Increment stat
   */
  async incrementStat(uid, stat, amount = 1) {
    const student = await this.getById(uid);
    if (!student) return null;
    
    const currentValue = student[stat] || 0;
    await studentsRef.doc(uid).update({
      [stat]: currentValue + amount,
      updatedAt: new Date(),
    });
  },
  
  /**
   * Save college to favorites
   */
  async saveCollege(uid, collegeId) {
    const student = await this.getById(uid);
    if (!student) return null;
    
    const savedColleges = student.savedColleges || [];
    if (!savedColleges.includes(collegeId)) {
      savedColleges.push(collegeId);
      await studentsRef.doc(uid).update({
        savedColleges,
        updatedAt: new Date(),
      });
    }
    return savedColleges;
  },
  
  /**
   * Remove college from favorites
   */
  async unsaveCollege(uid, collegeId) {
    const student = await this.getById(uid);
    if (!student) return null;
    
    const savedColleges = (student.savedColleges || []).filter(id => id !== collegeId);
    await studentsRef.doc(uid).update({
      savedColleges,
      updatedAt: new Date(),
    });
    return savedColleges;
  },
  
  /**
   * Get students by college
   */
  async getByCollege(collegeId, options = {}) {
    let query = studentsRef.where("collegeId", "==", collegeId);
    
    if (options.role) {
      query = query.where("role", "==", options.role);
    }
    if (options.isVerifiedSenior !== undefined) {
      query = query.where("isVerifiedSenior", "==", options.isVerifiedSenior);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get top contributors (for leaderboard)
   */
  async getTopContributors(limit = 10, collegeId = null) {
    let query = studentsRef.orderBy("reputation", "desc").limit(limit);
    
    if (collegeId) {
      query = studentsRef
        .where("collegeId", "==", collegeId)
        .orderBy("reputation", "desc")
        .limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

export default studentService;

