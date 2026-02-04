import { useState, useContext, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AuthContext } from "./AuthProvider";

const createCaptcha = () => {
  const a = Math.floor(Math.random() * 6) + 4;
  const b = Math.floor(Math.random() * 6) + 3;
  return {
    question: `${a} + ${b}`,
    answer: a + b,
  };
};

const COLLEGE_DIRECTORY = [
  { label: "IIT Bombay", value: "iitb", domains: ["iitb.ac.in"] },
  { label: "IISc Bangalore", value: "iisc", domains: ["iisc.ac.in"] },
  { label: "IIT Delhi", value: "iitd", domains: ["iitd.ac.in"] },
  { label: "Delhi University", value: "du", domains: ["du.ac.in"] },
  { label: "NIT Trichy", value: "nitt", domains: ["nitt.edu"] },
  { label: "VIT Vellore", value: "vit", domains: ["vit.ac.in"] },
  { label: "BITS Pilani", value: "bits", domains: ["pilani.bits-pilani.ac.in", "goa.bits-pilani.ac.in", "hyderabad.bits-pilani.ac.in"] },
  { label: "Manipal University", value: "manipal", domains: ["manipal.edu"] },
  { label: "SRM University", value: "srm", domains: ["srmist.edu.in"] },
  { label: "IIIT Hyderabad", value: "iiith", domains: ["iiit.ac.in"] },
];

const PERSONAL_EMAIL_PROVIDERS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "live.com",
  "icloud.com",
  "protonmail.com",
];

const sanitizePhone = (value) => value.replace(/[^0-9+]/g, "");

const LoginForm = ({ heading, subtitle, role, glowLabel, showHeader = true, showGlowLabel = true, onAuthenticated }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lastPhoneNumber, setLastPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [captcha, setCaptcha] = useState(() => createCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpChannel, setOtpChannel] = useState("email");
  const [lastOtpChannel, setLastOtpChannel] = useState("email");

  const { signInWithGoogle, signInWithLinkedIn } = useContext(AuthContext);
  const supabaseReady = isSupabaseConfigured;
  const loading = sendingOtp || verifyingOtp;

  const isStudent = role === "student";
  const isCollege = role === "college";
  const isRecruiter = role === "recruiter";
  const selectedChannelLabel = isStudent && otpChannel === "phone" ? "Phone" : "Email";

  const derivedCollegeDomains = useMemo(() => {
    if (!selectedCollege) return [];
    const matched = COLLEGE_DIRECTORY.find((item) => item.value === selectedCollege);
    return matched ? matched.domains : [];
  }, [selectedCollege]);

  const persistRoleSelection = () => {
    if (typeof window !== "undefined" && role) {
      window.localStorage.setItem("cv-role", role);
    }
  };

  const recordIntent = async (intentSource) => {
    if (!supabaseReady || !email) return;

    try {
      const payload = {
        email,
        full_name: fullName,
        college: selectedCollege ? COLLEGE_DIRECTORY.find((c) => c.value === selectedCollege)?.label || collegeName : collegeName,
        role,
        intent_source: intentSource,
        last_seen_at: new Date().toISOString(),
        phone: phoneNumber ? sanitizePhone(phoneNumber) : null,
      };

      const { error: intentError } = await supabase
        .from("profile_intents")
        .upsert(payload, { onConflict: "email" });

      if (intentError) {
        console.warn("Unable to capture intent", intentError);
      }
    } catch (err) {
      console.warn("Intent capture failed", err);
    }
  };

  const getSelectedCollegeName = () => {
    if (!selectedCollege) return collegeName.trim();
    const matched = COLLEGE_DIRECTORY.find((item) => item.value === selectedCollege);
    return matched?.label || collegeName.trim();
  };

  const validateStudentEmail = () => {
    const domainPart = email.split("@")[1] || "";
    if (!domainPart) return "Enter your college email.";

    const lowered = domainPart.toLowerCase();
    if (derivedCollegeDomains.length && derivedCollegeDomains.some((item) => lowered.endsWith(item))) {
      return "";
    }

    if (lowered.endsWith(".edu") || lowered.endsWith(".ac.in")) {
      return "";
    }

    const directoryMatch = COLLEGE_DIRECTORY.some((item) => item.domains.some((domain) => lowered.endsWith(domain)));
    if (directoryMatch) {
      return "";
    }

    return "Only college-issued emails are accepted (e.g. name@iitb.ac.in).";
  };

  const validateCollegeEmail = () => {
    if (!selectedCollege) {
      return "Select your college to continue.";
    }
    if (selectedCollege === "other" && !collegeName.trim()) {
      return "Enter your college name.";
    }
    const domainPart = email.split("@")[1] || "";
    if (!domainPart) return "Enter your official college email.";
    const lowered = domainPart.toLowerCase();
    const domainMatch = derivedCollegeDomains.some((domain) => lowered.endsWith(domain));
    if (!domainMatch && !(lowered.endsWith(".edu") || lowered.endsWith(".ac.in"))) {
      return "Please use the official domain linked to your college.";
    }
    if (!adminCode.trim()) {
      return "Admin verification code is required.";
    }
    return "";
  };

  const validateRecruiterEmail = () => {
    const domainPart = email.split("@")[1] || "";
    if (!domainPart) {
      return "Enter your company email.";
    }
    const lowered = domainPart.toLowerCase();
    if (PERSONAL_EMAIL_PROVIDERS.includes(lowered)) {
      return "Company email required. Personal email domains are not supported.";
    }
    if (!organization.trim()) {
      return "Enter your organization name.";
    }
    if (!designation.trim()) {
      return "Enter your designation.";
    }
    return "";
  };

  const validateForm = async () => {
    if (!supabaseReady) {
      return "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY in .env.local";
    }

    if (!fullName.trim()) return "Enter your full name.";
    if (!email.trim()) return "Enter your email address.";

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
