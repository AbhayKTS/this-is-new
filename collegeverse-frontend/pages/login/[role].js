import { useMemo, useContext, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeftCircle } from "lucide-react";
import NavBar from "../../components/NavBar";
import LoginForm from "../../components/LoginForm";
import { AuthContext } from "../../components/AuthProvider";

const ROLE_COPY = {
  student: {
    heading: "Student Portal",
    subtitle:
      "Verify your achievements, join college hubs, and earn streak XP that boosts your CollegeVerse ranking.",
    checklist: ["Unified portfolio sync", "AI-powered growth map", "MicroGigs & hackathons"],
  },
  college: {
    heading: "College Control Center",
    subtitle:
      "Curate leaderboards, launch inter-college quests, and track student impact with verified credentials.",
    checklist: ["Cohort dashboards", "Event & quest launcher", "DAO-ready governance"],
  },
  recruiter: {
    heading: "Recruiter Gateway",
    subtitle:
      "Source proof-of-work talent, launch micro-internships, and track candidate readiness in real time.",
    checklist: ["Verified portfolios", "Talent pools & alerts", "Token-gated micro internships"],
  },
};

const RoleLogin = () => {
  const router = useRouter();
  const { session, profile, loadingProfile } = useContext(AuthContext);
  const roleKey = (router.query.role || "").toString().toLowerCase();

  const copy = useMemo(() => ROLE_COPY[roleKey], [roleKey]);

  useEffect(() => {
    if (!session) return;
    if (loadingProfile) return;

    const routeByRole = {
      student: "/student/profile",
      recruiter: "/recruiter/dashboard",
      college: "/college/dashboard",
    };

    const storedRole = typeof window !== "undefined" ? window.localStorage.getItem("cv-role") : null;
    const resolvedRole = (profile?.role || storedRole || roleKey || "").toLowerCase();
    const destination = routeByRole[resolvedRole];

    if (destination) {
      router.replace(destination);
    }
  }, [session, profile?.role, loadingProfile, roleKey, router]);

  return (
    <div>
      <NavBar />
      <main className="login-shell">
        <div className="container" style={{ display: "grid", gap: "2.5rem" }}>
          <Link href="/login" className="ghost-pill" style={{ width: "fit-content" }}>
            <ArrowLeftCircle size={18} />
            Back to role selector
          </Link>

          {copy ? (
            <div className="role-login-grid">
              <LoginForm heading={copy.heading} subtitle={copy.subtitle} role={roleKey} />

              <aside className="login-aside glass-panel">
                <h3 className="font-display" style={{ color: "white", marginTop: 0 }}>You get:</h3>
                <ul className="login-checklist">
                  {copy.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p style={{ color: "rgba(202, 213, 255, 0.78)", lineHeight: 1.7 }}>
                  Need a custom onboarding? <a href="mailto:hello@collegeverse.xyz" style={{ color: "var(--accent)" }}>Talk to us</a> and we&apos;ll fast-track your setup.
                </p>
              </aside>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
              <h2 className="font-display" style={{ color: "white", marginBottom: "1rem" }}>Portal not found</h2>
              <p style={{ color: "rgba(202, 213, 255, 0.78)", marginBottom: "2rem" }}>
                The link you followed doesn&apos;t exist. Choose the right portal to continue.
              </p>
              <Link href="/login" className="cta-main">
                Go to role selector
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoleLogin;
