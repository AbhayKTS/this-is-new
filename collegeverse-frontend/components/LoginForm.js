import { useState } from "react";import { useState, useContext, useMemo } from "react";

import { useAuth } from "./AuthContext";import { supabase, isSupabaseConfigured } from "../lib/supabase";

import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";import { AuthContext } from "./AuthProvider";



export default function LoginForm({ role = "student", heading, subtitle, onAuthenticated }) {const createCaptcha = () => {

  const { login, register } = useAuth();  const a = Math.floor(Math.random() * 6) + 4;

  const [mode, setMode] = useState("login"); // login | register | forgot  const b = Math.floor(Math.random() * 6) + 3;

  const [email, setEmail] = useState("");  return {

  const [password, setPassword] = useState("");    question: `${a} + ${b}`,

  const [fullName, setFullName] = useState("");    answer: a + b,

  const [confirmPassword, setConfirmPassword] = useState("");  };

  const [showPassword, setShowPassword] = useState(false);};

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");const COLLEGE_DIRECTORY = [

  const [success, setSuccess] = useState("");  { label: "IIT Bombay", value: "iitb", domains: ["iitb.ac.in"] },

  { label: "IISc Bangalore", value: "iisc", domains: ["iisc.ac.in"] },

  const { forgotPassword } = useAuth();  { label: "IIT Delhi", value: "iitd", domains: ["iitd.ac.in"] },

  { label: "Delhi University", value: "du", domains: ["du.ac.in"] },

  const handleLogin = async (e) => {  { label: "NIT Trichy", value: "nitt", domains: ["nitt.edu"] },

    e.preventDefault();  { label: "VIT Vellore", value: "vit", domains: ["vit.ac.in"] },

    setError(""); setSuccess("");  { label: "BITS Pilani", value: "bits", domains: ["pilani.bits-pilani.ac.in", "goa.bits-pilani.ac.in", "hyderabad.bits-pilani.ac.in"] },

    if (!email || !password) { setError("Please fill in all fields."); return; }  { label: "Manipal University", value: "manipal", domains: ["manipal.edu"] },

    setLoading(true);  { label: "SRM University", value: "srm", domains: ["srmist.edu.in"] },

    const result = await login(email, password);  { label: "IIIT Hyderabad", value: "iiith", domains: ["iiit.ac.in"] },

    setLoading(false);];

    if (result.success) {

      setSuccess("Login successful! Redirecting…");const PERSONAL_EMAIL_PROVIDERS = [

      onAuthenticated?.();  "gmail.com",

    } else {  "outlook.com",

      setError(result.message || "Login failed. Please check your credentials.");  "hotmail.com",

    }  "yahoo.com",

  };  "live.com",

  "icloud.com",

  const handleRegister = async (e) => {  "protonmail.com",

    e.preventDefault();];

    setError(""); setSuccess("");

    if (!fullName || !email || !password || !confirmPassword) { setError("Please fill in all fields."); return; }const sanitizePhone = (value) => value.replace(/[^0-9+]/g, "");

    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    if (password !== confirmPassword) { setError("Passwords do not match."); return; }const LoginForm = ({ heading, subtitle, role, glowLabel, showHeader = true, showGlowLabel = true, onAuthenticated }) => {

    setLoading(true);  const [fullName, setFullName] = useState("");

    const result = await register(email, password, { full_name: fullName, role });  const [email, setEmail] = useState("");

    setLoading(false);  const [collegeName, setCollegeName] = useState("");

    if (result.success) {  const [selectedCollege, setSelectedCollege] = useState("");

      setSuccess("Account created! You can now sign in.");  const [adminCode, setAdminCode] = useState("");

      setMode("login");  const [organization, setOrganization] = useState("");

    } else {  const [designation, setDesignation] = useState("");

      setError(result.message || "Registration failed. Try another email.");  const [phoneNumber, setPhoneNumber] = useState("");

    }  const [lastPhoneNumber, setLastPhoneNumber] = useState("");

  };  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleForgot = async (e) => {  const [awaitingOtp, setAwaitingOtp] = useState(false);

    e.preventDefault();  const [otpCode, setOtpCode] = useState("");

    setError(""); setSuccess("");  const [captcha, setCaptcha] = useState(() => createCaptcha());

    if (!email) { setError("Enter your email address."); return; }  const [captchaInput, setCaptchaInput] = useState("");

    setLoading(true);  const [sendingOtp, setSendingOtp] = useState(false);

    const result = await forgotPassword(email);  const [verifyingOtp, setVerifyingOtp] = useState(false);

    setLoading(false);  const [otpChannel, setOtpChannel] = useState("email");

    if (result.success) {  const [lastOtpChannel, setLastOtpChannel] = useState("email");

      setSuccess("Password reset email sent! Check your inbox.");

    } else {  const { signInWithGoogle, signInWithLinkedIn } = useContext(AuthContext);

      setError(result.message || "Could not send reset email.");  const supabaseReady = isSupabaseConfigured;

    }  const loading = sendingOtp || verifyingOtp;

  };

  const isStudent = role === "student";

  return (  const isCollege = role === "college";

    <div className="auth-form">  const isRecruiter = role === "recruiter";

      {/* Tabs */}  const selectedChannelLabel = isStudent && otpChannel === "phone" ? "Phone" : "Email";

      {mode !== "forgot" && (

        <div className="auth-tabs">  const derivedCollegeDomains = useMemo(() => {

          <button type="button" className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>    if (!selectedCollege) return [];

            Sign In    const matched = COLLEGE_DIRECTORY.find((item) => item.value === selectedCollege);

          </button>    return matched ? matched.domains : [];

          <button type="button" className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>  }, [selectedCollege]);

            Create Account

          </button>  const persistRoleSelection = () => {

        </div>    if (typeof window !== "undefined" && role) {

      )}      window.localStorage.setItem("cv-role", role);

    }

      {/* Feedback */}  };

      {error && (

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#fb7185", fontSize: "0.85rem" }}>  const recordIntent = async (intentSource) => {

          <AlertCircle size={16} /> {error}    if (!supabaseReady || !email) return;

        </div>

      )}    try {

      {success && (      const payload = {

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", fontSize: "0.85rem" }}>        email,

          <CheckCircle size={16} /> {success}        full_name: fullName,

        </div>        college: selectedCollege ? COLLEGE_DIRECTORY.find((c) => c.value === selectedCollege)?.label || collegeName : collegeName,

      )}        role,

        intent_source: intentSource,

      {/* LOGIN FORM */}        last_seen_at: new Date().toISOString(),

      {mode === "login" && (        phone: phoneNumber ? sanitizePhone(phoneNumber) : null,

        <form onSubmit={handleLogin} style={{ display: "grid", gap: "1rem" }}>      };

          <div className="form-group">

            <label className="form-label">Email</label>      const { error: intentError } = await supabase

            <div style={{ position: "relative" }}>        .from("profile_intents")

              <Mail size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />        .upsert(payload, { onConflict: "email" });

              <input className="form-input" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: "2.5rem" }} />

            </div>      if (intentError) {

          </div>        console.warn("Unable to capture intent", intentError);

          <div className="form-group">      }

            <label className="form-label">Password</label>    } catch (err) {

            <div style={{ position: "relative" }}>      console.warn("Intent capture failed", err);

              <Lock size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />    }

              <input className="form-input" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }} />  };

              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>

                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}  const getSelectedCollegeName = () => {

              </button>    if (!selectedCollege) return collegeName.trim();

            </div>    const matched = COLLEGE_DIRECTORY.find((item) => item.value === selectedCollege);

          </div>    return matched?.label || collegeName.trim();

          <button type="button" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} style={{ alignSelf: "flex-end", background: "none", border: "none", color: "var(--primary-hover)", fontSize: "0.82rem", cursor: "pointer" }}>  };

            Forgot password?

          </button>  const validateStudentEmail = () => {

          <button type="submit" className="btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>    const domainPart = email.split("@")[1] || "";

            {loading ? "Signing in…" : <><ArrowRight size={18} /> Sign In</>}    if (!domainPart) return "Enter your college email.";

          </button>

        </form>    const lowered = domainPart.toLowerCase();

      )}    if (derivedCollegeDomains.length && derivedCollegeDomains.some((item) => lowered.endsWith(item))) {

      return "";

      {/* REGISTER FORM */}    }

      {mode === "register" && (

        <form onSubmit={handleRegister} style={{ display: "grid", gap: "1rem" }}>    if (lowered.endsWith(".edu") || lowered.endsWith(".ac.in")) {

          <div className="form-group">      return "";

            <label className="form-label">Full Name</label>    }

            <div style={{ position: "relative" }}>

              <User size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />    const directoryMatch = COLLEGE_DIRECTORY.some((item) => item.domains.some((domain) => lowered.endsWith(domain)));

              <input className="form-input" type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ paddingLeft: "2.5rem" }} />    if (directoryMatch) {

            </div>      return "";

          </div>    }

          <div className="form-group">

            <label className="form-label">Email</label>    return "Only college-issued emails are accepted (e.g. name@iitb.ac.in).";

            <div style={{ position: "relative" }}>  };

              <Mail size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />

              <input className="form-input" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: "2.5rem" }} />  const validateCollegeEmail = () => {

            </div>    if (!selectedCollege) {

          </div>      return "Select your college to continue.";

          <div className="form-group">    }

            <label className="form-label">Password</label>    if (selectedCollege === "other" && !collegeName.trim()) {

            <div style={{ position: "relative" }}>      return "Enter your college name.";

              <Lock size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />    }

              <input className="form-input" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: "2.5rem" }} />    const domainPart = email.split("@")[1] || "";

            </div>    if (!domainPart) return "Enter your official college email.";

          </div>    const lowered = domainPart.toLowerCase();

          <div className="form-group">    const domainMatch = derivedCollegeDomains.some((domain) => lowered.endsWith(domain));

            <label className="form-label">Confirm Password</label>    if (!domainMatch && !(lowered.endsWith(".edu") || lowered.endsWith(".ac.in"))) {

            <div style={{ position: "relative" }}>      return "Please use the official domain linked to your college.";

              <Lock size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />    }

              <input className="form-input" type={showPassword ? "text" : "password"} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ paddingLeft: "2.5rem" }} />    if (!adminCode.trim()) {

            </div>      return "Admin verification code is required.";

          </div>    }

          <button type="submit" className="btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>    return "";

            {loading ? "Creating account…" : <><ArrowRight size={18} /> Create Account</>}  };

          </button>

        </form>  const validateRecruiterEmail = () => {

      )}    const domainPart = email.split("@")[1] || "";

    if (!domainPart) {

      {/* FORGOT PASSWORD */}      return "Enter your company email.";

      {mode === "forgot" && (    }

        <form onSubmit={handleForgot} style={{ display: "grid", gap: "1rem" }}>    const lowered = domainPart.toLowerCase();

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, color: "white", textAlign: "center" }}>Reset Password</h2>    if (PERSONAL_EMAIL_PROVIDERS.includes(lowered)) {

          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center" }}>Enter your email and we'll send you a reset link.</p>      return "Company email required. Personal email domains are not supported.";

          <div className="form-group">    }

            <label className="form-label">Email</label>    if (!organization.trim()) {

            <div style={{ position: "relative" }}>      return "Enter your organization name.";

              <Mail size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />    }

              <input className="form-input" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: "2.5rem" }} />    if (!designation.trim()) {

            </div>      return "Enter your designation.";

          </div>    }

          <button type="submit" className="btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>    return "";

            {loading ? "Sending…" : "Send Reset Link"}  };

          </button>

          <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "var(--primary-hover)", fontSize: "0.85rem", cursor: "pointer", textAlign: "center" }}>  const validateForm = async () => {

            ← Back to sign in    if (!supabaseReady) {

          </button>      return "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY in .env.local";

        </form>    }

      )}

    </div>    if (!fullName.trim()) return "Enter your full name.";

  );    if (!email.trim()) return "Enter your email address.";

}

    if (isStudent) {
      const studentError = validateStudentEmail();
      if (studentError) return studentError;
      if (!getSelectedCollegeName()) {
        return "Select or enter your college name.";
      }
      if (otpChannel === "phone") {
        if (!phoneNumber.trim()) {
          return "Enter your phone number.";
        }
        const sanitizedPhone = sanitizePhone(phoneNumber);
        if (sanitizedPhone.length < 10) {
          return "Enter a valid phone number.";
        }
      }
    }

    if (isCollege) {
      const collegeError = validateCollegeEmail();
      if (collegeError) return collegeError;

      try {
        let query = supabase
          .from("college_admins")
          .select("id")
          .eq("email", email.toLowerCase())
          .eq("admin_code", adminCode);

        if (selectedCollege && selectedCollege !== "other") {
          query = query.eq("college_slug", selectedCollege);
        } else if (collegeName.trim()) {
          query = query.eq("college_name", collegeName.trim());
        }

        const { data, error: adminError } = await query.maybeSingle();

        if (adminError) {
          console.warn("Admin validation error", adminError);
        }

        if (!data) {
          return "Admin verification failed. Check your code or email.";
        }
      } catch (err) {
        console.warn("Admin validation exception", err);
        return "Unable to validate admin code right now. Try again in a moment.";
      }
    }

    if (isRecruiter) {
      const recruiterError = validateRecruiterEmail();
      if (recruiterError) return recruiterError;
    }

    return "";
  };

  const deriveMetadata = () => {
    const meta = {
      role,
      full_name: fullName.trim(),
    };

    if (isStudent || isCollege) {
      meta.college = getSelectedCollegeName();
      if (selectedCollege) {
        meta.college_slug = selectedCollege;
      }
      if (phoneNumber) {
        meta.phone = sanitizePhone(phoneNumber);
      }
    }

    if (isRecruiter) {
      meta.company = organization.trim();
      meta.designation = designation.trim();
    }

    return meta;
  };

  const regenerateCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaInput("");
  };

  async function handleMagicLink(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const validationError = await validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (Number(captchaInput) !== captcha.answer) {
      setError("Captcha verification failed. Try again.");
      regenerateCaptcha();
      return;
    }

    try {
      setSendingOtp(true);
      persistRoleSelection();
      await recordIntent("magic_link");

      const metadata = deriveMetadata();
      const targetChannel = isStudent && otpChannel === "phone" ? "phone" : "email";
      let signInError = null;

      if (targetChannel === "phone") {
        const sanitizedPhone = sanitizePhone(phoneNumber);
        const { error } = await supabase.auth.signInWithOtp({
          phone: sanitizedPhone,
          options: {
            channel: "sms",
            data: metadata,
            shouldCreateUser: true,
          },
        });
        signInError = error;
        if (!error) {
          setLastOtpChannel("phone");
          setLastPhoneNumber(sanitizedPhone);
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.toLowerCase(),
          options: {
            data: metadata,
            shouldCreateUser: true,
          },
        });
        signInError = error;
        if (!error) {
          setLastOtpChannel("email");
        }
      }

      if (signInError) {
        setError(signInError.message);
      } else {
        setAwaitingOtp(true);
        setOtpCode("");
        setMessage(
          targetChannel === "phone"
            ? "OTP sent to your phone. Enter the 6-digit code to continue."
            : "OTP sent to your email. Enter the 6-digit code to continue."
        );
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSendingOtp(false);
      regenerateCaptcha();
    }
  }

  async function handleOtpVerify() {
    setError("");
    setMessage("");

    if (!awaitingOtp) {
      setError("Request an OTP before verification.");
      return;
    }

    if (!otpCode.trim()) {
      setError(
        lastOtpChannel === "phone"
          ? "Enter the OTP sent to your phone."
          : "Enter the OTP sent to your email."
      );
      return;
    }

    try {
      setVerifyingOtp(true);
      persistRoleSelection();
      const verifyingChannel = lastOtpChannel;
      const sanitizedPhone = lastPhoneNumber || sanitizePhone(phoneNumber);

      if (verifyingChannel === "phone" && sanitizedPhone.length < 10) {
        setError("Enter the phone number you used for the OTP.");
        return;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp(
        verifyingChannel === "phone"
          ? {
              type: "sms",
              token: otpCode.trim(),
              phone: sanitizedPhone,
            }
          : {
              type: "email",
              token: otpCode.trim(),
              email: email.toLowerCase(),
            }
      );

      if (verifyError) {
        setError(verifyError.message || "Invalid OTP. Try again.");
        return;
      }

      if (data?.session) {
        setAwaitingOtp(false);
        setOtpCode("");
        setMessage("OTP verified! Signing you in...");
        onAuthenticated?.();
      } else {
        setMessage("OTP verified. Complete login in your email if prompted.");
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleGoogle(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const validationError = await validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      persistRoleSelection();
      await recordIntent("google_oauth");
      await signInWithGoogle(deriveMetadata());
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  async function handleLinkedIn(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isRecruiter) {
      setError("LinkedIn sign-in is available for recruiters only.");
      return;
    }

    try {
      const validationError = await validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      persistRoleSelection();
      await recordIntent("linkedin_oauth");
      await signInWithLinkedIn(deriveMetadata());
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  return (
    <div className="login-card glass-panel" data-role={role}>
  {glowLabel && showGlowLabel && <span className="glow-label">{glowLabel}</span>}
      {showHeader && (
        <>
          <h2 className="font-display" style={{ fontSize: "1.75rem", marginBottom: "0.75rem", color: "white" }}>{heading}</h2>
          <p style={{ color: "rgba(202, 213, 255, 0.78)", lineHeight: 1.6, marginBottom: "1.5rem" }}>{subtitle}</p>
        </>
      )}

      <form className="login-form" onSubmit={handleMagicLink}>
        <label className="sr-only" htmlFor={`${role}-name-input`}>
          Full name
        </label>
        <input
          id={`${role}-name-input`}
          className="input"
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={loading}
          required
        />

        {(isStudent || isCollege) && (
          <div className="select-group">
            <label className="sr-only" htmlFor={`${role}-college-select`}>
              College
            </label>
            <select
              id={`${role}-college-select`}
              className="input"
              value={selectedCollege}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedCollege(value);
                if (value === "other") {
                  setCollegeName("");
                } else {
                  const matched = COLLEGE_DIRECTORY.find((college) => college.value === value);
                  if (matched) {
                    setCollegeName(matched.label);
                  }
                }
              }}
              disabled={loading}
            >
              <option value="">Select your college</option>
              {COLLEGE_DIRECTORY.map((college) => (
                <option key={college.value} value={college.value}>
                  {college.label}
                </option>
              ))}
              <option value="other">Other college</option>
            </select>

            {selectedCollege === "other" && (
              <input
                className="input"
                type="text"
                placeholder="Enter college name"
                value={collegeName}
                onChange={(event) => setCollegeName(event.target.value)}
                disabled={loading}
                style={{ marginTop: "0.75rem" }}
              />
            )}
          </div>
        )}

        {isRecruiter && (
          <input
            className="input"
            type="text"
            placeholder="Organization name"
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            disabled={loading}
            required
          />
        )}

        {isRecruiter && (
          <input
            className="input"
            type="text"
            placeholder="Designation"
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
            disabled={loading}
            required
          />
        )}

        <label className="sr-only" htmlFor={`${role}-email-input`}>
          Email
        </label>
        <input
          id={`${role}-email-input`}
          className="input"
          type="email"
          placeholder={isRecruiter ? "you@company.com" : "name@college.edu"}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          required
        />

        {isStudent && (
          <fieldset
            className="otp-channel-fieldset"
            disabled={loading}
            style={{
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              color: "rgba(202, 213, 255, 0.86)",
            }}
          >
            <legend className="otp-channel-legend" style={{ padding: "0 0.35rem" }}>Send OTP via</legend>
            <label className="otp-channel-option" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <input
                type="radio"
                name={`${role}-otp-channel`}
                value="email"
                checked={otpChannel === "email"}
                onChange={() => setOtpChannel("email")}
                disabled={loading}
              />
              Email
            </label>
            <label className="otp-channel-option" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <input
                type="radio"
                name={`${role}-otp-channel`}
                value="phone"
                checked={otpChannel === "phone"}
                onChange={() => setOtpChannel("phone")}
                disabled={loading}
              />
              Phone
            </label>
          </fieldset>
        )}

        {isStudent && otpChannel === "phone" && (
          <input
            className="input"
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            disabled={loading}
            required
          />
        )}

        {isCollege && (
          <input
            className="input"
            type="text"
            placeholder="Admin verification code"
            value={adminCode}
            onChange={(event) => setAdminCode(event.target.value)}
            disabled={loading}
            required
          />
        )}

        <div className="captcha-block">
          <span className="captcha-question" aria-live="polite">{captcha.question}</span>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder="Solve to verify"
            value={captchaInput}
            onChange={(event) => setCaptchaInput(event.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={regenerateCaptcha}
            disabled={loading}
            aria-label="Refresh captcha"
          >
            ↻
          </button>
        </div>

        <button className="cta-main" type="submit" disabled={sendingOtp} style={{ justifyContent: "center", width: "100%" }}>
          {sendingOtp
            ? "Sending..."
            : awaitingOtp
            ? `Resend OTP to ${selectedChannelLabel}`
            : `Send OTP to ${selectedChannelLabel}`}
        </button>
      </form>

      <div style={{ marginTop: "1.25rem", display: "grid", gap: "0.75rem" }}>
        <button
          className="btn-ghost"
          type="button"
          onClick={handleGoogle}
          style={{ width: "100%", justifyContent: "center" }}
          disabled={loading}
        >
          Continue with Google
        </button>

        {isRecruiter ? (
          <button
            className="btn-ghost"
            type="button"
            onClick={handleLinkedIn}
            style={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            Continue with LinkedIn
          </button>
        ) : (
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              persistRoleSelection();
              if (typeof window !== "undefined") {
                window.location.href = "https://github.com/login";
              }
            }}
            style={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            Continue with GitHub
          </button>
        )}
      </div>

      {awaitingOtp && (
        <div className="otp-section">
          <label htmlFor={`${role}-otp-input`}>
            Enter OTP
            <input
              id={`${role}-otp-input`}
              className="input"
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              disabled={verifyingOtp}
              maxLength={6}
            />
          </label>
          <button
            type="button"
            className="cta-main"
            onClick={handleOtpVerify}
            disabled={verifyingOtp || !otpCode.trim()}
            style={{ justifyContent: "center" }}
          >
            {verifyingOtp ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {message && <p className="message-success" style={{ marginTop: "1rem" }}>{message}</p>}
      {error && <p className="message-error" style={{ marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
