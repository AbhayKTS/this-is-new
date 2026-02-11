import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../components/AuthContext";
import { Users, Search, Plus, MessageSquare, ArrowRight, TrendingUp } from "lucide-react";

const demoCommunities = [
  { id: "1", name: "IIT Bombay Hub", description: "Connect with students and alumni from IIT Bombay", members: 2450, college: "IIT Bombay", location: "Mumbai", posts: 340, trending: true },
  { id: "2", name: "BITS Pilani Network", description: "Official community for BITS Pilani students", members: 1820, college: "BITS Pilani", location: "Rajasthan", posts: 210, trending: false },
  { id: "3", name: "NIT Trichy Connect", description: "Share experiences and get guidance from NIT Trichy seniors", members: 1340, college: "NIT Trichy", location: "Tamil Nadu", posts: 180, trending: true },
  { id: "4", name: "VIT Vellore Community", description: "For all VITians - current students and alumni", members: 3200, college: "VIT Vellore", location: "Tamil Nadu", posts: 520, trending: false },
  { id: "5", name: "Delhi University Forum", description: "DU students unite - academics, events, and more", members: 2800, college: "Delhi University", location: "Delhi", posts: 410, trending: true },
  { id: "6", name: "SRM Universe", description: "The official SRM student community hub", members: 1960, college: "SRM Chennai", location: "Chennai", posts: 290, trending: false },
];

export default function Communities() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = demoCommunities.filter((c) =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Communities">
      <div className="page-hero">
        <span className="badge-pill"><Users size={14} /> Campus Hubs</span>
        <h1>Find your <span className="text-gradient">community</span></h1>
        <p>Join college hubs, connect with peers, and stay updated with campus life.</p>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search communities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        {isAuthenticated && (
          <button className="btn-primary btn-sm" style={{ marginLeft: "auto" }}><Plus size={16} /> Create Community</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={28} /></div>
          <h3>No communities found</h3>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className="item-grid">
          {filtered.map((c) => (
            <div key={c.id} className="item-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>
                  {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                {c.trending && <span className="status-pill info"><TrendingUp size={12} /> Trending</span>}
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "white", margin: "0 0 0.35rem" }}>{c.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "1rem" }}>{c.description}</p>
              <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: "1rem" }}>
                <span><Users size={14} style={{ verticalAlign: "middle" }} /> {c.members.toLocaleString()} members</span>
                <span><MessageSquare size={14} style={{ verticalAlign: "middle" }} /> {c.posts} posts</span>
              </div>
              <button className="btn-secondary btn-sm" style={{ width: "100%" }}>
                Join Community <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}