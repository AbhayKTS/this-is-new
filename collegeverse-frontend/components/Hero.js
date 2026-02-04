import { ArrowRight, BookOpen, Laptop2, GraduationCap } from "lucide-react";
import Link from "next/link";
import StatMarquee from "./StatMarquee";

const Hero = () => {
  return (
    <section id="home" className="hero-shell nebula-wrap">
      <div className="container">
        <div className="hero-layout glass-panel animate-slide-up">
          <div className="hero-copy">
            <span className="badge-pill">
              <span className="badge-dot" />
              Top 10,000 Students Across India
            </span>

            <h1 className="hero-title">
              Where Every Student <span className="title-gradient">Shines</span>
            </h1>

            <p className="hero-subtext">
              Unified ranking, verified credentials and college communities — CollegeVerse is the digital universe for every
              campus achiever.
            </p>

            <div className="hero-actions">
              <Link href="/login" className="cta-main">
                Join CollegeVerse
                <ArrowRight size={20} />
              </Link>
              <Link href="#features" className="cta-outline">
                Explore Features
              </Link>
            </div>

            <StatMarquee />
          </div>

          <div className="hero-visual">
            <div className="floating-orb orb-primary" />
            <div className="floating-orb orb-secondary" />

            <div className="holo-icon holo-book">
              <BookOpen size={40} />
            </div>
            <div className="holo-icon holo-laptop">
              <Laptop2 size={44} />
            </div>
            <div className="holo-icon holo-cap">
              <GraduationCap size={42} />
            </div>

            <div className="hero-board tilt-card">
              <header className="hero-board__header">
                <div className="hero-avatar">CV</div>
                <div>
                  <p className="hero-board__name">National Ranker</p>
                  <span className="hero-board__role">AI + Web3 Innovator</span>
                </div>
              </header>

              <ul className="hero-board__stats">
                <li>
                  <span className="label">XP Score</span>
                  <strong>9,650</strong>
                  <small>+320 this week</small>
                </li>
                <li>
                  <span className="label">Domains</span>
                  <strong>AI, DevRel</strong>
                  <small>Synced 4h ago</small>
                </li>
                <li>
                  <span className="label">Rewards</span>
                  <strong>12 NFTs</strong>
                  <small>$CVR · DAO Ready</small>
                </li>
              </ul>

              <div className="glimmer" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
