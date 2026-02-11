import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { ArrowUp, ArrowDown, Trophy, Target, TrendingUp, Filter } from "lucide-react";

const tabs = [
  { id: "national", label: "All India" },
  { id: "domain", label: "Domain-wise" },
  { id: "college", label: "College-wise" },
];

const demoRows = [
  { rank: 1, name: "Aarav Desai", college: "IIT Bombay", domain: "AI", score: 9860, movement: "up" },
  { rank: 2, name: "Nyra Kapoor", college: "BITS Pilani", domain: "Product", score: 9735, movement: "up" },
  { rank: 3, name: "Kabir Malhotra", college: "SRM Chennai", domain: "Web3", score: 9610, movement: "down" },
  { rank: 4, name: "Ira Mehta", college: "IIM Indore", domain: "BBA+MBA", score: 9488, movement: "up" },
  { rank: 5, name: "Zain Khan", college: "VJTI", domain: "CyberSec", score: 9340, movement: "up" },
  { rank: 6, name: "Meera Das", college: "NIT Trichy", domain: "Data Science", score: 9220, movement: "down" },
  { rank: 7, name: "Rohan Nair", college: "VIT Vellore", domain: "DevOps", score: 9100, movement: "up" },
  { rank: 8, name: "Sneha Gupta", college: "Delhi University", domain: "Design", score: 8975, movement: "up" },
  { rank: 9, name: "Arjun Patel", college: "IIIT Hyderabad", domain: "ML", score: 8850, movement: "down" },
  { rank: 10, name: "Priya Sharma", college: "Manipal University", domain: "Finance", score: 8720, movement: "up" },
];

const summary = { percentile: 75, trendDelta: 12, totalRanked: 10000, domainsTracked: 32 };

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("national");
  const [selectedDomain, setSelectedDomain] = useState("all");

  const domains = ["all", ...Array.from(new Set(demoRows.map((r) => r.domain)))];
  const filtered = selectedDomain === "all" ? demoRows : demoRows.filter((r) => r.domain === selectedDomain);

  const getRankClass = (rank) => {
    if (rank === 1) return "rank-1";
    if (rank === 2) return "rank-2";
    if (rank === 3) return "rank-3";
    return "rank-default";
  };

  return (
    <DashboardLayout title="Leaderboard">
      <div className="page-hero">
        <span className="badge-pill"><Trophy size={14} /> Live Rankings</span>
        <h1>National <span className="text-gradient">Leaderboard</span></h1>
        <p>Track momentum across coding arenas, hackathons, and community quests.</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-icon indigo"><Target size={20} /></div>
          <div className="stat-value">{summary.totalRanked.toLocaleString()}</div>
          <div className="stat-label">Students Ranked</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><TrendingUp size={20} /></div>
          <div className="stat-value">{summary.domainsTracked}</div>
          <div className="stat-label">Domains Tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon violet"><Trophy size={20} /></div>
          <div className="stat-value">Top {summary.percentile}%</div>
          <div className="stat-label">Your Percentile</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald"><ArrowUp size={20} /></div>
          <div className="stat-value">+{summary.trendDelta}</div>
          <div className="stat-label">Weekly Trend</div>
          <div className="stat-delta positive">Climbing</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button key={tab.id} className={`tab${activeTab === tab.id ? " active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Domain Filter */}
      {activeTab === "domain" && (
        <div className="filter-bar">
          <Filter size={16} style={{ color: "var(--text-dim)" }} />
          {domains.map((d) => (
            <button key={d} className={`filter-tab${selectedDomain === d ? " active" : ""}`} onClick={() => setSelectedDomain(d)}>
              {d === "all" ? "All Domains" : d}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Domain</th>
            <th>Score</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.rank}>
              <td><span className={`rank-badge ${getRankClass(row.rank)}`}>{row.rank}</span></td>
              <td>
                <div className="player-info">
                  <div className="player-avatar">{row.name.split(" ").map((n) => n[0]).join("")}</div>
                  <div>
                    <div className="player-name">{row.name}</div>
                    <div className="player-college">{row.college}</div>
                  </div>
                </div>
              </td>
              <td><span className="status-pill info">{row.domain}</span></td>
              <td><span className="score-value">{row.score.toLocaleString()}</span></td>
              <td>
                {row.movement === "up" ? (
                  <span className="movement-up"><ArrowUp size={16} /></span>
                ) : (
                  <span className="movement-down"><ArrowDown size={16} /></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}