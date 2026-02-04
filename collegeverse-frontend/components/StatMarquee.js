import { Trophy, Flame, Rocket, Zap } from "lucide-react";

const stats = [
  { icon: <Trophy size={18} />, text: "Top 1% rankers verified every week" },
  { icon: <Flame size={18} />, text: "Live hackathons & DAO votes" },
  { icon: <Rocket size={18} />, text: "MicroGigs dropping every Friday" },
  { icon: <Zap size={18} />, text: "Synced platforms: GitHub, CF, LC" },
];

const StatMarquee = () => {
  return (
    <div className="stat-marquee">
      <div className="marquee-track">
        {[...stats, ...stats].map((item, index) => (
          <span className="marquee-pill" key={`${item.text}-${index}`}>
            {item.icon}
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StatMarquee;
