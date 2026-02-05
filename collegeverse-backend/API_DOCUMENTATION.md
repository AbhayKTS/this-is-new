# CollegeVerse Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All authenticated endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

---

## 1. Authentication APIs

### Register User
```
POST /api/auth/register
```
**Body:**
```json
{
  "email": "user@college.edu",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+1234567890"
}
```
**Response:**
- 201: User registered successfully
- 400: Validation error
- 409: Email already exists

### Login (Validate Token)
```
POST /api/auth/login
```
**Headers:** Requires Firebase ID token
**Response:** User data with role and permissions

### Get Current User
```
GET /api/auth/me
```
**Headers:** Requires authentication
**Response:** Full user profile

### Update Profile
```
PUT /api/auth/profile
```
**Headers:** Requires authentication
**Body:**
```json
{
  "name": "Updated Name",
  "bio": "About me",
  "interests": ["technology", "music"]
}
```

### Check Email Type
```
POST /api/auth/check-email
```
**Body:**
```json
{
  "email": "user@college.edu"
}
```
**Response:** Whether email is college email and access level

### Save/Unsave College
```
POST /api/auth/save-college
DELETE /api/auth/save-college/:collegeId
GET /api/auth/saved-colleges
```

---

## 2. Verification APIs

### Submit Verification (College Email Required)
```
POST /api/verification
```
**Headers:** Requires authentication + college email
**Body:**
```json
{
  "user_id": "uid",
  "college_id": "college-slug",
  "college_name": "College Name",
  "graduation_year": 2024,
  "id_proof_url": "https://...",
  "branch": "Computer Science"
}
```

### Get My Verification Status
```
GET /api/verification/status/me
```
**Headers:** Requires authentication

### Get Verified Seniors (Public)
```
GET /api/verification/seniors?collegeName=CollegeName
```

### Admin: List Pending Verifications
```
GET /api/verification/pending
```
**Headers:** Requires admin role

### Admin: Approve/Reject Verification
```
PATCH /api/verification/:id
```
**Headers:** Requires admin role
**Body:**
```json
{
  "status": "approved",
  "reviewer_notes": "Verified successfully"
}
```

---

## 3. College APIs

### List Colleges (Public)
```
GET /api/colleges?page=1&pageSize=20&search=IIT&location=Delhi&type=government&sortBy=rating
```

### Search Colleges
```
GET /api/colleges/search?q=engineering&limit=10
```

### Get Trending Colleges
```
GET /api/colleges/trending?limit=10
```

### Compare Colleges
```
GET /api/colleges/compare?ids=college1,college2,college3
```

### Get College Details
```
GET /api/colleges/:id
```

### Get College Ratings
```
GET /api/colleges/:id/ratings
```

### Submit Rating (Verified Senior Only)
```
POST /api/colleges/:id/ratings
```
**Headers:** Requires verified senior
**Body:**
```json
{
  "user_id": "uid",
  "academics": 4.5,
  "placements": 4.0,
  "hostel": 3.5,
  "campusCulture": 4.0,
  "infrastructure": 4.5,
  "valueForMoney": 3.5,
  "faculty": 4.0,
  "canteen": 3.0,
  "review": "Great college overall!"
}
```

### Admin: Create College
```
POST /api/colleges
```
**Headers:** Requires admin role

### Admin: Update College
```
PUT /api/colleges/:id
```
**Headers:** Requires admin role

### Admin: Delete College
```
DELETE /api/colleges/:id
```
**Headers:** Requires admin role

### Admin: Get College Stats
```
GET /api/colleges/:id/stats
```
**Headers:** Requires admin role

---

## 4. Q&A APIs

### Get Categories (Public)
```
GET /api/qa/categories
```

### List Questions (Public)
```
GET /api/qa/questions?page=1&pageSize=20&collegeId=xxx&category=placements&sortBy=newest
```
Sort options: `newest`, `popular`, `unanswered`, `mostVoted`

### Get Question Details
```
GET /api/qa/questions/:id
```

### Create Question (Authenticated)
```
POST /api/qa/questions
```
**Headers:** Requires authentication
**Body:**
```json
{
  "user_id": "uid",
  "title": "Question title",
  "body": "Detailed question...",
  "category": "placements",
  "tags": ["placement", "package"],
  "college_id": "college-slug"
}
```

### Get Answers
```
GET /api/qa/questions/:questionId/answers
```

### Post Answer (Authenticated)
```
POST /api/qa/questions/:questionId/answers
```
**Headers:** Requires authentication
**Body:**
```json
{
  "user_id": "uid",
  "body": "Answer content..."
}
```

### Vote (Authenticated)
```
POST /api/qa/vote/:type/:id
```
**Headers:** Requires authentication
**Params:** type = `question` or `answer`
**Body:**
```json
{
  "user_id": "uid"
}
```

### Accept Answer (Question Owner)
```
POST /api/qa/answers/:answerId/accept
```
**Headers:** Requires authentication
**Body:**
```json
{
  "user_id": "uid"
}
```

---

## 5. Leaderboard APIs

### Get Global Leaderboard (Public)
```
GET /api/leaderboard?page=1&pageSize=20&timeframe=all
```
Timeframe options: `all`, `monthly`, `weekly`

### Get College Leaderboard
```
GET /api/leaderboard/college/:collegeId
```

### Get My Rank (Authenticated)
```
GET /api/leaderboard/me?collegeId=xxx
```
**Headers:** Requires authentication

### Admin: Recalculate Leaderboard
```
POST /api/leaderboard/recalculate
```
**Headers:** Requires admin role

---

## 6. Badge APIs

### Get Badge Definitions (Public)
```
GET /api/badges/definitions
```

### Get Top Contributors (Public)
```
GET /api/badges/top-contributors?page=1&pageSize=20&collegeId=xxx
```

### Get User Badges (Public)
```
GET /api/badges/user/:userId
```

### Get User Reputation (Public)
```
GET /api/badges/user/:userId/reputation
```

### Get My Badges (Authenticated)
```
GET /api/badges/me
```
**Headers:** Requires authentication

### Admin: Award Badge
```
POST /api/badges/award
```
**Headers:** Requires admin role
**Body:**
```json
{
  "userId": "uid",
  "badgeType": "helpful_contributor"
}
```

### Admin: Initialize Badges
```
POST /api/badges/initialize
```
**Headers:** Requires admin role

---

## 7. Community APIs

### List Communities (Public)
```
GET /api/communities?page=1&pageSize=20&collegeId=xxx&search=query
```

### Get Community Details
```
GET /api/communities/:id
```

### Get Community Members
```
GET /api/communities/:id/members
```

### Get Community Posts
```
GET /api/communities/:id/posts
```

### Get My Communities (Authenticated)
```
GET /api/communities/my/list
```
**Headers:** Requires authentication

### Create Community (College Email Required)
```
POST /api/communities
```
**Headers:** Requires authentication + college email
**Body:**
```json
{
  "name": "IIT Delhi Community",
  "college_id": "iit-delhi",
  "description": "Community description",
  "cover_image_url": "https://..."
}
```

### Join Community (Authenticated)
```
POST /api/communities/:id/join
```
**Headers:** Requires authentication

### Leave Community (Authenticated)
```
POST /api/communities/:id/leave
```
**Headers:** Requires authentication

### Create Post (Authenticated)
```
POST /api/communities/:id/posts
```
**Headers:** Requires authentication
**Body:**
```json
{
  "content": "Post content..."
}
```

### Check Membership (Authenticated)
```
GET /api/communities/:id/membership
```
**Headers:** Requires authentication

---

## User Roles & Permissions

| Role | Access Level |
|------|--------------|
| `explorer` | Limited - can browse, view limited data |
| `student` | Full access to most features |
| `senior` | Verified senior - can rate colleges, trusted answers |
| `admin` | Full admin access |

---

## 9. AI-Powered Features APIs

### Get AI Service Status
```
GET /api/ai/status
```
**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "model": "gpt-4o",
    "moderationEnabled": true
  }
}
```

### Summarize Q&A Thread
```
GET /api/ai/summarize/qa/:questionId
```
**Query Params:**
- `refresh`: `true` to force regenerate (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "questionId": "abc123",
    "summary": "The main consensus is...",
    "keyPoints": ["Point 1", "Point 2", "Point 3"],
    "consensus": "Most answers agree that...",
    "bestAnswer": "The top answer suggests...",
    "generatedAt": "2026-02-05T10:00:00Z"
  },
  "cached": true
}
```

### Summarize College Reviews
```
GET /api/ai/summarize/reviews/:collegeId
```
**Query Params:**
- `refresh`: `true` to force regenerate (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "collegeId": "college123",
    "collegeName": "IIT Bombay",
    "reviewCount": 156,
    "averageRating": 4.2,
    "summary": "Students praise the academic rigor...",
    "strengths": ["Excellent faculty", "Strong placements"],
    "weaknesses": ["High pressure environment"],
    "academics": "Top-tier academic quality...",
    "placements": "95% placement rate with top companies...",
    "campusLife": "Vibrant but competitive...",
    "infrastructure": "World-class facilities...",
    "overallSentiment": "positive",
    "recommendationScore": 8.5,
    "idealFor": ["Research-oriented students", "Career-focused individuals"],
    "generatedAt": "2026-02-05T10:00:00Z"
  },
  "cached": true
}
```

### Get College Recommendations
```
POST /api/ai/recommendations
```
**Body:**
```json
{
  "interestedCourses": ["Computer Science", "Data Science"],
  "preferredLocations": ["Maharashtra", "Karnataka"],
  "budgetRange": { "min": 100000, "max": 500000 },
  "careerGoals": "Software Engineer at a tech company",
  "academicScore": 85,
  "priorities": ["placements", "research"],
  "collegeType": "private"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "collegeId": "college123",
        "collegeName": "ABC University",
        "matchScore": 92,
        "matchReasons": ["Strong CS program", "High placement rate"],
        "concerns": ["High fees"],
        "highlights": ["Google recruits here", "Excellent labs"],
        "college": { ... full college data ... }
      }
    ],
    "overallAdvice": "Based on your profile...",
    "alternativeConsiderations": "You might also consider...",
    "generatedAt": "2026-02-05T10:00:00Z"
  }
}
```

### Generate Comparison Highlights
```
POST /api/ai/compare
```
**Body:**
```json
{
  "collegeIds": ["college1", "college2", "college3"]
}
```
**Query Params:**
- `refresh`: `true` to force regenerate (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "collegeIds": ["college1", "college2", "college3"],
    "colleges": [{ "id": "...", "name": "..." }],
    "executiveSummary": "Overall comparison shows...",
    "comparisonTable": {
      "academics": { "winner": "College A", "analysis": "..." },
      "placements": { "winner": "College B", "analysis": "..." },
      "infrastructure": { "winner": "Tie", "analysis": "..." },
      "valueForMoney": { "winner": "College C", "analysis": "..." },
      "campusLife": { "winner": "College A", "analysis": "..." }
    },
    "collegeProfiles": [
      {
        "collegeName": "College A",
        "bestFor": ["Research students"],
        "uniqueStrengths": ["Nobel laureate faculty"],
        "considerations": ["Competitive environment"]
      }
    ],
    "recommendations": {
      "forPlacements": "College B because...",
      "forResearch": "College A because...",
      "forCampusLife": "College A because...",
      "forBudget": "College C because..."
    },
    "finalVerdict": "The best choice depends on your priorities...",
    "generatedAt": "2026-02-05T10:00:00Z"
  },
  "cached": true
}
```

### Content Moderation
```
POST /api/ai/moderate
```
**Headers:** Requires authentication
**Body:**
```json
{
  "content": "Text to moderate",
  "contentType": "review"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "approved": true,
    "confidence": 0.95,
    "flags": [],
    "category": "clean",
    "reason": "Content appears appropriate",
    "suggestedAction": "none",
    "editSuggestion": null
  }
}
```

### Quick Content Check
```
POST /api/ai/check-content
```
**Headers:** Requires authentication
**Body:**
```json
{
  "content": "Text to check",
  "contentType": "general"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "approved": true,
    "category": "clean",
    "flags": []
  }
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## Rate Limiting

- General: 100 requests per 15 minutes
- Auth: 20 requests per 15 minutes
- Write operations: 50 requests per 15 minutes
- AI Endpoints: 10 requests per minute (standard), 5 requests per minute (heavy operations)

## Environment Variables

### Required
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase API key

### Optional - AI Features
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `OPENAI_MODEL` - Model to use (default: gpt-4o)
- `OPENAI_MAX_TOKENS` - Max tokens per request (default: 1000)
- `AI_ENABLED` - Enable/disable AI features (default: true)
- `AI_MODERATION_ENABLED` - Enable/disable content moderation (default: true)
