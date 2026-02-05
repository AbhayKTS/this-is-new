/**
 * CollegeVerse Firebase Database Schema
 * 
 * This file defines the structure of all Firestore collections.
 * Run this script to initialize sample data and understand the schema.
 */

import { db, collections } from "../config/firebase.js";

// ============================================
// COLLECTION SCHEMAS (Documentation)
// ============================================

export const SCHEMAS = {
  // ============================================
  // 1. STUDENTS COLLECTION
  // ============================================
  students: {
    // Document ID: Firebase Auth UID
    uid: "string",                    // Firebase Auth UID
    email: "string",                  // User's email
    name: "string",                   // Full name
    phone: "string | null",           // Phone number
    avatar: "string | null",          // Profile picture URL
    bio: "string",                    // Short bio
    
    // Role & Access
    role: "explorer | student | senior | admin",
    isCollegeEmail: "boolean",        // true if registered with college email
    
    // College Info (for students/seniors)
    collegeId: "string | null",       // Reference to colleges collection
    collegeName: "string | null",     // Denormalized for quick access
    branch: "string | null",          // e.g., "Computer Science"
    year: "number | null",            // Graduation year e.g., 2025
    enrollmentNumber: "string | null",
    
    // Verification Status (for seniors)
    isVerifiedSenior: "boolean",
    verificationStatus: "null | pending | approved | rejected",
    verificationId: "string | null",  // Reference to seniors_verification
    
    // Stats & Reputation
    reputation: "number",             // Total reputation points
    questionsAsked: "number",
    answersGiven: "number",
    reviewsWritten: "number",
    ratingsGiven: "number",
    helpfulVotes: "number",           // Upvotes received on answers
    
    // Preferences
    savedColleges: ["collegeId"],     // Array of college IDs
    interests: ["string"],            // e.g., ["engineering", "placements"]
    notificationPrefs: {
      email: "boolean",
      push: "boolean",
      digest: "daily | weekly | never",
    },
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
    lastLoginAt: "timestamp",
  },

  // ============================================
  // 2. COLLEGES COLLECTION
  // ============================================
  colleges: {
    // Document ID: Auto-generated or slug
    id: "string",
    name: "string",                   // Full name e.g., "Indian Institute of Technology Bombay"
    shortName: "string",              // e.g., "IIT Bombay"
    slug: "string",                   // URL-friendly e.g., "iit-bombay"
    
    // Location
    city: "string",
    state: "string",
    country: "string",
    address: "string",
    pincode: "string",
    coordinates: {
      lat: "number",
      lng: "number",
    },
    
    // Basic Info
    type: "government | private | deemed | autonomous",
    establishedYear: "number",
    accreditation: ["NAAC A++", "NBA", "NIRF Top 10"],
    affiliatedTo: "string",           // University affiliation
    website: "string",
    logo: "string",                   // Logo URL
    coverImage: "string",             // Cover image URL
    images: ["string"],               // Gallery images
    
    // Academic Info
    courses: [{
      name: "string",
      duration: "string",
      degree: "B.Tech | M.Tech | MBA | etc.",
      specializations: ["string"],
      seats: "number",
      fees: "number",                 // Per year
    }],
    totalStudents: "number",
    facultyCount: "number",
    
    // Email Domain (for verification)
    emailDomains: ["string"],         // e.g., ["iitb.ac.in", "student.iitb.ac.in"]
    
    // Aggregated Ratings (calculated from ratings collection)
    overallRating: "number",          // 1-5, average of all dimensions
    ratingsCount: "number",           // Total number of ratings
    ratings: {
      academics: "number",            // 1-5
      placements: "number",
      hostel: "number",
      campusCulture: "number",
      infrastructure: "number",
      valueForMoney: "number",
      faculty: "number",
      canteen: "number",
    },
    
    // Stats
    questionsCount: "number",
    reviewsCount: "number",
    verifiedSeniorsCount: "number",
    
    // Placement Stats
    placementStats: {
      avgPackage: "number",           // In LPA
      highestPackage: "number",
      medianPackage: "number",
      placementPercentage: "number",
      topRecruiters: ["string"],
    },
    
    // Status
    isVerified: "boolean",            // Verified by CollegeVerse
    isActive: "boolean",
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },

  // ============================================
  // 3. SENIORS_VERIFICATION COLLECTION
  // ============================================
  seniors_verification: {
    // Document ID: Auto-generated
    id: "string",
    userId: "string",                 // Reference to students collection
    userEmail: "string",
    userName: "string",
    
    // College Info
    collegeId: "string",
    collegeName: "string",
    branch: "string",
    year: "number",                   // Graduation year
    enrollmentNumber: "string",
    
    // Verification Documents
    collegeIdCard: "string",          // URL to uploaded ID card image
    marksheet: "string | null",       // Optional: marksheet URL
    linkedinProfile: "string | null",
    additionalProof: "string | null",
    
    // Status
    status: "pending | approved | rejected | expired",
    reviewedBy: "string | null",      // Admin user ID who reviewed
    reviewedAt: "timestamp | null",
    rejectionReason: "string | null",
    
    // Timestamps
    submittedAt: "timestamp",
    expiresAt: "timestamp",           // Verification expires after graduation
  },

  // ============================================
  // 4. REVIEWS COLLECTION
  // ============================================
  reviews: {
    // Document ID: Auto-generated
    id: "string",
    collegeId: "string",
    collegeName: "string",            // Denormalized
    
    // Author
    authorId: "string",
    authorName: "string",
    authorRole: "student | senior",
    isVerifiedSenior: "boolean",
    
    // Content
    title: "string",
    content: "string",                // Detailed review text
    pros: ["string"],                 // List of positives
    cons: ["string"],                 // List of negatives
    
    // Ratings given in this review
    ratings: {
      overall: "number",
      academics: "number",
      placements: "number",
      hostel: "number",
      campusCulture: "number",
      infrastructure: "number",
      valueForMoney: "number",
    },
    
    // Engagement
    helpfulCount: "number",           // Users who found this helpful
    notHelpfulCount: "number",
    commentsCount: "number",
    
    // Status
    status: "published | under_review | flagged | removed",
    isAnonymous: "boolean",
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },

  // ============================================
  // 5. QA_QUESTIONS COLLECTION
  // ============================================
  qa_questions: {
    // Document ID: Auto-generated
    id: "string",
    collegeId: "string",
    collegeName: "string",            // Denormalized
    
    // Author
    authorId: "string",
    authorName: "string",
    authorRole: "string",
    isAnonymous: "boolean",
    
    // Content
    title: "string",                  // Question title
    body: "string",                   // Detailed question
    tags: ["string"],                 // e.g., ["placements", "hostel", "cse"]
    category: "academics | placements | hostel | campus | admissions | other",
    
    // Engagement
    upvotes: "number",
    downvotes: "number",
    viewsCount: "number",
    answersCount: "number",
    
    // Best Answer
    acceptedAnswerId: "string | null",
    
    // Status
    status: "open | answered | closed",
    isFeatured: "boolean",
    isPinned: "boolean",
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
    lastActivityAt: "timestamp",      // Updated when new answer/comment
  },

  // ============================================
  // 6. QA_ANSWERS COLLECTION
  // ============================================
  qa_answers: {
    // Document ID: Auto-generated
    id: "string",
    questionId: "string",             // Reference to qa_questions
    collegeId: "string",
    
    // Author
    authorId: "string",
    authorName: "string",
    authorRole: "string",
    isVerifiedSenior: "boolean",
    isAnonymous: "boolean",
    
    // Content
    body: "string",                   // Answer content (markdown supported)
    
    // Engagement
    upvotes: "number",
    downvotes: "number",
    commentsCount: "number",
    
    // Status
    isAccepted: "boolean",            // Marked as best answer
    isFeatured: "boolean",
    status: "published | flagged | removed",
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },

  // ============================================
  // 7. RATINGS COLLECTION
  // ============================================
  ratings: {
    // Document ID: `${userId}_${collegeId}` (one rating per user per college)
    id: "string",
    userId: "string",
    collegeId: "string",
    collegeName: "string",
    
    // Author Info
    authorRole: "senior",             // Only seniors can rate
    isVerifiedSenior: "boolean",
    branch: "string",
    graduationYear: "number",
    
    // Individual Ratings (1-5)
    academics: "number",
    placements: "number",
    hostel: "number",
    campusCulture: "number",
    infrastructure: "number",
    valueForMoney: "number",
    faculty: "number",
    canteen: "number",
    
    // Calculated
    overall: "number",                // Average of all ratings
    
    // Optional Comments
    comments: {
      academics: "string | null",
      placements: "string | null",
      hostel: "string | null",
      campusCulture: "string | null",
      infrastructure: "string | null",
      valueForMoney: "string | null",
    },
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },

  // ============================================
  // 8. COMPARISONS COLLECTION (User's saved comparisons)
  // ============================================
  comparisons: {
    // Document ID: Auto-generated
    id: "string",
    userId: "string",
    
    // Colleges being compared
    collegeIds: ["string"],           // Array of 2-5 college IDs
    collegeNames: ["string"],         // Denormalized names
    
    // Comparison Data (snapshot at time of comparison)
    comparisonData: {
      // Keyed by collegeId
      "[collegeId]": {
        name: "string",
        overallRating: "number",
        ratings: {},
        placementStats: {},
      }
    },
    
    // User's Notes
    notes: "string | null",
    decision: "string | null",        // Which college they chose
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },

  // ============================================
  // 9. LEADERBOARD_SCORES COLLECTION
  // ============================================
  leaderboard_scores: {
    // Document ID: userId
    userId: "string",
    userName: "string",
    userAvatar: "string | null",
    collegeId: "string",
    collegeName: "string",
    
    // Scores
    totalReputation: "number",
    weeklyReputation: "number",
    monthlyReputation: "number",
    
    // Activity Counts
    answersCount: "number",
    acceptedAnswersCount: "number",
    reviewsCount: "number",
    helpfulVotes: "number",
    
    // Badges
    badgesCount: "number",
    topBadge: "string | null",        // Highest badge earned
    
    // Rank (updated periodically)
    globalRank: "number",
    collegeRank: "number",
    
    // Timestamps
    updatedAt: "timestamp",
  },

  // ============================================
  // 10. BADGES COLLECTION
  // ============================================
  badges: {
    // Document ID: badge slug e.g., "verified-senior"
    id: "string",
    name: "string",                   // e.g., "Verified Senior"
    description: "string",
    icon: "string",                   // Icon URL or emoji
    color: "string",                  // Badge color
    
    // Requirements
    type: "automatic | manual",       // Automatic = earned by meeting criteria
    requirements: {
      // For automatic badges
      minReputation: "number | null",
      minAnswers: "number | null",
      minAcceptedAnswers: "number | null",
      minReviews: "number | null",
      minHelpfulVotes: "number | null",
      requiresVerification: "boolean",
      customCriteria: "string | null",
    },
    
    // Rewards
    reputationBonus: "number",        // Reputation points awarded
    
    // Status
    isActive: "boolean",
    
    // Timestamps
    createdAt: "timestamp",
  },

  // ============================================
  // 11. USER_BADGES (Junction table)
  // ============================================
  user_badges: {
    // Document ID: `${userId}_${badgeId}`
    id: "string",
    userId: "string",
    badgeId: "string",
    badgeName: "string",
    
    // Award Info
    awardedAt: "timestamp",
    awardedBy: "string | null",       // Admin ID for manual badges
    awardReason: "string | null",
  },

  // ============================================
  // 12. COMMUNITIES COLLECTION
  // ============================================
  communities: {
    // Document ID: collegeId (one community per college)
    id: "string",
    collegeId: "string",
    collegeName: "string",
    
    // Stats
    membersCount: "number",
    postsCount: "number",
    activeMembers: "number",          // Active in last 30 days
    
    // Settings
    isPrivate: "boolean",             // Only college students can join
    requiresVerification: "boolean",
    
    // Moderators
    moderatorIds: ["string"],
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },

  // ============================================
  // 13. COMMUNITY_POSTS COLLECTION
  // ============================================
  community_posts: {
    // Document ID: Auto-generated
    id: "string",
    communityId: "string",
    collegeId: "string",
    
    // Author
    authorId: "string",
    authorName: "string",
    authorRole: "string",
    isVerifiedSenior: "boolean",
    
    // Content
    type: "discussion | announcement | event | question | resource",
    title: "string",
    body: "string",
    attachments: ["string"],          // URLs to images/files
    tags: ["string"],
    
    // Engagement
    likesCount: "number",
    commentsCount: "number",
    viewsCount: "number",
    
    // Status
    isPinned: "boolean",
    status: "published | flagged | removed",
    
    // Timestamps
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },
};

// ============================================
// SAMPLE DATA INITIALIZATION
// ============================================

export const initializeSampleData = async () => {
  console.log("🚀 Initializing CollegeVerse database with sample data...\n");
  
  try {
    // 1. Create sample colleges
    const sampleColleges = [
      {
        name: "Indian Institute of Technology Bombay",
        shortName: "IIT Bombay",
        slug: "iit-bombay",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        type: "government",
        establishedYear: 1958,
        accreditation: ["NAAC A++", "NBA", "NIRF Rank 3"],
        emailDomains: ["iitb.ac.in", "student.iitb.ac.in"],
        overallRating: 4.7,
        ratingsCount: 1250,
        ratings: {
          academics: 4.8,
          placements: 4.9,
          hostel: 4.2,
          campusCulture: 4.6,
          infrastructure: 4.7,
          valueForMoney: 4.5,
          faculty: 4.7,
          canteen: 3.9,
        },
        placementStats: {
          avgPackage: 21.5,
          highestPackage: 280,
          medianPackage: 18,
          placementPercentage: 95,
          topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "Uber", "Amazon"],
        },
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Birla Institute of Technology and Science, Pilani",
        shortName: "BITS Pilani",
        slug: "bits-pilani",
        city: "Pilani",
        state: "Rajasthan",
        country: "India",
        type: "private",
        establishedYear: 1964,
        accreditation: ["NAAC A", "NIRF Rank 25"],
        emailDomains: ["bits-pilani.ac.in", "pilani.bits-pilani.ac.in"],
        overallRating: 4.5,
        ratingsCount: 890,
        ratings: {
          academics: 4.6,
          placements: 4.5,
          hostel: 4.0,
          campusCulture: 4.8,
          infrastructure: 4.3,
          valueForMoney: 3.8,
          faculty: 4.4,
          canteen: 4.0,
        },
        placementStats: {
          avgPackage: 18.5,
          highestPackage: 150,
          medianPackage: 15,
          placementPercentage: 92,
          topRecruiters: ["Microsoft", "Google", "Atlassian", "Sprinklr", "DE Shaw"],
        },
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Vellore Institute of Technology",
        shortName: "VIT Vellore",
        slug: "vit-vellore",
        city: "Vellore",
        state: "Tamil Nadu",
        country: "India",
        type: "private",
        establishedYear: 1984,
        accreditation: ["NAAC A++", "NIRF Rank 12"],
        emailDomains: ["vit.ac.in", "vitstudent.ac.in"],
        overallRating: 4.1,
        ratingsCount: 2100,
        ratings: {
          academics: 4.2,
          placements: 4.0,
          hostel: 3.8,
          campusCulture: 4.3,
          infrastructure: 4.5,
          valueForMoney: 3.5,
          faculty: 4.0,
          canteen: 4.2,
        },
        placementStats: {
          avgPackage: 8.5,
          highestPackage: 44,
          medianPackage: 6,
          placementPercentage: 85,
          topRecruiters: ["TCS", "Cognizant", "Infosys", "Wipro", "Amazon"],
        },
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    for (const college of sampleColleges) {
      const docRef = db.collection(collections.COLLEGES).doc(college.slug);
      await docRef.set(college);
      console.log(`✅ Created college: ${college.shortName}`);
    }
    
    // 2. Create sample badges
    const sampleBadges = [
      {
        name: "Verified Senior",
        description: "Successfully verified as a senior student",
        icon: "🎓",
        color: "#4CAF50",
        type: "automatic",
        requirements: {
          requiresVerification: true,
        },
        reputationBonus: 100,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Top Contributor",
        description: "Reached 500+ reputation points",
        icon: "⭐",
        color: "#FFD700",
        type: "automatic",
        requirements: {
          minReputation: 500,
        },
        reputationBonus: 50,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Helpful Mentor",
        description: "Had 10+ answers accepted as best answer",
        icon: "🏆",
        color: "#9C27B0",
        type: "automatic",
        requirements: {
          minAcceptedAnswers: 10,
        },
        reputationBonus: 75,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Placement Guide",
        description: "Expert in placement-related guidance",
        icon: "💼",
        color: "#2196F3",
        type: "manual",
        requirements: {
          customCriteria: "Consistently provides valuable placement advice",
        },
        reputationBonus: 100,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Hostel Expert",
        description: "Detailed knowledge about hostel life",
        icon: "🏠",
        color: "#FF9800",
        type: "manual",
        requirements: {
          customCriteria: "Provides comprehensive hostel guidance",
        },
        reputationBonus: 50,
        isActive: true,
        createdAt: new Date(),
      },
    ];
    
    for (const badge of sampleBadges) {
      const slug = badge.name.toLowerCase().replace(/\s+/g, "-");
      const docRef = db.collection(collections.BADGES).doc(slug);
      await docRef.set({ ...badge, id: slug });
      console.log(`✅ Created badge: ${badge.name}`);
    }
    
    console.log("\n🎉 Database initialization complete!");
    console.log(`   - ${sampleColleges.length} colleges created`);
    console.log(`   - ${sampleBadges.length} badges created`);
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};

// Export for CLI usage
export default { SCHEMAS, initializeSampleData };
