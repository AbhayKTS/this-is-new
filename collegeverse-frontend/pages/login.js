import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import LoginForm from "../components/LoginForm";
import { GraduationCap, Building2, BriefcaseBusiness } from "lucide-react";

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

const RoleLoginTrigger = ({ role, heading, subtitle, glowLabel }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button type="button" className="cta-main" onClick={() => setOpen(true)}>
        Sign in / Sign up
      </button>

      {open && (
        <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby={`${role}-modal-title`}>
          <div className="login-modal__backdrop" onClick={() => setOpen(false)} />
          <div className="login-modal__panel glass-panel">
            <header className="login-modal__header">
              <h2 id={`${role}-modal-title`} className="font-display">{heading}</h2>
              <p>{subtitle}</p>
            </header>
            <LoginForm
              role={role}
              heading={heading}
              subtitle={subtitle}
              glowLabel={glowLabel}
              showHeader={false}
              showGlowLabel={false}
              onAuthenticated={() => setOpen(false)}
            />
            <button type="button" className="btn-ghost login-modal__close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default function Login() {
  return (
    <div className="login-galaxy">
      <NavBar />
      <main className="login-shell">
        <div className="login-nebula" aria-hidden="true" />
        <div className="login-constellation" aria-hidden="true" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <header className="login-header">
            <span className="badge-pill">Choose your portal</span>
            <h1 className="font-display">Step into your CollegeVerse dimension</h1>
            <p>
              Tailored dashboards keep students, college admins, and recruiters in sync. Pick the card that matches your mission and authenticate in seconds.
            </p>
          </header>

          <section className="login-grid">
            {LOGIN_CARDS.map((card) => (
              <article key={card.role} className="login-orbital">
                <div className="orbital-header">
                  <span className="orbital-icon">{card.icon}</span>
                  <h2 className="font-display">{card.heading}</h2>
                  <span className="orbital-glow">{card.glowLabel}</span>
                  <p>{card.subtitle}</p>
                  <ul>
                    {card.checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <RoleLoginTrigger
                  role={card.role}
                  heading={card.heading}
                  subtitle={card.subtitle}
                  glowLabel={card.glowLabel}
                />
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
