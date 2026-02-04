import { ShieldCheck, Sparkles, Briefcase, Users } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Verified On-Chain Identity",
    description:
      "Polygon-powered credentials, SBTs, and NFT trophies certify every hackathon, competition, and campus milestone.",
    icon: <ShieldCheck size={26} />,
  },
  {
    title: "AI Rank Intelligence",
    description:
      "Domain-wise scorecards, leaderboard heatmaps, and predictive growth paths powered by AI and real metrics.",
    icon: <Sparkles size={26} />,
  },
  {
    title: "MicroGigs Marketplace",
    description:
      "Gig quests designed by colleges and recruiters to earn XP, unlock mentors, and redeem $CVR rewards.",
    icon: <Briefcase size={26} />,
  },
  {
    title: "Community Launchpads",
    description:
      "College hubs, DAO voting, and hack squads that keep builders, creators, and leaders aligned toward impact.",
    icon: <Users size={26} />,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="features-shell">
      <div className="container">
        <div className="section-intro">
          <span className="badge-pill">A Universe Built For Students</span>
          <h2>
            A single passport <span className="title-gradient">for skills, ranks & rewards</span>
          </h2>
          <p>
            CollegeVerse fuses the energy of campus life with cross-domain achievements, verified records, and future-ready opportunities.
          </p>
        </div>

        <div className="card-grid">
          {features.map((feature) => (
            <article className="tilt-card feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="font-display" style={{ marginTop: "1.4rem", marginBottom: "0.75rem" }}>{feature.title}</h3>
              <p style={{ color: "rgba(202, 213, 255, 0.78)", lineHeight: 1.75 }}>{feature.description}</p>
              <Link href="#" className="ghost-pill">
                Learn more
                <Sparkles size={18} />
              </Link>
            </article>
          ))}
        </div>

        <div className="glass-panel" style={{ marginTop: "4.5rem" }}>
          <div className="community-copy" style={{ textAlign: "center" }}>
            <h3 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: 0 }}>
              Ready to join the universe?
            </h3>
            <p style={{ maxWidth: 560, margin: "0 auto", color: "rgba(202, 213, 255, 0.78)", fontSize: "1.05rem", lineHeight: 1.8 }}>
              Start your journey today and connect with thousands of students, colleges and micro opportunities on CollegeVerse.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <Link href="/login" className="cta-pill">
                Get Started Now
              </Link>
              <Link href="/leaderboard" className="cta-outline">
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
