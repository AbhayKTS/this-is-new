import { Crown, Flame, Medal } from "lucide-react";
import Link from "next/link";

const topPlayers = [
  { name: "Aarav Desai", college: "IIT Bombay", rank: "#1 Nationwide", progress: 92, icon: Crown },
  { name: "Nyra Kapoor", college: "BITS Pilani", rank: "#2 AI Innovator", progress: 88, icon: Flame },
  { name: "Kabir Malhotra", college: "SRM Chennai", rank: "#3 Web3 Builder", progress: 85, icon: Medal },
];

const LeaderboardPreview = () => {
  return (
    <section className="leaderboard-section">
      <div className="container">
        <div className="section-intro">
          <span className="badge-pill">Live Rankings</span>
          <h2>
            See who&apos;s <span className="text-gradient">leveling up</span> this week
          </h2>
          <p>Track momentum across coding arenas, hackathons, design showdowns, and community quests.</p>
        </div>

        <div className="leader-grid">
          {topPlayers.map(({ name, college, rank, progress, icon: Icon }) => (
            <article className="leader-card" key={name}>
              <div className="rank-chip">
                <Icon size={18} />
                {rank}
              </div>
              <h3 className="font-display" style={{ marginTop: "1.25rem", marginBottom: "0.35rem", color: "white" }}>{name}</h3>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>{college}</p>
              <div className="progress-bar">
                <span style={{ width: progress + "%" }} />
              </div>
              <p style={{ marginTop: "0.6rem", color: "var(--text-dim)", fontSize: "0.85rem" }}>Performance Index: {progress}%</p>
            </article>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/leaderboard" className="btn-secondary btn-lg">
            View full leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;