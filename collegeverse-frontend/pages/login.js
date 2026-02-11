import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../components/AuthContext";
import { GraduationCap, Building2, BriefcaseBusiness, X } from "lucide-react";

const LOGIN_CARDS = [
  {
    role: "student",
    icon: <GraduationCap size={28} />,
    glowLabel: "College Email Only",
    heading: "Student Login",
    subtitle: "Verified college emails unlock the profile wizard, coding sync, and national leaderboard placement.",
    checklist: [
      "Strict college domain validation",
      "Profile completion meter",
      "Auto-sync coding scores",
    ],
  },
  {
    role: "college",
    icon: <Building2 size={28} />,
    glowLabel: "Admin Access",
    heading: "College Login",
    subtitle: "Review pending verifications, launch flagship events, and monitor campus impact analytics.",
    checklist: [
      "Approve student IDs",
      "Launch inter-college quests",
      "DAO-ready governance",
    ],
  },
  {
    role: "recruiter",
    icon: <BriefcaseBusiness size={28} />,
    glowLabel: "Talent Radar",
    heading: "Recruiter Login",
    subtitle: "Discover proof-of-work portfolios and filter verified candidates tailored to your hiring stack.",
    checklist: [
      "Company email or LinkedIn",
      "Pipeline synced to ATS",
      "Shortlist & DM workflows",
    ],
  },
];

export default function Login() {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [modalRole, setModalRole] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const dest = role === "recruiter" ? "/recruiter/dashboard" : role === "college" ? "/college/dashboard" : "/student/dashboard";
      router.push(dest);
    }
  }, [isAuthenticated, role, router]);

  // Escape key closes modal
  useEffect(() => {
    if (!modalRole) return;
    const handleKey = (e) => { if (e.key === "Escape") setModalRole(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => { window.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [modalRole]);

  return (
    <div className="page-shell">
      <NavBar />
      <main className="login-page">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <header className="login-header">
            <span className="badge-pill"><span className="badge-dot" /> Choose your portal</span>
            <h1 className="font-display">
              Step into your <span className="text-gradient">CollegeVerse</span> dimension
            </h1>
            <p>
              Tailored dashboards keep students, college admins, and recruiters in sync. Pick the card that matches your mission and authenticate in seconds.
            </p>
          </header>

          <section className="login-grid">
            {LOGIN_CARDS.map((card) => (
              <article key={card.role} className="login-card animate-in">
                <span className="login-card-icon">{card.icon}</span>
                <span className="glow-label">{card.glowLabel}</span>
                <h2>{card.heading}</h2>
                <p>{card.subtitle}</p>
                <ul>
                  {card.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button type="button" className="btn-primary" style={{ marginTop: "auto" }} onClick={() => setModalRole(card.role)}>
                  Sign in / Sign up
                </button>
              </article>
            ))}
          </section>
        </div>
      </main>

      {/* AUTH MODAL */}
      {modalRole && (
        <div className="login-modal" role="dialog" aria-modal="true">
          <div className="login-modal-backdrop" onClick={() => setModalRole(null)} />
          <div className="login-modal-panel glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "white" }}>
                {LOGIN_CARDS.find((c) => c.role === modalRole)?.heading}
              </h2>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setModalRole(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <LoginForm
              role={modalRole}
              heading={LOGIN_CARDS.find((c) => c.role === modalRole)?.heading}
              subtitle={LOGIN_CARDS.find((c) => c.role === modalRole)?.subtitle}
              onAuthenticated={() => setModalRole(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
