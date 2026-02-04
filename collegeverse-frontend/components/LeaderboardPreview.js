import { Crown, Flame, Medal } from "lucide-react";
import Link from "next/link";

const topPlayers = [
  {
    name: "Aarav Desai",
    college: "IIT Bombay",
    rank: "#1 Nationwide",
    progress: 92,
    icon: Crown,
  },
  {
    name: "Nyra Kapoor",
    college: "BITS Pilani",
    rank: "#2 AI Innovator",
    progress: 88,
    icon: Flame,
  },
  {
    name: "Kabir Malhotra",
    college: "SRM Chennai",
    rank: "#3 Web3 Builder",
    progress: 85,
    icon: Medal,
  },
];

const LeaderboardPreview = () => {
  return (
    <section id="leaderboard" className="leaderboard-shell">
      <div className="container">
        <div className="section-intro">
          <span className="badge-pill">Live Rankings</span>
          <h2>
            See who&apos;s <span className="title-gradient">leveling up</span> this week
          </h2>
          <p>Track momentum across coding arenas, hackathons, design showdowns, and community quests.</p>
        </div>

        <div className="leaderboard-grid">
          {topPlayers.map(({ name, college, rank, progress, icon: Icon }) => (
            <article className="leader-card" key={name}>
              <div className="rank-chip">
                <Icon size={18} />
                {rank}
              </div>
              <h3 className="font-display" style={{ marginTop: "1.4rem", marginBottom: "0.35rem", color: "white" }}>{name}</h3>
              <p style={{ margin: 0, color: "rgba(202, 213, 255, 0.78)" }}>{college}</p>
              <div className="progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
              <p style={{ marginTop: "0.75rem", color: "rgba(180, 196, 255, 0.7)", fontSize: "0.9rem" }}>Performance Index: {progress}%</p>
            </article>
          ))}
        </div>

        <div className="leaderboard-footer">
          <Link href="/leaderboard" className="cta-outline">
            View full leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;
