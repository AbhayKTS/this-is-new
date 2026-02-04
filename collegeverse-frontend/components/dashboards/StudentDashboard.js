import NavBar from "../NavBar";
import {
  BadgeCheck,
  Github,
  Brain,
  Trophy,
  Target,
  Briefcase,
  Rocket,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

const sidebarLinks = [
  { label: "Profile", active: true },
  { label: "Integrations" },
  { label: "Achievements" },
  { label: "Settings" },
];

const integrations = [
  {
    name: "GitHub",
    status: "Connected",
    lastSync: "2h ago",
    icon: Github,
  },
  {
    name: "LeetCode",
    status: "Connected",
    lastSync: "Yesterday",
    icon: Brain,
  },
  {
    name: "Codeforces",
    status: "Sync needed",
    lastSync: "3 days ago",
    icon: Rocket,
  },
];

const StudentDashboard = () => {
  return (
    <div className="dashboard-shell">
      <NavBar />
      <main className="dashboard-body">
        <aside className="dashboard-sidebar glass-panel">
          <div className="sidebar-heading">
            <span>Workspace</span>
          </div>
          <nav className="sidebar-nav">
            {sidebarLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                className={`sidebar-link${link.active ? " active" : ""}`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="dashboard-main">
          <header className="dashboard-hero glass-panel">
            <div className="hero-meta">
              <div className="avatar-bubble">AD</div>
              <div>
                <div className="hero-name">
                  Aarav Desai
                  <span className="verified-badge">
                    <BadgeCheck size={16} /> Verified by IIT Bombay
                  </span>
                </div>
                <p>AI & Web3 Innovator · Batch of 2026</p>
              </div>
            </div>
            <div className="hero-metrics">
              <div className="metric">
                <span className="metric-label">National Rank</span>
                <strong>#08</strong>
              </div>
              <div className="metric">
                <span className="metric-label">College Rank</span>
                <strong>#01</strong>
              </div>
              <div className="metric">
                <span className="metric-label">XP Level</span>
                <div className="metric-progress">
                  <span style={{ width: "72%" }} />
                  <small>72% to Level 07</small>
                </div>
              </div>
            </div>
          </header>

          <div className="dashboard-grid">
            <article className="dashboard-card glass-panel">
              <header className="card-header">
                <span className="card-icon">
                  <Briefcase size={20} />
                </span>
                <h3>Connected Platforms</h3>
              </header>
              <div className="connected-grid">
                {integrations.map((item) => (
                  <div key={item.name} className={`platform-card${item.status === "Connected" ? "" : " muted"}`}>
                    <span className="platform-icon">
                      <item.icon size={20} />
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.status}</p>
                    </div>
                    <span className="timestamp">Last sync {item.lastSync}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-card glass-panel">
              <header className="card-header">
                <span className="card-icon">
                  <Trophy size={20} />
                </span>
                <h3>My Rank & Score</h3>
              </header>
              <div className="rank-details">
                <div className="rank-pill">Global Rank #08</div>
                <div className="rank-pill secondary">College Rank #01</div>
              </div>
              <div className="score-bar">
                <span style={{ width: "86%" }} />
              </div>
              <p className="score-caption">Performance Index: 8620 pts · 14% growth this week</p>
            </article>

            <article className="dashboard-card glass-panel">
              <header className="card-header">
                <span className="card-icon">
                  <Target size={20} />
                </span>
                <h3>My Domain</h3>
              </header>
              <p className="card-text">Primary track: B.Tech Computer Science · AI Specialisation</p>
              <button type="button" className="cta-outline" style={{ width: "fit-content" }}>
                View AI Leaderboard
                <ArrowUpRight size={16} />
              </button>
            </article>

            <article className="dashboard-card glass-panel">
              <header className="card-header">
                <span className="card-icon">
                  <Briefcase size={20} />
                </span>
                <h3>My MicroGigs</h3>
              </header>
              <ul className="micro-list">
                <li>
                  <div>
                    <strong>Polygon DevRel Sprint</strong>
                    <p>Submission pending · due in 2 days</p>
                  </div>
                  <span className="status-pill warning">In progress</span>
                </li>
                <li>
                  <div>
                    <strong>AI Research Fellowship</strong>
                    <p>Review round unlocked</p>
                  </div>
                  <span className="status-pill success">Completed</span>
                </li>
                <li>
                  <div>
                    <strong>Campus Mentor Program</strong>
                    <p>3 sessions scheduled</p>
                  </div>
                  <span className="status-pill info">Active</span>
                </li>
              </ul>
            </article>

            <article className="dashboard-card glass-panel">
              <header className="card-header">
                <span className="card-icon">
                  <Wallet size={20} />
                </span>
                <h3>Rewards</h3>
              </header>
              <div className="rewards-grid">
                <div className="reward-tile">
                  <strong>2,450</strong>
                  <span>$CVR Tokens</span>
                </div>
                <div className="reward-tile">
                  <strong>6</strong>
                  <span>Verified NFTs</span>
                </div>
                <div className="reward-tile">
                  <strong>4</strong>
                  <span>Soulbound Badges</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
