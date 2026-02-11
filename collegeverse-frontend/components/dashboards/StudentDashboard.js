import { useState } from "react";
import DashboardLayout from "../DashboardLayout";
import { useAuth } from "../AuthContext";
import Link from "next/link";
import { Zap, TrendingUp, Award, Briefcase, BookOpen, Users, ArrowRight, Star, Target, Calendar, Bell, ChevronRight, Flame } from "lucide-react";

const quickStats = [
  { label: "Total XP", value: "2,450", change: "+120 this week", icon: Zap, color: "var(--accent)" },
  { label: "Rank", value: "#42", change: "Up 8 spots", icon: TrendingUp, color: "var(--success)" },
  { label: "Badges", value: "7", change: "1 new this month", icon: Award, color: "var(--warning)" },
  { label: "Gigs Done", value: "12", change: "3 active", icon: Briefcase, color: "var(--info)" },
];

const recentActivity = [
  { id: 1, text: "Completed MicroGig: Poster Design for Pulse Records", time: "2h ago", type: "gig" },
  { id: 2, text: "Earned badge: Bug Hunter", time: "1d ago", type: "badge" },
  { id: 3, text: "Answered question in Q&A: React hooks best practices", time: "2d ago", type: "qa" },
  { id: 4, text: "Joined community: AI Builders Club", time: "3d ago", type: "community" },
  { id: 5, text: "Climbed 8 spots on national leaderboard", time: "5d ago", type: "rank" },
];

const upcomingEvents = [
  { id: 1, title: "Web3 Hackathon", date: "Jan 28", org: "IIT Bombay" },
  { id: 2, title: "Resume Workshop", date: "Feb 2", org: "Career Cell" },
  { id: 3, title: "AI Meetup", date: "Feb 10", org: "AI Builders" },
];

const activeGigs = [
  { id: 1, title: "Social Media Audit", brand: "Swiggy", deadline: "3 days left", progress: 60 },
  { id: 2, title: "Data Dashboard", brand: "Razorpay", deadline: "5 days left", progress: 25 },
];

export default function StudentDashboard() {
  const { user, userData } = useAuth();
  const displayName = userData?.displayName || user?.displayName || "Explorer";
  const streak = userData?.streak || 7;

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>Welcome back, <span className="text-gradient">{displayName}</span></h1>
          <span className="status-pill warning" style={{ display: "flex", alignItems: "center", gap: 4 }}><Flame size={14} /> {streak}-day streak</span>
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", margin: 0 }}>Here is your activity overview. Keep the momentum going!</p>
      </div>

      <div className="item-grid" style={{ marginBottom: "2rem" }}>
        {quickStats.map((s) => (
          <div key={s.label} className="stat-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--glass-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                <s.icon size={20} />
              </div>
            </div>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 0.1rem" }}>{s.value}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: "0 0 0.15rem" }}>{s.label}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--success)", margin: 0 }}>{s.change}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="section-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: 0 }}><Bell size={16} style={{ verticalAlign: "middle" }} /> Recent Activity</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {recentActivity.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0.75rem", borderRadius: 10, background: "var(--glass-bg)" }}>
                <span style={{ fontSize: "0.84rem", color: "var(--text-muted)", flex: 1 }}>{a.text}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", whiteSpace: "nowrap", marginLeft: "0.75rem" }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="section-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: "0 0 1rem" }}><Calendar size={16} style={{ verticalAlign: "middle" }} /> Upcoming Events</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {upcomingEvents.map((e) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: 10, background: "var(--glass-bg)" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1.1, textAlign: "center" }}>{e.date}</div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "white", fontWeight: 500, margin: 0 }}>{e.title}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", margin: 0 }}>{e.org}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: "0 0 1rem" }}><Target size={16} style={{ verticalAlign: "middle" }} /> Active Gigs</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {activeGigs.map((g) => (
                <div key={g.id} style={{ padding: "0.75rem", borderRadius: 10, background: "var(--glass-bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "white", fontWeight: 500 }}>{g.title}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--warning)" }}>{g.deadline}</span>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", margin: "0 0 0.5rem" }}>{g.brand}</p>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: g.progress + "%", borderRadius: 3, background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: "0 0 1rem" }}><Star size={16} style={{ verticalAlign: "middle" }} /> Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Browse Gigs", href: "/microgigs", icon: Briefcase },
            { label: "Q&A Forum", href: "/qa", icon: BookOpen },
            { label: "Leaderboard", href: "/leaderboard", icon: TrendingUp },
            { label: "Communities", href: "/communities", icon: Users },
            { label: "Explore Colleges", href: "/colleges", icon: Star },
            { label: "Verify Identity", href: "/verification", icon: Award },
          ].map((a) => (
            <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.85rem 1rem", borderRadius: 12, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", cursor: "pointer", transition: "border-color 0.2s" }}>
                <a.icon size={18} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: "0.85rem", color: "white", fontWeight: 500 }}>{a.label}</span>
                <ChevronRight size={14} style={{ color: "var(--text-dim)", marginLeft: "auto" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}