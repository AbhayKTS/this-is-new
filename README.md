# CollegeVerse – Phase 1

## Overview
Phase 1 establishes the foundational codebase for CollegeVerse: authentication (email/phone OTP via Supabase), a simplified user profile with CRUD, and initial styling with Tailwind. This baseline lets us iterate on dashboards, micro-gigs, and leaderboard features next.

## Included (Phase 1)
- Frontend scaffold (Next.js + Tailwind)
- Global styles (`styles/globals.css`)
- Auth provider (Supabase session management, OTP channel selection)
- Login form with email/phone OTP support
- Simplified profile page (fetch/update via API proxy)
- Backend Express server (users CRUD against Supabase `users` table)
- Environment variable usage (`SUPABASE_URL`, `SUPABASE_KEY`, `PORT`)

## Not Yet Implemented (Deferred)
- Certificates upload & verification workflows
- Leaderboard, MicroGigs, advanced dashboard UI
- GitHub activity auto-sync
- Robust test suite & CI pipeline

## Getting Started
1. Create `.env` in backend with:
   - `SUPABASE_URL=...`
   - `SUPABASE_KEY=...` (service role key)
   - `PORT=4000`
2. Start backend:
   - `node collegeverse-backend/index.js` (or `npm run dev` if script added)
3. Start frontend:
   - `npm run dev` (from `collegeverse-frontend`)
4. Visit `http://localhost:3000/student/profile` after logging in.

## Profile Flow
- After OTP login, profile loads via `/api/users?email=...` proxy.
- Missing required fields show a checklist; saving pushes POST/PUT to backend.

## Auth & OTP
- Email magic link + phone SMS (E.164 formatted) supported.
- Twilio sender configuration required for phone OTP delivery (Trial accounts must verify recipient numbers).

## Tagging
Initial annotated tag `phase1` marks this baseline.

## Next Steps (Phase 2 Candidates)
- Add unit/integration tests
- Implement leaderboard & micro-gigs modules
- Enhance error observability (logging middleware)
- Add GitHub activity importer

---
Generated README for initial Phase 1 push.
