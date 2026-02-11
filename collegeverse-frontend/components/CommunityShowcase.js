import { GraduationCap, Users2, Sparkles } from "lucide-react";
import Link from "next/link";

const CommunityShowcase = () => {
  return (
    <section className="community-section">
      <div className="container">
        <div className="community-layout">
          <div className="community-text">
            <span className="badge-pill">
              <Sparkles size={16} /> Campus x Industry
            </span>
            <h2>
              Plug into the <span className="text-gradient">CollegeVerse</span> network
            </h2>
            <p>
              Students, clubs, colleges, and recruiters share one aligned mission: unlock talent, reward contribution, and prove credibility across the nation.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/leaderboard" className="btn-primary">View live leaderboard</Link>
              <Link href="/microgigs" className="btn-ghost">Browse MicroGigs</Link>
            </div>
          </div>

          <div className="community-cards">
            <article className="glass-card" style={{ padding: "1.5rem" }}>
              <div className="feature-icon"><GraduationCap size={24} /></div>
              <h3 className="font-display" style={{ margin: "1rem 0 0.5rem", color: "white" }}>Colleges</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                Verify cohorts, launch inter-college quests, and track growth in real time.
              </p>
            </article>
            <article className="glass-card" style={{ padding: "1.5rem" }}>
              <div className="feature-icon"><Users2 size={24} /></div>
              <h3 className="font-display" style={{ margin: "1rem 0 0.5rem", color: "white" }}>Recruiters</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                Spot on-chain verified profiles, shortlist faster, and engage future hires.
              </p>
            </article>
            <article className="glass-card" style={{ padding: "1.5rem" }}>
              <div className="feature-icon"><Sparkles size={24} /></div>
              <h3 className="font-display" style={{ margin: "1rem 0 0.5rem", color: "white" }}>Creators</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                Host AMAs, drop quests, and mentor rising talent while earning rewards.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityShowcase;