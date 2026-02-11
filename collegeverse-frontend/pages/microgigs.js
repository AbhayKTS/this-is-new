import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../components/AuthContext";
import { Briefcase, Search, Clock, Zap, ArrowRight, CheckCircle, Filter } from "lucide-react";

const demoGigs = [
  { id: "1", title: "Design a festival poster", brand: "Pulse Records", reward: "200 credits", duration: "Due in 4 days", tags: ["Design", "Remote", "Paid"], blurb: "Create a poster that captures the energy of India's largest indie music festival." },
  { id: "2", title: "Campus ambassador sprint", brand: "Notion", reward: "Badge + 120 credits", duration: "Starts next week", tags: ["Marketing", "Hybrid"], blurb: "Run a 7-day productivity challenge for your campus." },
  { id: "3", title: "Prototype onboarding flow", brand: "Zepto", reward: "INR 6,000 stipend", duration: "Due in 6 days", tags: ["Product", "UX", "Sprint"], blurb: "Map and prototype a frictionless onboarding journey for new delivery partners." },
  { id: "4", title: "AI resume polish", brand: "Superhuman", reward: "110 credits", duration: "Due in 2 days", tags: ["AI", "Writing", "Remote"], blurb: "Use our AI tooling to transform 15 raw resumes into narrative-rich profiles." },
  { id: "5", title: "Social media audit", brand: "Swiggy", reward: "180 credits", duration: "Due in 5 days", tags: ["Marketing", "Remote"], blurb: "Audit and recommend improvements for campus delivery social handles." },
  { id: "6", title: "Data visualization dashboard", brand: "Razorpay", reward: "INR 8,000 stipend", duration: "Due in 7 days", tags: ["Data", "Frontend", "Paid"], blurb: "Build an interactive dashboard visualizing fintech transaction patterns." },
];

const allTags = Array.from(new Set(demoGigs.flatMap((g) => g.tags))).sort();

export default function MicroGigs() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");

  const filtered = demoGigs.filter((g) => {
    if (activeTag !== "all" && !g.tags.includes(activeTag)) return false;
    if (searchQuery && !g.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout title="MicroGigs">
      <div className="page-hero">
        <span className="badge-pill"><Briefcase size={14} /> Earn & Learn</span>
        <h1>MicroGigs <span className="text-gradient">Marketplace</span></h1>
        <p>Industry-grade tasks designed to build your portfolio and earn real rewards.</p>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search gigs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="filter-bar" style={{ paddingTop: 0 }}>
        <Filter size={14} style={{ color: "var(--text-dim)" }} />
        <button className={`filter-tab${activeTag === "all" ? " active" : ""}`} onClick={() => setActiveTag("all")}>All</button>
        {allTags.map((tag) => (
          <button key={tag} className={`filter-tab${activeTag === tag ? " active" : ""}`} onClick={() => setActiveTag(tag)}>{tag}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Briefcase size={28} /></div>
          <h3>No gigs found</h3>
          <p>Try changing your filters.</p>
        </div>
      ) : (
        <div className="item-grid">
          {filtered.map((g) => (
            <div key={g.id} className="item-card">
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                {g.tags.map((t) => <span key={t} className="status-pill info">{t}</span>)}
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "white", margin: "0 0 0.35rem" }}>{g.title}</h3>
              <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{g.brand}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "1rem" }}>{g.blurb}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}><Zap size={14} style={{ verticalAlign: "middle" }} /> {g.reward}</span>
                <span style={{ color: "var(--text-dim)" }}><Clock size={14} style={{ verticalAlign: "middle" }} /> {g.duration}</span>
              </div>
              {isAuthenticated ? (
                <button className="btn-primary btn-sm" style={{ width: "100%" }}>Apply Now <ArrowRight size={14} /></button>
              ) : (
                <button className="btn-secondary btn-sm" style={{ width: "100%" }}>Sign in to apply</button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}