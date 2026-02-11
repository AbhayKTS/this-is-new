import Link from "next/link";
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
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand-link">
              <span className="logo-badge">CV</span>
              <span className="brand-name" style={{ fontSize: "1.25rem" }}>CollegeVerse</span>
            </Link>
            <p>A shimmering universe where students showcase proof-of-work, colleges discover rising stars, and opportunities stay transparent.</p>
          </div>

          {footerLinks.map((section) => (
            <div className="footer-col" key={section.title}>
              <h4>{section.title}</h4>
              <ul>
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="footer-link">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CollegeVerse. Crafted for builders of the future.</p>
          <div className="footer-socials">
            {socials.map(({ icon: Icon, href }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" className="footer-social">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;