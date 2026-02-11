import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../components/AuthContext";
import { User, Mail, Phone, MapPin, Github, Linkedin, Globe, Award, BookOpen, Edit3, Save, X, Shield, Star, Briefcase, Code } from "lucide-react";

export default function StudentProfile() {
  const { user, userData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || user?.displayName || "Explorer",
    bio: userData?.bio || "A curious mind exploring the universe of knowledge.",
    college: userData?.college || "",
    branch: userData?.branch || "",
    year: userData?.year || "",
    phone: userData?.phone || "",
    github: userData?.github || "",
    linkedin: userData?.linkedin || "",
    portfolio: userData?.portfolio || "",
    skills: userData?.skills || ["JavaScript", "React", "Node.js"],
  });

  const handleSave = () => setEditing(false);

  const stats = [
    { label: "XP Earned", value: "2,450", icon: Star },
    { label: "Gigs Done", value: "12", icon: Briefcase },
    { label: "Badges", value: "7", icon: Award },
    { label: "Projects", value: "5", icon: Code },
  ];

  const badges = [
    { name: "Early Adopter", colour: "var(--accent)" },
    { name: "Bug Hunter", colour: "var(--success)" },
    { name: "Community Star", colour: "var(--warning)" },
    { name: "Code Ninja", colour: "var(--info)" },
  ];

  return (
    <DashboardLayout title="My Profile">
      <div className="profile-header" style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
          {(formData.displayName || "E").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {editing ? (
            <input className="form-input" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} />
          ) : (
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem" }}>{formData.displayName}</h2>
          )}
          <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }}>
            <Mail size={14} /> {user?.email || "Not signed in"}
          </p>
          {editing ? (
            <textarea className="form-input" rows={2} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} style={{ marginTop: "0.5rem" }} />
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.5rem", lineHeight: 1.6 }}>{formData.bio}</p>
          )}
          <div style={{ marginTop: "0.75rem" }}>
            {editing ? (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn-primary btn-sm" onClick={handleSave}><Save size={14} /> Save</button>
                <button className="btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
              </div>
            ) : (
              <button className="btn-secondary btn-sm" onClick={() => setEditing(true)}><Edit3 size={14} /> Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      <div className="item-grid" style={{ marginBottom: "2rem" }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--glass-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}><s.icon size={20} /></div>
            <div>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", marginBottom: "1rem" }}><BookOpen size={16} style={{ verticalAlign: "middle" }} /> Academic Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { label: "College", key: "college", icon: MapPin, placeholder: "Your college" },
            { label: "Branch", key: "branch", icon: BookOpen, placeholder: "e.g. CSE" },
            { label: "Year", key: "year", icon: Shield, placeholder: "e.g. 3rd Year" },
            { label: "Phone", key: "phone", icon: Phone, placeholder: "+91 ..." },
          ].map((f) => (
            <div key={f.key}>
              <label style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><f.icon size={13} /> {f.label}</label>
              {editing ? (
                <input className="form-input" placeholder={f.placeholder} value={formData[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} />
              ) : (
                <p style={{ color: "white", fontSize: "0.9rem", margin: 0 }}>{formData[f.key] || "—"}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", marginBottom: "1rem" }}><Globe size={16} style={{ verticalAlign: "middle" }} /> Social Links</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {[
            { label: "GitHub", key: "github", icon: Github, placeholder: "https://github.com/..." },
            { label: "LinkedIn", key: "linkedin", icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
            { label: "Portfolio", key: "portfolio", icon: Globe, placeholder: "https://..." },
          ].map((f) => (
            <div key={f.key}>
              <label style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><f.icon size={13} /> {f.label}</label>
              {editing ? (
                <input className="form-input" placeholder={f.placeholder} value={formData[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} />
              ) : (
                <p style={{ color: formData[f.key] ? "var(--info)" : "var(--text-dim)", fontSize: "0.9rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{formData[f.key] || "—"}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", marginBottom: "1rem" }}><Award size={16} style={{ verticalAlign: "middle" }} /> Badges & Achievements</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {badges.map((b) => (
            <div key={b.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: 999, background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <Award size={16} style={{ color: b.colour }} />
              <span style={{ color: "white", fontSize: "0.85rem", fontWeight: 500 }}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", marginBottom: "1rem" }}><Code size={16} style={{ verticalAlign: "middle" }} /> Skills</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {formData.skills.map((s) => (
            <span key={s} className="status-pill info">{s}</span>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}