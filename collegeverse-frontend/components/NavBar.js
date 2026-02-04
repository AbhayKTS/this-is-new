import Link from "next/link";
import { useContext, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { AuthContext } from "./AuthProvider";

const navLinks = [
  { href: "/communities", label: "Communities" },
  { href: "/qa", label: "Q&A" },
  { href: "/colleges", label: "Colleges" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/microgigs", label: "MicroGigs" },
];

export default function NavBar() {
  const { user, signOut, profile } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const portalHref = profile?.role === "recruiter" ? "/recruiter/dashboard" : profile?.role === "college" ? "/college/dashboard" : "/student/dashboard";
  const portalLabel = profile?.role === "recruiter" ? "Recruiter Hub" : profile?.role === "college" ? "College Hub" : "Student Hub";

  return (
    <header className="site-nav" role="navigation">
      <div className="nav-inner container">
        <div className="nav-brand">
          <Link href="/" className="brand-link" onClick={closeMenu}>
            <span className="logo-badge">CV</span>
            <span className="brand-name">CollegeVerse</span>
          </Link>
        </div>

        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((item) => (
            <Link key={item.label} href={item.href} className="nav-link" onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-cta">
          {user ? (
            <>
              <span className="nav-user" title={user.email}>
                {profile?.full_name || user.email}
              </span>
              <Link href={portalHref} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                {portalLabel}
              </Link>
              <button type="button" className="btn-ghost" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/login" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                <Sparkles size={18} />
                Join Beta
              </Link>
            </>
          )}
        </div>

        <button type="button" className="nav-toggle" aria-expanded={menuOpen} aria-label="Toggle menu" onClick={toggleMenu}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile">
          <nav aria-label="Mobile">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} className="nav-mobile-link" onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav-mobile-cta">
            {user ? (
              <>
                <Link href={portalHref} className="btn-primary" onClick={closeMenu}>
                  {portalLabel}
                </Link>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost" onClick={closeMenu}>
                  Sign in
                </Link>
                <Link href="/login" className="btn-primary" onClick={closeMenu}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
