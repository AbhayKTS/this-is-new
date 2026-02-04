# CollegeVerse – Student-Centric College Guidance Platform

> **Where Every Student Gets Trusted Guidance** 🎓

## 🎯 Vision

CollegeVerse is a **verified and structured platform** where prospective students can interact with verified college seniors to get **honest, trustworthy guidance** about colleges. Unlike existing platforms that rely on advertisements, rankings, or unverified online opinions, CollegeVerse ensures authenticity through **College ID verification** for seniors.

## 🚀 Problem We're Solving

Choosing the right college is one of the most important decisions for a student. Currently, freshers depend on:
- Advertisements that show only the positive side
- Rankings that don't reflect real student experience  
- Random online opinions that aren't verified
- No structured way to compare colleges on real factors

**CollegeVerse bridges this gap** by providing a dedicated platform with verified, college-specific, and honest information.

## ✨ Key Features

### 1. Senior Verification System 🛡️
- **College ID verification** for seniors
- Verified badge displayed on profiles
- Only verified seniors can rate colleges
- Builds trust in the guidance provided

### 2. College-wise Communities 👥
- Dedicated community for each college
- Connect with current students and alumni
- Share experiences and get real insights
- Moderated discussions for quality

### 3. Structured Q&A System ❓
- Ask questions about any college
- Get answers from verified seniors
- Categories: Academics, Placements, Hostel, Campus, Fees
- Upvote helpful answers
- Accept best answers

### 4. College Comparison Tool 📊
- Compare up to 4 colleges side-by-side
- Real ratings from verified students
- Categories: Academics, Placements, Hostel, Campus Culture, Infrastructure
- Visual comparison with bar charts

### 5. Reputation & Badge System 🏆
- Earn reputation points for helpful contributions
- Badges: Verified Senior, Helpful Contributor, Trusted Guide, Community Champion
- Gamification to encourage quality answers

### 6. Authentic College Ratings ⭐
- Only verified seniors can rate
- Multiple rating categories
- Written reviews with real experiences
- Aggregated scores for easy comparison

### 7. Leaderboard & Rankings 📈
- National and domain-wise rankings
- Track student achievements
- XP-based scoring system

### 8. MicroGigs Marketplace 💼
- Skill-based opportunities
- Earn credits and rewards
- Connect with recruiters

## 🛠️ Tech Stack

### Frontend
- **Next.js** - React framework with SSR
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Node.js + Express** - API server
- **Supabase** - Database & Authentication
- **Zod** - Schema validation

## 📂 Project Structure

```
collegeverse/
├── collegeverse-backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── validators/       # Zod schemas
│   │   ├── middleware/       # Express middleware
│   │   └── lib/              # Supabase client
│   ├── db.js                 # Database connection
│   └── index.js              # Server entry point
│
├── collegeverse-frontend/
│   ├── components/           # React components
│   ├── pages/                # Next.js pages
│   │   ├── communities.js    # College communities
│   │   ├── qa.js             # Q&A forum
│   │   ├── verification.js   # Senior verification
│   │   ├── colleges/
│   │   │   ├── index.js      # College dashboard
│   │   │   └── compare.js    # Compare colleges
│   │   └── ...
│   ├── lib/                  # Utilities
│   └── styles/               # Global styles
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/AbhayKTS/collegeverse-sparkle.git
cd collegeverse-sparkle
```

2. **Backend Setup**
```bash
cd collegeverse-backend
npm install

# Create .env file with:
# SUPABASE_URL=your-supabase-url
# SUPABASE_KEY=your-service-role-key
# PORT=4000

npm run dev
```

3. **Frontend Setup**
```bash
cd collegeverse-frontend
npm install

# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

npm run dev
```

4. **Open in browser**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 📱 API Endpoints

### Verification
- `POST /api/verification` - Submit verification request
- `GET /api/verification/status/:userId` - Check verification status
- `PATCH /api/verification/:id` - Admin: Approve/Reject

### Communities
- `GET /api/communities` - List communities
- `POST /api/communities` - Create community
- `POST /api/communities/:id/join` - Join community

### Q&A
- `GET /api/qa/questions` - List questions
- `POST /api/qa/questions` - Ask question
- `POST /api/qa/questions/:id/answers` - Post answer
- `POST /api/qa/vote/:type/:id` - Upvote

### Colleges
- `GET /api/colleges` - List colleges
- `GET /api/colleges/compare?ids=a,b,c` - Compare colleges
- `POST /api/colleges/:id/ratings` - Rate college

### Badges
- `GET /api/badges/definitions` - All badge types
- `GET /api/badges/user/:userId` - User's badges

## 🎯 Target Users

1. **College Freshers** - Get guidance for college selection
2. **Prospective Students** - Compare and research colleges
3. **Verified College Seniors** - Share experiences and help juniors
4. **College Administrators** - Manage college profiles

## 🔮 Future Roadmap

- [ ] AI-based college recommendations
- [ ] One-to-one mentorship program
- [ ] Mobile application
- [ ] Integration with placement data
- [ ] Live Q&A sessions with seniors
- [ ] College virtual tours

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 📧 Contact

- **Project Lead**: Abhay KTS
- **GitHub**: [@AbhayKTS](https://github.com/AbhayKTS)

---

**CollegeVerse** - *Verified Guidance for Smarter College Choices* 🎓
