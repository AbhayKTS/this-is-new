import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Link from "next/link";
import { GraduationCap, Search, MapPin, Users, Star, ArrowRight, Filter } from "lucide-react";

const demoColleges = [
  { id: "1", name: "IIT Bombay", location: "Mumbai, MH", students: 12400, rating: 4.9, tags: ["IIT", "Engineering"], logo: null },
  { id: "2", name: "IIT Delhi", location: "New Delhi", students: 11200, rating: 4.8, tags: ["IIT", "Engineering"], logo: null },
  { id: "3", name: "BITS Pilani", location: "Pilani, RJ", students: 9800, rating: 4.7, tags: ["Private", "Engineering"], logo: null },
  { id: "4", name: "NIT Trichy", location: "Tiruchirappalli, TN", students: 7600, rating: 4.5, tags: ["NIT", "Engineering"], logo: null },
  { id: "5", name: "IIIT Hyderabad", location: "Hyderabad, TS", students: 4200, rating: 4.6, tags: ["IIIT", "CS"], logo: null },
  { id: "6", name: "VIT Vellore", location: "Vellore, TN", students: 22000, rating: 4.3, tags: ["Private", "Multi"], logo: null },
  { id: "7", name: "SRM Chennai", location: "Chennai, TN", students: 18000, rating: 4.2, tags: ["Private", "Multi"], logo: null },
  { id: "8", name: "DTU Delhi", location: "New Delhi", students: 8500, rating: 4.4, tags: ["State", "Engineering"], logo: null },
];

const allTags = Array.from(new Set(demoColleges.flatMap((c) => c.tags))).sort();

export default function Colleges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");

  const filtered = demoColleges.filter((c) => {
    if (activeTag !== "all" && !c.tags.includes(activeTag)) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout title="Colleges">
      <div className="page-hero">
        <span className="badge-pill"><GraduationCap size={14} /> Explore</span>
        <h1>Discover <span className="text-gradient">Colleges</span></h1>
        <p>Browse top institutions across India. Compare, connect, and find your fit.</p>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search colleges..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="filter-bar" style={{ paddingTop: 0 }}>
        <Filter size={14} style={{ color: "var(--text-dim)" }} />
        <button className={"filter-tab" + (activeTag === "all" ? " active" : "")} onClick={() => setActiveTag("all")}>All</button>
        {allTags.map((tag) => (
          <button key={tag} className={"filter-tab" + (activeTag === tag ? " active" : "")} onClick={() => setActiveTag(tag)}>{tag}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><GraduationCap size={28} /></div>
          <h3>No colleges found</h3>
          <p>Try a different search or filter.</p>
        </div>
      ) : (
        <div className="item-grid">
          {filtered.map((c) => (
            <div key={c.id} className="item-card">
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--glass-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem", fontSize: "1.2rem", fontWeight: 700, color: "var(--accent)" }}>
                {c.name.charAt(0)}
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "white", margin: "0 0 0.25rem" }}>{c.name}</h3>
              <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4, marginBottom: "0.5rem" }}><MapPin size={13} /> {c.location}</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                {c.tags.map((t) => <span key={t} className="status-pill info">{t}</span>)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", marginBottom: "1rem" }}>
                <span style={{ color: "var(--text-muted)" }}><Users size={13} style={{ verticalAlign: "middle" }} /> {c.students.toLocaleString()}</span>
                <span style={{ color: "var(--warning)", fontWeight: 600 }}><Star size={13} style={{ verticalAlign: "middle" }} /> {c.rating}</span>
              </div>
              <Link href={"/colleges/" + c.id} style={{ textDecoration: "none" }}>
                <button className="btn-secondary btn-sm" style={{ width: "100%" }}>View Profile <ArrowRight size={14} /></button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}