import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = [
  {
    title: "Explore",
    items: [
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "MicroGigs", href: "/microgigs" },
      { label: "Colleges", href: "/colleges" },
      { label: "Profile", href: "/profile" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Docs", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Support", href: "#" },
      { label: "Brand", href: "#" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const socials = [
  { icon: Github, href: "https://github.com/collegeverse" },
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
  { icon: Mail, href: "mailto:hello@collegeverse.xyz" },
];

const Footer = () => {
  return (
    <footer style={{ padding: "4.5rem 0 2.5rem", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(80% 80% at 50% 0%, rgba(99,102,241,0.08) 0%, rgba(15,23,42,0.8) 70%)",
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="footer-grid">
          <div style={{ maxWidth: 320 }}>
            <div className="logo-badge">CV</div>
            <h3 className="font-display" style={{ marginTop: "1.5rem", fontSize: "1.75rem", color: "white" }}>
              CollegeVerse
            </h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: "0.75rem" }}>
              A shimmering universe where students showcase proof-of-work, colleges discover rising stars, and opportunities stay transparent.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 style={{ fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)", marginBottom: "1.75rem" }}>
                {section.title}
              </h4>
              <ul style={{ display: "grid", gap: "0.75rem" }}>
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="footer-link">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            © {new Date().getFullYear()} CollegeVerse. Crafted for builders of the future.
          </p>
          <div className="footer-socials">
            {socials.map(({ icon: Icon, href }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" className="footer-social">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
