import { ShieldCheck, Sparkles, Briefcase, Users } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Verified On-Chain Identity",
    description: "Polygon-powered credentials, SBTs, and NFT trophies certify every hackathon, competition, and campus milestone.",
    icon: <ShieldCheck size={26} />,
  },
  {
    title: "AI Rank Intelligence",
    description: "Domain-wise scorecards, leaderboard heatmaps, and predictive growth paths powered by AI and real metrics.",
    icon: <Sparkles size={26} />,
  },
  {
    title: "MicroGigs Marketplace",
    description: "Gig quests designed by colleges and recruiters to earn XP, unlock mentors, and redeem $CVR rewards.",
    icon: <Briefcase size={26} />,
  },
  {
    title: "Community Launchpads",
    description: "College hubs, DAO voting, and hack squads that keep builders, creators, and leaders aligned toward impact.",
    icon: <Users size={26} />,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-intro">
          <span className="badge-pill">A Universe Built For Students</span>
          <h2>
            A single passport <span className="text-gradient">for skills, ranks &amp; rewards</span>
          </h2>
          <p>
            CollegeVerse fuses the energy of campus life with cross-domain achievements, verified records, and future-ready opportunities.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;