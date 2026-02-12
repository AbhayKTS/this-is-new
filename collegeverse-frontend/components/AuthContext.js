import { createContext, useContext, useEffect, useState } from "react";
import { 
  auth, 
  db,
  onAuthChange, 
  loginUser, 
  registerUser, 
  logoutUser,
  resetPassword,
  loginWithGoogle,
  isCollegeEmail,
  USER_ROLES,
  ACCESS_LEVELS
} from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authState) => {
      if (authState) {
        setUser(authState.user);
        setUserData(authState.userData);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        setError(result.message);
        return result;
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, additionalData = {}) => {
    setError(null);
    setLoading(true);
    try {
      const result = await registerUser(email, password, additionalData);
      if (!result.success) {
        setError(result.message);
        return result;
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setUserData(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    return await resetPassword(email);
  };

  const googleLogin = async (intendedRole) => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginWithGoogle(intendedRole);
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, "students", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
    }
  };

  // Computed properties
  const isAuthenticated = !!user;
  const role = userData?.role || USER_ROLES.GUEST;
  const accessLevel = ACCESS_LEVELS[role] || ACCESS_LEVELS[USER_ROLES.GUEST];
  const isExplorer = role === USER_ROLES.EXPLORER;
  const isStudent = role === USER_ROLES.STUDENT;
  const isSenior = role === USER_ROLES.SENIOR;
  const isAdmin = role === USER_ROLES.ADMIN;
  const isVerifiedSenior = userData?.isVerifiedSenior || false;
  const hasCollegeEmail = userData?.isCollegeEmail || false;

  // Permission checks
  const can = (permission) => {
    return accessLevel[permission] || false;
  };

  const value = {
    // State
    user,
    userData,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    role,
    accessLevel,
    isExplorer,
    isStudent,
    isSenior,
    isAdmin,
    isVerifiedSenior,
    hasCollegeEmail,
    
    // Methods
    login,
    register,
    logout,
    forgotPassword,
    googleLogin,
    refreshUserData,
    can,
    isCollegeEmail,
    
    // Constants
    USER_ROLES,
    ACCESS_LEVELS,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
