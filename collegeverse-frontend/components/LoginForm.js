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

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--glass-border)" }} />
        <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--glass-border)" }} />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.65rem",
          padding: "0.75rem 1rem",
          borderRadius: 12,
          border: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          color: "white",
          fontSize: "0.9rem",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          transition: "all 0.2s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.88rem", color: "var(--text-dim)" }}>
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button className="btn-ghost btn-sm" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}>
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}