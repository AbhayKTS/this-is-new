import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../components/AuthContext";
import { Search, Filter, UserCheck, MessageSquare, Sparkles, TrendingUp, Star, Briefcase, ChevronRight, Users, Target, ArrowRight } from "lucide-react";

const candidates = [
  { id: 1, name: "Meera Kulkarni", college: "IISc Bangalore", domain: "AI Research", score: 9820, badges: ["Prompt Architect", "Hackathon Winner"], availability: "2 weeks notice" },
  { id: 2, name: "Ritvik Sharma", college: "NIFT Delhi", domain: "Product Design", score: 9585, badges: ["Design Systems", "Visual Storyteller"], availability: "Ready to join" },
  { id: 3, name: "Aanya Bose", college: "IIM Kozhikode", domain: "Business Strategy", score: 9490, badges: ["Growth Architect", "Top Mentor"], availability: "Open for consulting" },
  { id: 4, name: "Karthik Reddy", college: "IIT Madras", domain: "Backend Engineering", score: 9350, badges: ["System Designer", "Open Source"], availability: "Immediate" },
  { id: 5, name: "Priya Nair", college: "BITS Pilani", domain: "Data Science", score: 9210, badges: ["Kaggle Master", "ML Specialist"], availability: "1 month notice" },
];

const pipeline = [
  { stage: "Discovery", count: 24, highlight: "+5 vs last week", color: "var(--info)" },
  { stage: "Screening", count: 16, highlight: "Avg score 8.2", color: "var(--accent)" },
  { stage: "Interview", count: 11, highlight: "Avg score 8.7", color: "var(--warning)" },
  { stage: "Offer", count: 4, highlight: "Closing in 3 days", color: "var(--success)" },
];

const filters = ["Top 1%", "AI", "Design", "Product", "Marketing", "Engineering"];

export default function RecruiterDashboard() {
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Top 1%");

  const filtered = candidates.filter((c) => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout title="Recruiter Dashboard">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem" }}>Welcome, <span className="text-gradient">{userData?.displayName || "Recruiter"}</span></h1>
        <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", margin: 0 }}>Source verified talent from top institutions across India.</p>
      </div>

      <div className="item-grid" style={{ marginBottom: "2rem" }}>
        {pipeline.map((p) => (
          <div key={p.stage} className="stat-card" style={{ padding: "1.25rem", borderLeft: "3px solid " + p.color }}>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 0.1rem" }}>{p.count}</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", margin: "0 0 0.15rem" }}>{p.stage}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--success)", margin: 0 }}>{p.highlight}</p>
          </div>
        ))}
      </div>

      <div className="section-card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: 0 }}><Sparkles size={16} style={{ verticalAlign: "middle" }} /> Talent Pool</h3>
          <div className="search-bar" style={{ maxWidth: 280 }}>
            <Search size={16} />
            <input type="text" placeholder="Search talent..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {filters.map((f) => (
            <button key={f} className={"filter-tab" + (activeFilter === f ? " active" : "")} onClick={() => setActiveFilter(f)}>{f}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: 12, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", flexWrap: "wrap" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                {c.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "white", margin: "0 0 0.15rem" }}>{c.name}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>{c.college} &middot; {c.domain}</p>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                  {c.badges.map((b) => <span key={b} className="status-pill info" style={{ fontSize: "0.7rem" }}>{b}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: 120 }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)", margin: "0 0 0.15rem" }}>{c.score.toLocaleString()}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", margin: "0 0 0.4rem" }}>{c.availability}</p>
                <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end" }}>
                  <button className="btn-primary btn-sm"><UserCheck size={14} /> Shortlist</button>
                  <button className="btn-ghost btn-sm"><MessageSquare size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: "0 0 1rem" }}><Target size={16} style={{ verticalAlign: "middle" }} /> Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Post a MicroGig", href: "/microgigs", icon: Briefcase },
            { label: "Browse Leaderboard", href: "/leaderboard", icon: TrendingUp },
            { label: "View Colleges", href: "/colleges", icon: Star },
            { label: "Manage Pipeline", href: "#", icon: Users },
          ].map((a) => (
            <a key={a.label} href={a.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.85rem 1rem", borderRadius: 12, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", cursor: "pointer" }}>
                <a.icon size={18} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: "0.85rem", color: "white", fontWeight: 500 }}>{a.label}</span>
                <ChevronRight size={14} style={{ color: "var(--text-dim)", marginLeft: "auto" }} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}