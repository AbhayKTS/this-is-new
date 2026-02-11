import { useState } from "react";
import Link from "next/link";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Search, MapPin, Star, TrendingUp, Building2, GraduationCap, Scale, ArrowRight, Filter, Users } from "lucide-react";

const sampleColleges = [
  { id: "iit-bombay", name: "IIT Bombay", shortName: "IIT Bombay", city: "Mumbai", state: "Maharashtra", type: "Government", rating: 4.7, ratings: 1250, avgPkg: 21.5, highPkg: 280 },
  { id: "bits-pilani", name: "BITS Pilani", shortName: "BITS Pilani", city: "Pilani", state: "Rajasthan", type: "Private", rating: 4.5, ratings: 890, avgPkg: 18.5, highPkg: 150 },
  { id: "iit-delhi", name: "IIT Delhi", shortName: "IIT Delhi", city: "New Delhi", state: "Delhi", type: "Government", rating: 4.8, ratings: 1100, avgPkg: 22.0, highPkg: 300 },
  { id: "nit-trichy", name: "NIT Trichy", shortName: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu", type: "Government", rating: 4.4, ratings: 760, avgPkg: 14.5, highPkg: 85 },
  { id: "vit-vellore", name: "VIT Vellore", shortName: "VIT Vellore", city: "Vellore", state: "Tamil Nadu", type: "Private", rating: 4.2, ratings: 1500, avgPkg: 8.5, highPkg: 50 },
  { id: "iiit-hyderabad", name: "IIIT Hyderabad", shortName: "IIIT Hyderabad", city: "Hyderabad", state: "Telangana", type: "Government", rating: 4.6, ratings: 680, avgPkg: 19.0, highPkg: 120 },
];

const typeFilters = ["All", "Government", "Private"];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [compareList, setCompareList] = useState([]);

  const filtered = sampleColleges.filter((c) => {
    if (typeFilter !== "All" && c.type !== typeFilter) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleCompare = (id) => {
    setCompareList((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  return (
    <div>
      <NavBar />
      <main style={{ minHeight: "100vh", paddingTop: "5rem" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div className="page-hero">
            <span className="badge-pill"><GraduationCap size={14} /> Explorer Mode</span>
            <h1>Explore <span className="text-gradient">Colleges</span></h1>
            <p>Browse ratings, placements, and campus life reviews from verified students. No login required.</p>
          </div>

          <div className="filter-bar">
            <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
              <Search size={16} />
              <input type="text" placeholder="Search by college or city..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {typeFilters.map((t) => (
                <button key={t} className={"filter-tab" + (typeFilter === t ? " active" : "")} onClick={() => setTypeFilter(t)}>{t}</button>
              ))}
            </div>
          </div>

          {compareList.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", padding: "0.75rem 1rem", borderRadius: 12, background: "var(--glass-bg)", border: "1px solid var(--accent)" }}>
              <Scale size={16} style={{ color: "var(--accent)" }} />
              <span style={{ color: "white", fontSize: "0.85rem", fontWeight: 500 }}>{compareList.length}/3 selected</span>
              <Link href={"/colleges/compare?ids=" + compareList.join(",")} style={{ marginLeft: "auto", textDecoration: "none" }}>
                <button className="btn-primary btn-sm">Compare <ArrowRight size={14} /></button>
              </Link>
            </div>
          )}

          <div className="item-grid">
            {filtered.map((c) => {
              const selected = compareList.includes(c.id);
              return (
                <div key={c.id} className="item-card" style={{ border: selected ? "1px solid var(--accent)" : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, color: "white" }}>
                      {c.shortName.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: 0 }}>{c.shortName}</h3>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0, display: "flex", alignItems: "center", gap: 3 }}><MapPin size={12} /> {c.city}, {c.state}</p>
                    </div>
                  </div>
                  <span className={"status-pill " + (c.type === "Government" ? "success" : "info")} style={{ marginBottom: "0.75rem" }}>{c.type}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.82rem" }}>
                    <div><span style={{ color: "var(--text-dim)" }}>Rating</span><p style={{ color: "var(--warning)", fontWeight: 600, margin: "0.15rem 0 0" }}><Star size={13} style={{ verticalAlign: "middle" }} /> {c.rating} <span style={{ fontWeight: 400, color: "var(--text-dim)" }}>({c.ratings})</span></p></div>
                    <div><span style={{ color: "var(--text-dim)" }}>Avg Package</span><p style={{ color: "var(--success)", fontWeight: 600, margin: "0.15rem 0 0" }}>{c.avgPkg} LPA</p></div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={"/colleges/" + c.id} style={{ flex: 1, textDecoration: "none" }}><button className="btn-secondary btn-sm" style={{ width: "100%" }}>View <ArrowRight size={14} /></button></Link>
                    <button className={"btn-sm " + (selected ? "btn-primary" : "btn-ghost")} onClick={() => toggleCompare(c.id)} title="Compare"><Scale size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={28} /></div>
              <h3>No colleges found</h3>
              <p>Try a different search term.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}