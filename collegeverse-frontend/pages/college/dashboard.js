import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../components/AuthContext";
import { GraduationCap, Users, TrendingUp, Award, Calendar, Bell, Shield, ChevronRight, BarChart3, UserCheck, Star, BookOpen } from "lucide-react";

const overviewStats = [
  { label: "Total Students", value: "12,450", change: "+230 this month", icon: Users, color: "var(--accent)" },
  { label: "Verified Seniors", value: "1,840", change: "+45 this week", icon: Shield, color: "var(--success)" },
  { label: "Avg XP Score", value: "3,200", change: "+180 avg", icon: TrendingUp, color: "var(--warning)" },
  { label: "Active Gigs", value: "28", change: "6 new today", icon: Award, color: "var(--info)" },
];

const pendingVerifications = [
  { id: 1, name: "Rahul Verma", branch: "CSE", year: "3rd", submitted: "2h ago" },
  { id: 2, name: "Sneha Patel", branch: "ECE", year: "4th", submitted: "5h ago" },
  { id: 3, name: "Arjun Das", branch: "Mech", year: "3rd", submitted: "1d ago" },
];

const topStudents = [
  { rank: 1, name: "Meera Kulkarni", xp: 9820, badges: 14, domain: "AI Research" },
  { rank: 2, name: "Karthik Reddy", xp: 9350, badges: 12, domain: "Backend" },
  { rank: 3, name: "Priya Nair", xp: 9210, badges: 11, domain: "Data Science" },
  { rank: 4, name: "Aditya Shah", xp: 8940, badges: 10, domain: "Frontend" },
  { rank: 5, name: "Divya Singh", xp: 8760, badges: 9, domain: "Design" },
];

const upcomingEvents = [
  { id: 1, title: "Inter-College Hackathon", date: "Feb 5-6", participants: 340 },
  { id: 2, title: "Career Fair 2025", date: "Feb 15", participants: 1200 },
  { id: 3, title: "AI Workshop Series", date: "Feb 20", participants: 85 },
];

export default function CollegeDashboard() {
  const { userData } = useAuth();

  return (
    <DashboardLayout title="College Dashboard">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem" }}>
          <span className="text-gradient">{userData?.collegeName || "College"}</span> Control Center
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", margin: 0 }}>Manage your institution, verify students, and track campus performance.</p>
      </div>

      <div className="item-grid" style={{ marginBottom: "2rem" }}>
        {overviewStats.map((s) => (
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
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: 0 }}><UserCheck size={16} style={{ verticalAlign: "middle" }} /> Pending Verifications</h3>
            <span className="status-pill warning">{pendingVerifications.length} pending</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {pendingVerifications.map((v) => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", borderRadius: 10, background: "var(--glass-bg)" }}>
                <div>
                  <p style={{ fontSize: "0.88rem", color: "white", fontWeight: 500, margin: "0 0 0.15rem" }}>{v.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", margin: 0 }}>{v.branch} &middot; {v.year} &middot; {v.submitted}</p>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button className="btn-primary btn-sm">Approve</button>
                  <button className="btn-ghost btn-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: "0 0 1rem" }}><Calendar size={16} style={{ verticalAlign: "middle" }} /> Upcoming Events</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {upcomingEvents.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", borderRadius: 10, background: "var(--glass-bg)" }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1.1, textAlign: "center" }}>{e.date}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.88rem", color: "white", fontWeight: 500, margin: "0 0 0.1rem" }}>{e.title}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", margin: 0 }}>{e.participants} registrations</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: "0 0 1rem" }}><Star size={16} style={{ verticalAlign: "middle" }} /> Top Performing Students</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Rank</th><th>Name</th><th>Domain</th><th>XP</th><th>Badges</th></tr>
            </thead>
            <tbody>
              {topStudents.map((s) => (
                <tr key={s.rank}>
                  <td><span style={{ color: s.rank <= 3 ? "var(--warning)" : "var(--text-dim)", fontWeight: 600 }}>#{s.rank}</span></td>
                  <td style={{ color: "white", fontWeight: 500 }}>{s.name}</td>
                  <td><span className="status-pill info">{s.domain}</span></td>
                  <td style={{ color: "var(--accent)", fontWeight: 600 }}>{s.xp.toLocaleString()}</td>
                  <td>{s.badges}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}