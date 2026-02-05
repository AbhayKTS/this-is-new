import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../components/AuthContext";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, forgotPassword, isCollegeEmail, loading } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  
  const [message, setMessage] = useState({ type: "", text: "" });
  const [emailType, setEmailType] = useState(null); // 'college' or 'personal'
  
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    
    if (email && email.includes("@")) {
      const isCollege = isCollegeEmail(email);
      setEmailType(isCollege ? "college" : "personal");
    } else {
      setEmailType(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    
    if (isRegister) {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: "error", text: "Passwords don't match" });
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ type: "error", text: "Password must be at least 6 characters" });
        return;
      }
      
      const result = await register(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
      });
      
      if (result.success) {
        setMessage({ 
          type: "success", 
          text: result.message || "Account created! Please check your email to verify." 
        });
        // Redirect based on account type
        setTimeout(() => {
          router.push(result.isCollegeEmail ? "/dashboard" : "/explore");
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } else {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect based on role
        if (result.role === "explorer") {
          router.push("/explore");
        } else {
          router.push("/dashboard");
        }
      } else {
        setMessage({ type: "error", text: result.message });
      }
    }
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }
    
    const result = await forgotPassword(formData.email);
    if (result.success) {
      setMessage({ type: "success", text: result.message });
    } else {
      setMessage({ type: "error", text: result.message });
    }
  };
  
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600 mb-6">Enter your email to receive a password reset link</p>
          
          <form onSubmit={handleForgotPassword}>
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            {message.text && (
              <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
                message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}>
                {message.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                {message.text}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          
          <button
            onClick={() => setShowForgotPassword(false)}
            className="w-full mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex">
        {/* Left Side - Info */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to CollegeVerse
            </h1>
            <p className="text-indigo-200 mb-8">
              Get authentic college guidance from verified seniors
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                College Email = Full Access
              </h3>
              <p className="text-indigo-200 text-sm">
                Login with your college email (@college.edu, @student.ac.in) to unlock all features: ask questions, join communities, and connect with seniors.
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Email = Explorer Mode
              </h3>
              <p className="text-indigo-200 text-sm">
                Use any email to explore colleges, compare ratings, and make informed decisions. Upgrade anytime with a college email!
              </p>
            </div>
          </div>
          
          <div className="text-indigo-200 text-sm">
            © 2026 CollegeVerse. All rights reserved.
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsRegister(false)}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  !isRegister ? "bg-white shadow text-indigo-600" : "text-gray-600"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  isRegister ? "bg-white shadow text-indigo-600" : "text-gray-600"
                }`}
              >
                Register
              </button>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {isRegister 
              ? "Join thousands of students making informed decisions" 
              : "Sign in to continue to CollegeVerse"}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleEmailChange}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Email Type Indicator */}
            {emailType && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                emailType === "college" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                <Info className="h-4 w-4" />
                {emailType === "college" ? (
                  <span><strong>College email detected!</strong> You'll get full access to all features.</span>
                ) : (
                  <span><strong>Personal email.</strong> You'll join as an Explorer with limited features. Use a college email for full access.</span>
                )}
              </div>
            )}
            
            {isRegister && (
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
            
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {isRegister && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            )}
            
            {!isRegister && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            {message.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}>
                {message.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                {message.text}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Please wait..."
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
          
          {isRegister && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
