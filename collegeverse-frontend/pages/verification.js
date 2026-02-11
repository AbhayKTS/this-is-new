import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../components/AuthContext";
import { ShieldCheck, Upload, CheckCircle, Clock, AlertCircle, FileText, Camera, CreditCard, ArrowRight, ChevronRight } from "lucide-react";

const steps = [
  { id: 1, title: "College Email", description: "Verify your official college email address", icon: FileText },
  { id: 2, title: "Student ID", description: "Upload a photo of your college ID card", icon: CreditCard },
  { id: 3, title: "Selfie Check", description: "Take a selfie matching your ID for liveness verification", icon: Camera },
  { id: 4, title: "Review", description: "Our team reviews your documents within 24 hours", icon: ShieldCheck },
];

export default function Verification() {
  const { user, userData, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [emailSent, setEmailSent] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);

  const verified = userData?.verified || false;

  if (verified) {
    return (
      <DashboardLayout title="Verification">
        <div className="empty-state" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <div className="empty-state-icon" style={{ background: "rgba(16,185,129,0.15)", color: "var(--success)" }}><CheckCircle size={36} /></div>
          <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>You are Verified!</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 440, margin: "0.5rem auto" }}>Your identity has been confirmed. You now have access to all Senior features including MicroGigs, verified badges, and exclusive opportunities.</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1.5rem" }}>
            <span className="status-pill success">Verified Student</span>
            <span className="status-pill info">Senior Access</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Verification">
      <div className="page-hero">
        <span className="badge-pill"><ShieldCheck size={14} /> Identity</span>
        <h1>Get <span className="text-gradient">Verified</span></h1>
        <p>Complete verification to unlock Senior status, earn trust badges, and access premium features.</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {steps.map((s, i) => {
          const done = currentStep > s.id;
          const active = currentStep === s.id;
          return (
            <div key={s.id} style={{ flex: 1, minWidth: 150, padding: "1rem", borderRadius: 14, background: active ? "var(--glass-bg)" : "transparent", border: active ? "1px solid var(--accent)" : "1px solid var(--glass-border)", cursor: "pointer", transition: "all 0.2s" }} onClick={() => { if (done || active) setCurrentStep(s.id); }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                {done ? <CheckCircle size={18} style={{ color: "var(--success)" }} /> : <s.icon size={18} style={{ color: active ? "var(--accent)" : "var(--text-dim)" }} />}
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: done ? "var(--success)" : active ? "var(--accent)" : "var(--text-dim)" }}>Step {s.id}</span>
              </div>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: active ? "white" : "var(--text-muted)", margin: 0 }}>{s.title}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", margin: "0.2rem 0 0" }}>{s.description}</p>
            </div>
          );
        })}
      </div>

      <div className="section-card">
        {currentStep === 1 && (
          <div>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Verify College Email</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>We will send a verification link to your college email. Only official .edu or .ac.in addresses are accepted.</p>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <input className="form-input" style={{ maxWidth: 340 }} placeholder="you@college.edu" defaultValue={user?.email || ""} />
              {emailSent ? (
                <span className="status-pill success"><CheckCircle size={14} /> Link Sent</span>
              ) : (
                <button className="btn-primary btn-sm" onClick={() => setEmailSent(true)}>Send Verification Link</button>
              )}
            </div>
            {emailSent && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ color: "var(--success)", fontSize: "0.85rem" }}><CheckCircle size={14} style={{ verticalAlign: "middle" }} /> Check your inbox and click the verification link.</p>
                <button className="btn-primary btn-sm" style={{ marginTop: "0.75rem" }} onClick={() => setCurrentStep(2)}>Continue <ChevronRight size={14} /></button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Upload Student ID</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>Upload a clear photo of your college ID card. Make sure your name and photo are visible.</p>
            <div style={{ border: "2px dashed var(--glass-border)", borderRadius: 14, padding: "2rem", textAlign: "center", cursor: "pointer" }} onClick={() => setFileUploaded(true)}>
              {fileUploaded ? (
                <div><CheckCircle size={28} style={{ color: "var(--success)" }} /><p style={{ color: "var(--success)", marginTop: "0.5rem" }}>student_id.jpg uploaded</p></div>
              ) : (
                <div><Upload size={28} style={{ color: "var(--text-dim)" }} /><p style={{ color: "var(--text-dim)", marginTop: "0.5rem" }}>Click to upload or drag & drop</p><p style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>JPG, PNG up to 5 MB</p></div>
              )}
            </div>
            {fileUploaded && (
              <button className="btn-primary btn-sm" style={{ marginTop: "1rem" }} onClick={() => setCurrentStep(3)}>Continue <ChevronRight size={14} /></button>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Selfie Verification</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>Take a selfie so we can match it with your ID card photo. This ensures account security.</p>
            <div style={{ border: "2px dashed var(--glass-border)", borderRadius: 14, padding: "2rem", textAlign: "center", cursor: "pointer" }} onClick={() => setSelfieTaken(true)}>
              {selfieTaken ? (
                <div><CheckCircle size={28} style={{ color: "var(--success)" }} /><p style={{ color: "var(--success)", marginTop: "0.5rem" }}>Selfie captured</p></div>
              ) : (
                <div><Camera size={28} style={{ color: "var(--text-dim)" }} /><p style={{ color: "var(--text-dim)", marginTop: "0.5rem" }}>Click to open camera</p></div>
              )}
            </div>
            {selfieTaken && (
              <button className="btn-primary btn-sm" style={{ marginTop: "1rem" }} onClick={() => setCurrentStep(4)}>Submit for Review <ChevronRight size={14} /></button>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <Clock size={36} style={{ color: "var(--warning)", marginBottom: "1rem" }} />
            <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Under Review</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 420, margin: "0 auto" }}>Your documents have been submitted. Our team will review and verify your identity within 24 hours.</p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.25rem" }}>
              <span className="status-pill warning"><Clock size={14} /> Pending Review</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}