import { ArrowRight } from "lucide-react";
import Link from "next/link";
import StatMarquee from "./StatMarquee";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container hero-content">
        <div className="hero-text">
          <span className="badge-pill">
            <span className="badge-dot" />
            Top 10,000 Students Across India
          </span>

          <h1>
            Where Every Student <span className="text-gradient">Shines</span>
          </h1>

          <p>
            Unified ranking, verified credentials and college communities &mdash; CollegeVerse is the digital universe for every campus achiever.
          </p>

          <div className="hero-actions">
            <Link href="/login" className="btn-primary btn-lg">
              Join CollegeVerse <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="btn-ghost btn-lg">
              Explore Features
            </Link>
          </div>

          <StatMarquee />
        </div>

        <div className="hero-visual">
          <div className="floating-orb orb-1" />
          <div className="floating-orb orb-2" />
          <div className="floating-orb orb-3" />

          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-avatar">CV</div>
              <div>
                <p style={{ fontWeight: 600, color: "white", margin: 0 }}>National Ranker</p>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>AI + Web3 Innovator</span>
              </div>
            </div>
            <div className="hero-card-stats">
              <div className="hero-stat">
                <span className="label">XP Score</span>
                <div><strong>9,650</strong> <small>+320 this week</small></div>
              </div>
              <div className="hero-stat">
                <span className="label">Domains</span>
                <div><strong>AI, DevRel</strong> <small>Synced 4h ago</small></div>
              </div>
              <div className="hero-stat">
                <span className="label">Rewards</span>
                <div><strong>12 NFTs</strong> <small>$CVR Ready</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;