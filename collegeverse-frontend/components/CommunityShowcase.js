import { GraduationCap, Users2, Sparkles } from "lucide-react";
import Link from "next/link";

const CommunityShowcase = () => {
  return (
    <section className="community-shell">
      <div className="container">
        <div className="glass-panel community-grid">
          <div className="community-copy">
            <span className="badge-pill">
              <Sparkles size={18} />
              Campus x Industry
            </span>
            <h2>
              Plug into the <span className="title-gradient">CollegeVerse</span> network
            </h2>
            <p>
              Students, clubs, colleges, and recruiters share one aligned mission: unlock talent, reward contribution, and prove credibility across the nation.
            </p>
            <div className="cta-row">
              <Link href="/leaderboard" className="cta-pill">
                View live leaderboard
              </Link>
              <Link href="/microgigs" className="cta-outline">
                Browse MicroGigs
              </Link>
            </div>
          </div>

          <div className="community-grid__cards">
            <article className="tilt-card">
              <div className="feature-icon">
                <GraduationCap size={26} />
              </div>
              <h3 className="font-display" style={{ marginTop: "1.4rem", marginBottom: "0.5rem" }}>Colleges</h3>
              <p style={{ color: "rgba(202, 213, 255, 0.78)", lineHeight: 1.7 }}>
                Verify cohorts, launch inter-college quests, and track growth in real time with DAO-ready governance tools.
              </p>
            </article>

            <article className="tilt-card">
              <div className="feature-icon">
                <Users2 size={26} />
              </div>
              <h3 className="font-display" style={{ marginTop: "1.4rem", marginBottom: "0.5rem" }}>Recruiters</h3>
              <p style={{ color: "rgba(202, 213, 255, 0.78)", lineHeight: 1.7 }}>
                Spot on-chain verified profiles, shortlist faster, and engage future hires with real proof-of-work.
              </p>
            </article>

            <article className="tilt-card">
              <div className="feature-icon">
                <Sparkles size={26} />
              </div>
              <h3 className="font-display" style={{ marginTop: "1.4rem", marginBottom: "0.5rem" }}>Creators & Leaders</h3>
              <p style={{ color: "rgba(202, 213, 255, 0.78)", lineHeight: 1.7 }}>
                Host AMAs, drop quests, and mentor rising talent while earning $CVR rewards and soulbound recognition.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityShowcase;
