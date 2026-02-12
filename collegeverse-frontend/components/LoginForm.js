import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/router";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginForm({ role = "student", heading, subtitle, onAuthenticated }) {
  const router = useRouter();
  const { login, register, forgotPassword, googleLogin } = useAuth();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [captcha, setCaptcha] = useState(() => generateCaptcha());

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, answer: a + b, userAnswer: "" };
  }

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!formData.email || !formData.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setSuccess("Login successful! Redirecting...");
        const routes = { student: "/dashboard", college: "/college/dashboard", recruiter: "/recruiter/dashboard" };
        if (onAuthenticated) onAuthenticated();
        else setTimeout(() => router.push(routes[role] || "/dashboard"), 800);
      } else {
        setError(result.message || "Login failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) { setError("Please fill in all fields."); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (parseInt(captcha.userAnswer) !== captcha.answer) { setError("Incorrect captcha answer."); setCaptcha(generateCaptcha()); return; }
    setLoading(true);
    try {
      const result = await register(formData.email, formData.password, { displayName: formData.name, role });
      if (result.success) {
        setSuccess("Account created! Redirecting...");
        const routes = { student: "/dashboard", college: "/college/dashboard", recruiter: "/recruiter/dashboard" };
        if (onAuthenticated) onAuthenticated();
        else setTimeout(() => router.push(routes[role] || "/dashboard"), 800);
      } else {
        setError(result.message || "Registration failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!formData.email) { setError("Please enter your email."); return; }
    setLoading(true);
    try {
      const result = await forgotPassword(formData.email);
      if (result.success) setSuccess("Password reset email sent! Check your inbox.");
      else setError(result.message || "Could not send reset email.");
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const result = await googleLogin(role);
      if (result.success) {
        setSuccess("Signed in with Google! Redirecting...");
        const routes = { student: "/dashboard", college: "/college/dashboard", recruiter: "/recruiter/dashboard" };
        if (onAuthenticated) onAuthenticated();
        else setTimeout(() => router.push(routes[role] || "/dashboard"), 800);
      } else {
        setError(result.message || "Google sign-in failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  if (mode === "forgot") {
    return (
      <div className="auth-form">
        <h2 className="auth-form-title">Reset Password</h2>
        <p className="auth-form-subtitle">Enter your email and we will send a reset link.</p>
        {error && <div className="form-message error"><AlertCircle size={16} /> {error}</div>}
        {success && <div className="form-message success"><CheckCircle size={16} /> {success}</div>}
        <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input className="form-input" type="email" placeholder="you@email.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Sending..." : "Send Reset Link"} <ArrowRight size={16} />
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
          <button className="btn-ghost btn-sm" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>Back to sign in</button>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2 className="auth-form-title">{heading || (mode === "login" ? "Welcome Back" : "Create Account")}</h2>
      <p className="auth-form-subtitle">{subtitle || (mode === "login" ? "Sign in to continue your journey." : "Join CollegeVerse and start building your future.")}</p>

      {error && <div className="form-message error"><AlertCircle size={16} /> {error}</div>}
      {success && <div className="form-message success"><CheckCircle size={16} /> {success}</div>}

      <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
        {mode === "register" && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrap">
              <User size={16} className="input-icon" />
              <input className="form-input" type="text" placeholder="Your full name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="input-icon-wrap">
            <Mail size={16} className="input-icon" />
            <input className="form-input" type="email" placeholder="you@email.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-icon-wrap">
            <Lock size={16} className="input-icon" />
            <input className="form-input" type={showPassword ? "text" : "password"} placeholder="Your password" value={formData.password} onChange={(e) => updateField("password", e.target.value)} />
            <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {mode === "register" && (
          <>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input className="form-input" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">What is {captcha.a} + {captcha.b}?</label>
              <input className="form-input" type="number" placeholder="Answer" value={captcha.userAnswer} onChange={(e) => setCaptcha({ ...captcha, userAnswer: e.target.value })} />
            </div>
          </>
        )}

        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: "0.75rem" }}>
            <button type="button" className="btn-ghost btn-sm" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}>Forgot password?</button>
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: "0.25rem" }}>
          {loading ? (mode === "login" ? "Signing in..." : "Creating account...") : (mode === "login" ? "Sign In" : "Create Account")} <ArrowRight size={16} />
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.88rem", color: "var(--text-dim)" }}>
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button className="btn-ghost btn-sm" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}>
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}