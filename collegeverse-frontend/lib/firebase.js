import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

// ============================================
// HELPER: Detect if email is college email
// ============================================
const COLLEGE_EMAIL_DOMAINS = [
  // Add known college domains here
  ".edu",
  ".edu.in",
  ".ac.in",
  ".college.edu",
  // Specific colleges
  "iitb.ac.in",
  "iitd.ac.in",
  "iitm.ac.in",
  "bits-pilani.ac.in",
  "vit.ac.in",
  "srm.edu.in",
  "manipal.edu",
  "amity.edu",
  "bennett.edu.in",
  "lpu.in",
  // Add more as needed
];

export const isCollegeEmail = (email) => {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  
  return COLLEGE_EMAIL_DOMAINS.some(collegeDomain => 
    domain.endsWith(collegeDomain.toLowerCase())
  );
};

// ============================================
// USER ROLES & ACCESS LEVELS
// ============================================
export const USER_ROLES = {
  GUEST: "guest",           // Not logged in
  EXPLORER: "explorer",     // Logged in with personal email (limited access)
  STUDENT: "student",       // Logged in with college email (full access)
  SENIOR: "senior",         // Verified senior (can answer, rate, etc.)
  ADMIN: "admin",           // Platform admin
};

export const ACCESS_LEVELS = {
  // What each role can do
  [USER_ROLES.GUEST]: {
    canViewColleges: true,
    canCompareColleges: true,
    canViewPublicReviews: true,
    canAskQuestions: false,
    canAnswerQuestions: false,
    canRateColleges: false,
    canJoinCommunities: false,
    canViewLeaderboard: true,
    canVerifyAsSenior: false,
  },
  [USER_ROLES.EXPLORER]: {
    canViewColleges: true,
    canCompareColleges: true,
    canViewPublicReviews: true,
    canAskQuestions: false,      // Limited - can't ask
    canAnswerQuestions: false,   // Limited - can't answer
    canRateColleges: false,      // Limited - can't rate
    canJoinCommunities: false,   // Limited - can't join
    canViewLeaderboard: true,
    canVerifyAsSenior: false,
    canSaveColleges: true,       // Can save colleges to favorites
    canGetRecommendations: true, // Can use AI recommendations
  },
  [USER_ROLES.STUDENT]: {
    canViewColleges: true,
    canCompareColleges: true,
    canViewPublicReviews: true,
    canAskQuestions: true,       // Full access
    canAnswerQuestions: true,    // Can answer (limited weight)
    canRateColleges: false,      // Only seniors can rate
    canJoinCommunities: true,    // Full access
    canViewLeaderboard: true,
    canVerifyAsSenior: true,     // Can request verification
  },
  [USER_ROLES.SENIOR]: {
    canViewColleges: true,
    canCompareColleges: true,
    canViewPublicReviews: true,
    canAskQuestions: true,
    canAnswerQuestions: true,    // Answers have higher weight
    canRateColleges: true,       // Can submit ratings
    canJoinCommunities: true,
    canViewLeaderboard: true,
    canVerifyAsSenior: false,    // Already verified
    canMentor: true,             // Can become a mentor
  },
  [USER_ROLES.ADMIN]: {
    // Admin has all permissions
    canViewColleges: true,
    canCompareColleges: true,
    canViewPublicReviews: true,
    canAskQuestions: true,
    canAnswerQuestions: true,
    canRateColleges: true,
    canJoinCommunities: true,
    canViewLeaderboard: true,
    canVerifyAsSenior: false,
    canManageUsers: true,
    canManageColleges: true,
    canApproveVerifications: true,
    canModerateContent: true,
  },
};

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Register a new user
 * @param {string} email 
 * @param {string} password 
 * @param {object} userData - { name, phone, etc. }
 */
export const registerUser = async (email, password, userData = {}) => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Determine role based on email type
    const collegeEmail = isCollegeEmail(email);
    const role = collegeEmail ? USER_ROLES.STUDENT : USER_ROLES.EXPLORER;
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: email.toLowerCase(),
      name: userData.name || "",
      phone: userData.phone || "",
      role: role,
      isCollegeEmail: collegeEmail,
      collegeId: null,           // Will be set after college verification
      collegeName: null,
      branch: userData.branch || null,
      year: userData.year || null,
      
      // Profile
      avatar: null,
      bio: "",
      
      // Stats
      reputation: 0,
      questionsAsked: 0,
      answersGiven: 0,
      reviewsWritten: 0,
      
      // Status
      emailVerified: false,
      isVerifiedSenior: false,
      verificationStatus: null,   // null | 'pending' | 'approved' | 'rejected'
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, "students", user.uid), userDoc);
    
    // Send email verification
    await sendEmailVerification(user);
    
    return {
      success: true,
      user: userCredential.user,
      role: role,
      isCollegeEmail: collegeEmail,
      message: collegeEmail 
        ? "Account created! Please verify your college email to unlock all features."
        : "Account created as Explorer. Login with a college email to unlock full features.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, "students", user.uid));
    
    if (!userDoc.exists()) {
      // Create user doc if it doesn't exist (legacy users)
      const collegeEmail = isCollegeEmail(email);
      const role = collegeEmail ? USER_ROLES.STUDENT : USER_ROLES.EXPLORER;
      
      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        email: email.toLowerCase(),
        role: role,
        isCollegeEmail: collegeEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
      
      return {
        success: true,
        user: user,
        role: role,
        isCollegeEmail: collegeEmail,
        accessLevel: ACCESS_LEVELS[role],
      };
    }
    
    const userData = userDoc.data();
    
    // Update last login
    await updateDoc(doc(db, "students", user.uid), {
      lastLoginAt: serverTimestamp(),
    });
    
    return {
      success: true,
      user: user,
      userData: userData,
      role: userData.role,
      isCollegeEmail: userData.isCollegeEmail,
      accessLevel: ACCESS_LEVELS[userData.role],
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get current user with role and access level
 */
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, "students", user.uid));
  if (!userDoc.exists()) return null;
  
  const userData = userDoc.data();
  return {
    ...user,
    ...userData,
    accessLevel: ACCESS_LEVELS[userData.role],
  };
};

/**
 * Subscribe to auth state changes
 * @param {function} callback 
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "students", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      callback({
        user,
        userData,
        role: userData?.role || USER_ROLES.EXPLORER,
        accessLevel: ACCESS_LEVELS[userData?.role || USER_ROLES.EXPLORER],
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Reset password
 * @param {string} email 
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent!" };
  } catch (error) {
    return { success: false, message: getAuthErrorMessage(error.code) };
  }
};

/**
 * Login with Google
 * @param {string} intendedRole - optional role hint (student/college/recruiter)
 */
export const loginWithGoogle = async (intendedRole) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email;
    const collegeEmail = isCollegeEmail(email);

    // Check if user doc already exists
    const userDocRef = doc(db, "students", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Determine role
      let role;
      if (intendedRole === "college") role = "college";
      else if (intendedRole === "recruiter") role = "recruiter";
      else role = collegeEmail ? USER_ROLES.STUDENT : USER_ROLES.EXPLORER;

      // Create new user document
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email.toLowerCase(),
        name: user.displayName || "",
        displayName: user.displayName || "",
        avatar: user.photoURL || null,
        phone: user.phoneNumber || "",
        role: role,
        isCollegeEmail: collegeEmail,
        collegeId: null,
        collegeName: null,
        bio: "",
        reputation: 0,
        questionsAsked: 0,
        answersGiven: 0,
        reviewsWritten: 0,
        emailVerified: user.emailVerified,
        isVerifiedSenior: false,
        verificationStatus: null,
        authProvider: "google",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      return {
        success: true,
        user: user,
        role: role,
        isNewUser: true,
        isCollegeEmail: collegeEmail,
      };
    }

    // Existing user — update last login
    const userData = userDoc.data();
    await updateDoc(userDocRef, {
      lastLoginAt: serverTimestamp(),
      avatar: user.photoURL || userData.avatar || null,
    });

    return {
      success: true,
      user: user,
      userData: userData,
      role: userData.role,
      isNewUser: false,
      isCollegeEmail: userData.isCollegeEmail,
      accessLevel: ACCESS_LEVELS[userData.role],
    };
  } catch (error) {
    console.error("Google login error:", error);
    if (error.code === "auth/popup-closed-by-user") {
      return { success: false, message: "Sign-in popup was closed." };
    }
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code) || error.message,
    };
  }
};

/**
 * Upgrade explorer to student (when they verify college email)
 * @param {string} uid 
 * @param {string} collegeId 
 * @param {string} collegeName 
 */
export const upgradeToStudent = async (uid, collegeId, collegeName) => {
  try {
    await updateDoc(doc(db, "students", uid), {
      role: USER_ROLES.STUDENT,
      collegeId: collegeId,
      collegeName: collegeName,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Upgrade student to senior (after verification approval)
 * @param {string} uid 
 */
export const upgradeToSenior = async (uid) => {
  try {
    await updateDoc(doc(db, "students", uid), {
      role: USER_ROLES.SENIOR,
      isVerifiedSenior: true,
      verificationStatus: "approved",
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getAuthErrorMessage = (errorCode) => {
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Please login instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "Email/password accounts are not enabled.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection.",
  };
  return messages[errorCode] || "An error occurred. Please try again.";
};

// Export Firebase instances
export { auth, db };
export default app;
