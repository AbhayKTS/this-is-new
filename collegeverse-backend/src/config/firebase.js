import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
let serviceAccount;

// Check for service account file or environment variable
const serviceAccountPath = join(__dirname, "../../firebase-service-account.json");

if (existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  console.error("⚠️  Firebase service account not found!");
  console.error("   Please either:");
  console.error("   1. Place firebase-service-account.json in collegeverse-backend/");
  console.error("   2. Set FIREBASE_SERVICE_ACCOUNT environment variable");
  console.error("");
  console.error("   To get service account:");
  console.error("   → Firebase Console → Project Settings → Service Accounts → Generate New Private Key");
  process.exit(1);
}

// Initialize the app
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Get Firestore instance
const db = admin.firestore();
const auth = admin.auth();

// Collection References
const collections = {
  STUDENTS: "students",
  COLLEGES: "colleges",
  SENIORS_VERIFICATION: "seniors_verification",
  REVIEWS: "reviews",
  QA_QUESTIONS: "qa_questions",
  QA_ANSWERS: "qa_answers",
  RATINGS: "ratings",
  COMPARISONS: "comparisons",
  LEADERBOARD_SCORES: "leaderboard_scores",
  BADGES: "badges",
  USER_BADGES: "user_badges",
  COMMUNITIES: "communities",
  COMMUNITY_POSTS: "community_posts",
};

export { admin, db, auth, collections };
export default db;
