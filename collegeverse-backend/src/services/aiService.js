/**
 * AI Service - OpenAI GPT Integration
 * Handles all AI-powered features for CollegeVerse
 */

import OpenAI from "openai";
import { env } from "../config/env.js";
import { db } from "../config/firebase.js";

// Initialize OpenAI client
const openai = env.openaiApiKey ? new OpenAI({
  apiKey: env.openaiApiKey,
}) : null;

// Check if AI is available
const isAIAvailable = () => {
  if (!env.aiEnabled) {
    return { available: false, reason: "AI features are disabled" };
  }
  if (!openai) {
    return { available: false, reason: "OpenAI API key not configured" };
  }
  return { available: true };
};

// Base GPT call with error handling and caching
const callGPT = async (systemPrompt, userPrompt, options = {}) => {
  const aiStatus = isAIAvailable();
  if (!aiStatus.available) {
    throw new Error(aiStatus.reason);
  }

  const {
    model = env.openaiModel,
    maxTokens = env.openaiMaxTokens,
    temperature = 0.7,
    responseFormat = null
  } = options;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const completionOptions = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    };

    // Add JSON response format if requested
    if (responseFormat === "json") {
      completionOptions.response_format = { type: "json_object" };
    }

    const completion = await openai.chat.completions.create(completionOptions);
    
    const responseText = completion.choices[0]?.message?.content;
    
    if (responseFormat === "json") {
      return JSON.parse(responseText);
    }
    
    return responseText;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
};

// ==========================================
// 1. Q&A SUMMARIZATION
// ==========================================

/**
 * Summarize a Q&A thread with question and all answers
 */
export const summarizeQAThread = async (questionId) => {
  // Fetch question and answers from Firestore
  const questionDoc = await db.collection("qa_questions").doc(questionId).get();
  
  if (!questionDoc.exists) {
    throw new Error("Question not found");
  }
  
  const question = { id: questionDoc.id, ...questionDoc.data() };
  
  // Fetch answers
  const answersSnapshot = await db.collection("qa_answers")
    .where("questionId", "==", questionId)
    .orderBy("upvotes", "desc")
    .limit(20)
    .get();
  
  const answers = answersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  if (answers.length === 0) {
    return {
      questionId,
      summary: "This question has no answers yet.",
      keyPoints: [],
      consensus: null,
      generatedAt: new Date().toISOString()
    };
  }

  const systemPrompt = `You are an expert at summarizing Q&A discussions about colleges and education.
Your task is to provide a clear, helpful summary that captures the key insights from student discussions.
Be objective and highlight different perspectives when they exist.`;

  const userPrompt = `Summarize this Q&A thread:

**Question:** ${question.title}
${question.content}

**Answers (${answers.length} total):**
${answers.map((a, i) => `
Answer ${i + 1} (${a.upvotes || 0} upvotes${a.isVerified ? ", verified student" : ""}):
${a.content}
`).join("\n")}

Provide a JSON response with:
{
  "summary": "A 2-3 sentence summary of the main takeaways",
  "keyPoints": ["Array of 3-5 key points from the discussion"],
  "consensus": "If there's agreement, what is it? If opinions differ, briefly note the main perspectives",
  "bestAnswer": "Brief description of what the top-voted answer suggests"
}`;

  const result = await callGPT(systemPrompt, userPrompt, {
    responseFormat: "json",
    maxTokens: 800,
    temperature: 0.5
  });

  // Cache the summary
  await db.collection("ai_summaries").doc(`qa_${questionId}`).set({
    type: "qa_thread",
    referenceId: questionId,
    ...result,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  });

  return {
    questionId,
    ...result,
    generatedAt: new Date().toISOString()
  };
};

// ==========================================
// 2. COLLEGE REVIEW SUMMARIZATION
// ==========================================

/**
 * Summarize all reviews for a college
 */
export const summarizeCollegeReviews = async (collegeId) => {
  // Fetch college info
  const collegeDoc = await db.collection("colleges").doc(collegeId).get();
  
  if (!collegeDoc.exists) {
    throw new Error("College not found");
  }
  
  const college = { id: collegeDoc.id, ...collegeDoc.data() };
  
  // Fetch reviews
  const reviewsSnapshot = await db.collection("reviews")
    .where("collegeId", "==", collegeId)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  
  const reviews = reviewsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  if (reviews.length === 0) {
    return {
      collegeId,
      collegeName: college.name,
      summary: "This college has no reviews yet.",
      strengths: [],
      weaknesses: [],
      overallSentiment: "neutral",
      generatedAt: new Date().toISOString()
    };
  }

  // Calculate average ratings
  const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

  const systemPrompt = `You are an expert at analyzing college reviews and providing balanced, helpful summaries.
Focus on actionable insights that would help prospective students make informed decisions.
Be fair and objective, highlighting both positives and areas for improvement.`;

  const userPrompt = `Analyze and summarize these reviews for ${college.name}:

**College:** ${college.name}, ${college.city}, ${college.state}
**Average Rating:** ${avgRating.toFixed(1)}/5 from ${reviews.length} reviews

**Reviews:**
${reviews.slice(0, 30).map((r, i) => `
Review ${i + 1} (Rating: ${r.rating}/5):
Title: ${r.title || "No title"}
${r.content}
${r.pros?.length ? `Pros: ${r.pros.join(", ")}` : ""}
${r.cons?.length ? `Cons: ${r.cons.join(", ")}` : ""}
`).join("\n---\n")}

Provide a JSON response with:
{
  "summary": "A comprehensive 3-4 sentence summary of what students think about this college",
  "strengths": ["Array of 4-6 key strengths mentioned repeatedly"],
  "weaknesses": ["Array of 3-5 areas for improvement mentioned"],
  "academics": "Brief summary of academic quality feedback",
  "placements": "Brief summary of placement/career feedback",
  "campusLife": "Brief summary of campus life and culture",
  "infrastructure": "Brief summary of facilities and infrastructure",
  "overallSentiment": "positive|mixed|negative",
  "recommendationScore": "A score from 1-10 based on review sentiment",
  "idealFor": ["Types of students this college is best suited for"]
}`;

  const result = await callGPT(systemPrompt, userPrompt, {
    responseFormat: "json",
    maxTokens: 1200,
    temperature: 0.5
  });

  // Cache the summary
  await db.collection("ai_summaries").doc(`reviews_${collegeId}`).set({
    type: "college_reviews",
    referenceId: collegeId,
    collegeName: college.name,
    reviewCount: reviews.length,
    averageRating: avgRating,
    ...result,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours
  });

  return {
    collegeId,
    collegeName: college.name,
    reviewCount: reviews.length,
    averageRating: avgRating,
    ...result,
    generatedAt: new Date().toISOString()
  };
};

// ==========================================
// 3. COLLEGE RECOMMENDATIONS
// ==========================================

/**
 * Get personalized college recommendations based on student preferences
 */
export const getCollegeRecommendations = async (userId, preferences = {}) => {
  const {
    interestedCourses = [],
    preferredLocations = [],
    budgetRange = null,
    careerGoals = "",
    academicScore = null,
    priorities = [], // e.g., ["placements", "campus_life", "research"]
    collegeType = null // "government", "private", "deemed"
  } = preferences;

  // Fetch user's browsing history and interactions if available
  let userHistory = null;
  if (userId) {
    const userDoc = await db.collection("students").doc(userId).get();
    if (userDoc.exists) {
      userHistory = userDoc.data();
    }
  }

  // Fetch colleges with good ratings
  let collegesQuery = db.collection("colleges")
    .where("isActive", "==", true)
    .limit(100);
  
  const collegesSnapshot = await collegesQuery.get();
  const colleges = collegesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  if (colleges.length === 0) {
    return {
      recommendations: [],
      reasoning: "No colleges available in the database",
      generatedAt: new Date().toISOString()
    };
  }

  const systemPrompt = `You are a college counselor AI that helps Indian students find the best colleges for their needs.
You have deep knowledge of Indian colleges, their strengths, admission requirements, and career outcomes.
Provide personalized, practical recommendations based on the student's profile and preferences.`;

  const userPrompt = `Based on the following student profile and preferences, recommend the best colleges from the available options:

**Student Profile:**
${userHistory ? `
- Current education: ${userHistory.currentEducation || "Not specified"}
- Academic score: ${academicScore || userHistory.academicScore || "Not specified"}
- Interests: ${userHistory.interests?.join(", ") || "Not specified"}
` : "New user, limited history available"}

**Preferences:**
- Interested courses: ${interestedCourses.length ? interestedCourses.join(", ") : "Not specified"}
- Preferred locations: ${preferredLocations.length ? preferredLocations.join(", ") : "Open to all"}
- Budget: ${budgetRange ? `₹${budgetRange.min}-${budgetRange.max} per year` : "Not specified"}
- Career goals: ${careerGoals || "Not specified"}
- Priorities: ${priorities.length ? priorities.join(", ") : "Overall quality"}
- College type preference: ${collegeType || "No preference"}

**Available Colleges:**
${colleges.slice(0, 50).map(c => `
- ${c.name} (${c.city}, ${c.state})
  Type: ${c.type || "University"}, Ranking: #${c.ranking || "N/A"}
  Rating: ${c.averageRating?.toFixed(1) || "N/A"}/5
  Courses: ${c.courses?.slice(0, 5).join(", ") || "Various"}
  Placement rate: ${c.placementRate || "N/A"}%
  Avg package: ₹${c.placements?.average || "N/A"} LPA
`).join("\n")}

Provide a JSON response with:
{
  "recommendations": [
    {
      "collegeId": "ID from the list",
      "collegeName": "College name",
      "matchScore": 85,
      "matchReasons": ["Why this is a good match"],
      "concerns": ["Any potential concerns"],
      "highlights": ["Key highlights for this student"]
    }
  ],
  "overallAdvice": "General advice for this student's college search",
  "alternativeConsiderations": "Suggestions for expanding the search or other factors to consider"
}

Return top 5-8 recommendations ordered by match score.`;

  const result = await callGPT(systemPrompt, userPrompt, {
    responseFormat: "json",
    maxTokens: 1500,
    temperature: 0.6
  });

  // Enhance recommendations with full college data
  const enhancedRecommendations = result.recommendations.map(rec => {
    const college = colleges.find(c => c.id === rec.collegeId || c.name === rec.collegeName);
    return {
      ...rec,
      college: college || null
    };
  }).filter(rec => rec.college);

  return {
    recommendations: enhancedRecommendations,
    overallAdvice: result.overallAdvice,
    alternativeConsiderations: result.alternativeConsiderations,
    generatedAt: new Date().toISOString()
  };
};

// ==========================================
// 4. COMPARISON HIGHLIGHTS
// ==========================================

/**
 * Generate AI-powered comparison highlights between colleges
 */
export const generateComparisonHighlights = async (collegeIds) => {
  if (!collegeIds || collegeIds.length < 2) {
    throw new Error("At least 2 colleges required for comparison");
  }

  if (collegeIds.length > 5) {
    throw new Error("Maximum 5 colleges can be compared at once");
  }

  // Fetch college data
  const colleges = await Promise.all(
    collegeIds.map(async (id) => {
      const doc = await db.collection("colleges").doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    })
  );

  const validColleges = colleges.filter(c => c !== null);
  
  if (validColleges.length < 2) {
    throw new Error("Could not find enough valid colleges for comparison");
  }

  // Fetch reviews for each college
  const collegesWithReviews = await Promise.all(
    validColleges.map(async (college) => {
      const reviewsSnapshot = await db.collection("reviews")
        .where("collegeId", "==", college.id)
        .limit(10)
        .get();
      
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());
      return { ...college, recentReviews: reviews };
    })
  );

  const systemPrompt = `You are an expert college counselor helping students compare Indian colleges.
Provide objective, data-driven comparisons while acknowledging that the "best" college depends on individual priorities.
Highlight meaningful differences that would impact a student's decision.`;

  const userPrompt = `Compare these ${validColleges.length} colleges and provide insights:

${collegesWithReviews.map((c, i) => `
**College ${i + 1}: ${c.name}**
- Location: ${c.city}, ${c.state}
- Type: ${c.type || "University"}
- NIRF Ranking: #${c.ranking || "N/A"}
- Student Rating: ${c.averageRating?.toFixed(1) || "N/A"}/5 (${c.totalReviews || 0} reviews)
- Established: ${c.established || "N/A"}
- Total Students: ${c.totalStudents?.toLocaleString() || "N/A"}
- Placement Rate: ${c.placementRate || "N/A"}%
- Highest Package: ₹${c.placements?.highest || "N/A"} LPA
- Average Package: ₹${c.placements?.average || "N/A"} LPA
- Top Recruiters: ${c.topRecruiters?.slice(0, 5).join(", ") || "N/A"}
- Courses: ${c.courses?.slice(0, 5).join(", ") || "Various"}
- Recent Review Sentiment: ${c.recentReviews?.length ? "Available" : "Limited data"}
`).join("\n---\n")}

Provide a JSON response with:
{
  "executiveSummary": "2-3 sentence overview of how these colleges compare overall",
  "comparisonTable": {
    "academics": {
      "winner": "College name or 'Tie'",
      "analysis": "Brief comparison of academic quality"
    },
    "placements": {
      "winner": "College name or 'Tie'",
      "analysis": "Brief comparison of career outcomes"
    },
    "infrastructure": {
      "winner": "College name or 'Tie'",
      "analysis": "Brief comparison of facilities"
    },
    "valueForMoney": {
      "winner": "College name or 'Tie'",
      "analysis": "Brief ROI comparison"
    },
    "campusLife": {
      "winner": "College name or 'Tie'",
      "analysis": "Brief comparison of student experience"
    }
  },
  "collegeProfiles": [
    {
      "collegeName": "College name",
      "bestFor": ["Types of students this is ideal for"],
      "uniqueStrengths": ["What makes this college stand out"],
      "considerations": ["Things to keep in mind"]
    }
  ],
  "recommendations": {
    "forPlacements": "Which college and why",
    "forResearch": "Which college and why",
    "forCampusLife": "Which college and why",
    "forBudget": "Which college and why"
  },
  "finalVerdict": "Balanced conclusion acknowledging it depends on priorities"
}`;

  const result = await callGPT(systemPrompt, userPrompt, {
    responseFormat: "json",
    maxTokens: 1800,
    temperature: 0.5
  });

  // Cache comparison
  const cacheKey = `comparison_${collegeIds.sort().join("_")}`;
  await db.collection("ai_summaries").doc(cacheKey).set({
    type: "college_comparison",
    collegeIds,
    collegeNames: validColleges.map(c => c.name),
    ...result,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() // 72 hours
  });

  return {
    collegeIds,
    colleges: validColleges.map(c => ({ id: c.id, name: c.name })),
    ...result,
    generatedAt: new Date().toISOString()
  };
};

// ==========================================
// 5. CONTENT MODERATION
// ==========================================

/**
 * Check content for harmful/inappropriate material
 */
export const moderateContent = async (content, contentType = "general") => {
  if (!env.aiModerationEnabled) {
    return {
      approved: true,
      reason: "Moderation disabled",
      flags: []
    };
  }

  const aiStatus = isAIAvailable();
  if (!aiStatus.available) {
    // If AI is not available, use basic keyword filtering
    return basicModeration(content);
  }

  const systemPrompt = `You are a content moderator for CollegeVerse, an educational platform for Indian students.
Your job is to identify content that violates community guidelines while allowing genuine opinions and criticism.

Flag content that contains:
1. Hate speech, discrimination, or slurs
2. Personal attacks or harassment
3. Spam or promotional content
4. Misleading or false information that could harm students
5. Explicit or adult content
6. Threats or incitement to violence
7. Personal information (phone numbers, addresses, etc.)

DO NOT flag:
- Negative but honest reviews/opinions
- Constructive criticism
- Questions about controversial but legitimate topics
- Mild frustration or disappointment`;

  const userPrompt = `Moderate this ${contentType} content from CollegeVerse:

"${content}"

Provide a JSON response with:
{
  "approved": true/false,
  "confidence": 0.0-1.0,
  "flags": ["Array of specific concerns if any"],
  "category": "clean|mild|moderate|severe",
  "reason": "Brief explanation if not approved",
  "suggestedAction": "none|warn|edit|remove|ban",
  "editSuggestion": "If editable, suggest how to fix (or null)"
}`;

  try {
    const result = await callGPT(systemPrompt, userPrompt, {
      responseFormat: "json",
      maxTokens: 400,
      temperature: 0.2 // Low temperature for consistent moderation
    });

    // Log moderation results for review
    await db.collection("moderation_logs").add({
      content: content.substring(0, 500), // Truncate for storage
      contentType,
      result,
      timestamp: new Date().toISOString()
    });

    return result;
  } catch (error) {
    console.error("AI moderation failed, falling back to basic:", error);
    return basicModeration(content);
  }
};

/**
 * Basic keyword-based moderation fallback
 */
const basicModeration = (content) => {
  const lowerContent = content.toLowerCase();
  
  const severePatterns = [
    /\b(kill|murder|rape|terrorist)\b/i,
    /\b(n[i1]gg[ae]r|f[a4]gg[o0]t)\b/i,
  ];
  
  const moderatePatterns = [
    /\b(stupid|idiot|dumb|loser)\s+(college|university|student)/i,
    /\b(scam|fraud|fake|cheat)\b/i,
    /\b(\d{10})\b/, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
  ];

  const mildPatterns = [
    /\b(damn|hell|crap)\b/i,
  ];

  for (const pattern of severePatterns) {
    if (pattern.test(lowerContent)) {
      return {
        approved: false,
        confidence: 0.9,
        flags: ["Severe violation detected"],
        category: "severe",
        reason: "Content contains severely inappropriate material",
        suggestedAction: "remove"
      };
    }
  }

  for (const pattern of moderatePatterns) {
    if (pattern.test(lowerContent)) {
      return {
        approved: false,
        confidence: 0.7,
        flags: ["Moderate concern detected"],
        category: "moderate",
        reason: "Content may violate guidelines",
        suggestedAction: "review"
      };
    }
  }

  for (const pattern of mildPatterns) {
    if (pattern.test(lowerContent)) {
      return {
        approved: true,
        confidence: 0.8,
        flags: ["Mild language"],
        category: "mild",
        reason: "Content contains mild language but is acceptable",
        suggestedAction: "none"
      };
    }
  }

  return {
    approved: true,
    confidence: 0.95,
    flags: [],
    category: "clean",
    reason: "Content appears appropriate",
    suggestedAction: "none"
  };
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get cached AI summary if available and not expired
 */
export const getCachedSummary = async (type, referenceId) => {
  const cacheKey = `${type}_${referenceId}`;
  const doc = await db.collection("ai_summaries").doc(cacheKey).get();
  
  if (!doc.exists) {
    return null;
  }
  
  const data = doc.data();
  
  // Check if expired
  if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
    return null;
  }
  
  return data;
};

/**
 * Check AI service status
 */
export const getAIStatus = () => {
  const status = isAIAvailable();
  return {
    ...status,
    model: env.openaiModel,
    moderationEnabled: env.aiModerationEnabled
  };
};

export default {
  summarizeQAThread,
  summarizeCollegeReviews,
  getCollegeRecommendations,
  generateComparisonHighlights,
  moderateContent,
  getCachedSummary,
  getAIStatus
};
