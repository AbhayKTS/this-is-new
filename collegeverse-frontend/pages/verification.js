import { useState, useContext } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AuthContext } from "../components/AuthProvider";
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  ArrowRight,
  Mail,
  GraduationCap,
  Building,
  FileCheck,
} from "lucide-react";

const verificationSteps = [
  {
    id: 1,
    title: "Basic Information",
    description: "Provide your college details and graduation year",
  },
  {
    id: 2,
    title: "College Email",
    description: "Verify using your official college email address",
  },
  {
    id: 3,
    title: "ID Proof",
    description: "Upload your college ID card for verification",
  },
  {
    id: 4,
    title: "Review",
    description: "Wait for our team to verify your details",
  },
];

export default function VerificationPage() {
  const { user } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    collegeName: "",
    graduationYear: "",
    studentEmail: "",
    idProofUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In production, upload to Supabase Storage or another service
    // For demo, we'll use a placeholder URL
    setFormData((prev) => ({
      ...prev,
      idProofUrl: `https://storage.example.com/id-proofs/${file.name}`,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      if (isSupabaseConfigured && user) {
        const { error: submitError } = await supabase
          .from("senior_verifications")
          .insert({
            user_id: user.id,
            college_name: formData.collegeName,
            graduation_year: parseInt(formData.graduationYear, 10),
            student_email: formData.studentEmail,
            id_proof_url: formData.idProofUrl,
            status: "pending",
            submitted_at: new Date().toISOString(),
          });

        if (submitError) throw submitError;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit verification request");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.collegeName && formData.graduationYear;
      case 2:
        return formData.studentEmail && formData.studentEmail.includes("@");
      case 3:
        return formData.idProofUrl;
      default:
        return true;
    }
  };

  if (submitted) {
    return (
      <div className="page-shell">
        <NavBar />
        <main className="verification-page">
          <div className="container">
            <div className="success-card glass-panel">
              <div className="success-icon">
                <CheckCircle size={64} />
              </div>
              <h1>Verification Submitted!</h1>
              <p>
                Your verification request has been submitted successfully. Our team will review
                your documents and verify your senior status within 24-48 hours.
              </p>
              <div className="status-badge pending">
                <Clock size={18} />
                Pending Review
              </div>
              <p className="note">
                You'll receive an email notification once your verification is complete.
              </p>
            </div>
          </div>
        </main>
        <Footer />
        <style jsx>{`
          .verification-page {
            padding: 4rem 0;
            min-height: calc(100vh - 80px);
          }
          .success-card {
            max-width: 500px;
            margin: 0 auto;
            padding: 3rem;
            text-align: center;
          }
          .success-icon {
            color: #22c55e;
            margin-bottom: 1.5rem;
          }
          .success-card h1 {
            margin-bottom: 1rem;
          }
          .success-card p {
            color: rgba(202, 213, 255, 0.7);
            margin-bottom: 1.5rem;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 30px;
            font-weight: 500;
            margin-bottom: 1.5rem;
          }
          .status-badge.pending {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
          }
          .note {
            font-size: 0.9rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <NavBar />
      <main className="verification-page">
        <div className="container">
          {/* Hero */}
          <header className="verification-hero glass-panel">
            <span className="badge-pill">
              <Shield size={16} />
              Senior Verification
            </span>
            <h1>
              Get <span className="title-gradient">Verified</span> as a College Senior
            </h1>
            <p>
              Verify your college identity to help freshers make informed decisions.
              Verified seniors get special badges and higher trust ratings.
            </p>
          </header>

          {/* Benefits */}
          <section className="benefits-section">
            <h2>Why Get Verified?</h2>
            <div className="benefits-grid">
              <div className="benefit-card glass-panel">
                <Shield size={32} className="benefit-icon" />
                <h3>Trust Badge</h3>
                <p>Get a verified badge on your profile that shows you're a real student</p>
              </div>
              <div className="benefit-card glass-panel">
                <GraduationCap size={32} className="benefit-icon" />
                <h3>Help Freshers</h3>
                <p>Your answers will be prioritized and trusted by college seekers</p>
              </div>
              <div className="benefit-card glass-panel">
                <Building size={32} className="benefit-icon" />
                <h3>Rate Your College</h3>
                <p>Only verified seniors can rate colleges and write authentic reviews</p>
              </div>
            </div>
          </section>

          {/* Verification Form */}
          <section className="verification-form glass-panel">
            {/* Progress Steps */}
            <div className="steps-progress">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`step ${currentStep >= step.id ? "active" : ""} ${currentStep > step.id ? "completed" : ""}`}
                >
                  <div className="step-number">
                    {currentStep > step.id ? <CheckCircle size={20} /> : step.id}
                  </div>
                  <div className="step-info">
                    <span className="step-title">{step.title}</span>
                    <span className="step-desc">{step.description}</span>
                  </div>
                  {index < verificationSteps.length - 1 && <div className="step-connector" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="form-content">
              {currentStep === 1 && (
                <div className="form-step">
                  <h3>Tell us about your college</h3>
                  <div className="form-group">
                    <label>College Name</label>
                    <input
                      type="text"
                      name="collegeName"
                      placeholder="e.g., IIT Bombay"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Graduation Year</label>
                    <select
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                    >
                      <option value="">Select year</option>
                      {[2024, 2025, 2026, 2027, 2028].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-step">
                  <h3>Verify your college email</h3>
                  <p className="step-hint">
                    Use your official college email (e.g., name@iitb.ac.in)
                  </p>
                  <div className="form-group">
                    <label>College Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={20} />
                      <input
                        type="email"
                        name="studentEmail"
                        placeholder="your.name@college.edu"
                        value={formData.studentEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="form-step">
                  <h3>Upload your college ID</h3>
                  <p className="step-hint">
                    Upload a clear photo of your college ID card. Make sure your name and photo are visible.
                  </p>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="idProof"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="idProof" className="upload-label">
                      {formData.idProofUrl ? (
                        <>
                          <FileCheck size={48} className="uploaded-icon" />
                          <span>Document uploaded</span>
                          <span className="change-file">Click to change</span>
                        </>
                      ) : (
                        <>
                          <Upload size={48} />
                          <span>Click to upload your college ID</span>
                          <span className="file-types">JPG, PNG or PDF (max 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="form-step review-step">
                  <h3>Review your information</h3>
                  <div className="review-items">
                    <div className="review-item">
                      <span className="review-label">College</span>
                      <span className="review-value">{formData.collegeName}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Graduation Year</span>
                      <span className="review-value">{formData.graduationYear}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">College Email</span>
                      <span className="review-value">{formData.studentEmail}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">ID Proof</span>
                      <span className="review-value">
                        {formData.idProofUrl ? "✓ Uploaded" : "Not uploaded"}
                      </span>
                    </div>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                </div>
              )}

              {/* Navigation */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button
                    className="nav-btn back"
                    onClick={() => setCurrentStep((s) => s - 1)}
                  >
                    Back
                  </button>
                )}
                {currentStep < 4 ? (
                  <button
                    className="nav-btn next"
                    onClick={() => setCurrentStep((s) => s + 1)}
                    disabled={!canProceed()}
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    className="nav-btn submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit for Verification"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .verification-page {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .verification-hero {
          padding: 3rem;
          margin-bottom: 3rem;
          text-align: center;
        }

        .verification-hero h1 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          margin: 1rem 0;
        }

        .verification-hero p {
          color: rgba(202, 213, 255, 0.78);
          max-width: 550px;
          margin: 0 auto;
        }

        .benefits-section {
          margin-bottom: 3rem;
        }

        .benefits-section h2 {
          text-align: center;
          margin-bottom: 2rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .benefit-card {
          padding: 2rem;
          text-align: center;
        }

        :global(.benefit-icon) {
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .benefit-card h3 {
          margin-bottom: 0.5rem;
        }

        .benefit-card p {
          color: rgba(202, 213, 255, 0.7);
          font-size: 0.9rem;
        }

        .verification-form {
          padding: 2rem;
          max-width: 700px;
          margin: 0 auto;
        }

        .steps-progress {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3rem;
          position: relative;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.6);
          border: 2px solid rgba(148, 163, 184, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 0.75rem;
          z-index: 1;
        }

        .step.active .step-number {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .step.completed .step-number {
          background: #22c55e;
          border-color: #22c55e;
        }

        .step-info {
          text-align: center;
        }

        .step-title {
          display: block;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .step-desc {
          display: none;
          font-size: 0.75rem;
          color: rgba(202, 213, 255, 0.5);
        }

        @media (min-width: 768px) {
          .step-desc {
            display: block;
          }
        }

        .step-connector {
          position: absolute;
          top: 20px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: rgba(148, 163, 184, 0.2);
        }

        .step.completed .step-connector {
          background: #22c55e;
        }

        .form-content {
          min-height: 300px;
        }

        .form-step h3 {
          margin-bottom: 0.5rem;
        }

        .step-hint {
          color: rgba(202, 213, 255, 0.6);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .input-with-icon {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
        }

        .input-with-icon input {
          border: none;
          background: transparent;
          padding: 1rem 0;
        }

        .upload-area {
          margin-top: 1rem;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 3rem;
          background: rgba(15, 23, 42, 0.4);
          border: 2px dashed rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-label:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.05);
        }

        :global(.uploaded-icon) {
          color: #22c55e;
        }

        .file-types,
        .change-file {
          font-size: 0.8rem;
          color: rgba(202, 213, 255, 0.5);
        }

        .review-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 8px;
          margin-top: 1rem;
        }

        .review-item {
          display: flex;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .review-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .review-label {
          color: rgba(202, 213, 255, 0.6);
        }

        .review-value {
          font-weight: 500;
        }

        .error-message {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 8px;
          color: #ef4444;
        }

        .form-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn.back {
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: rgba(202, 213, 255, 0.7);
        }

        .nav-btn.back:hover {
          border-color: var(--accent-primary);
        }

        .nav-btn.next,
        .nav-btn.submit {
          background: var(--accent-primary);
          border: none;
          color: white;
          margin-left: auto;
        }

        .nav-btn.next:hover,
        .nav-btn.submit:hover {
          opacity: 0.9;
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
