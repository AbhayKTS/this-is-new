import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeftCircle, CheckCircle } from "lucide-react";
import NavBar from "../../components/NavBar";
import LoginForm from "../../components/LoginForm";
import { useAuth } from "../../components/AuthContext";

const ROLE_COPY = {
  student: {
    heading: "Student Portal",
    subtitle: "Verify your achievements, join college hubs, and earn streak XP that boosts your CollegeVerse ranking.",
    checklist: ["Unified portfolio sync", "AI-powered growth map", "MicroGigs & hackathons"],
  },
  college: {
    heading: "College Control Center",
    subtitle: "Curate leaderboards, launch inter-college quests, and track student impact with verified credentials.",
    checklist: ["Cohort dashboards", "Event & quest launcher", "DAO-ready governance"],
  },
  recruiter: {
    heading: "Recruiter Gateway",
    subtitle: "Source proof-of-work talent, launch micro-internships, and track candidate readiness in real time.",
    checklist: ["Verified portfolios", "Talent pools & alerts", "Token-gated micro internships"],
  },
};

export default function RoleLogin() {
  const router = useRouter();
  const { isAuthenticated, userData } = useAuth();
  const roleKey = (router.query.role || "").toString().toLowerCase();
  const copy = useMemo(() => ROLE_COPY[roleKey], [roleKey]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const routeByRole = { student: "/student/profile", recruiter: "/recruiter/dashboard", college: "/college/dashboard" };
    const resolvedRole = (userData?.role || roleKey || "").toLowerCase();
    const destination = routeByRole[resolvedRole];
    if (destination) router.replace(destination);
  }, [isAuthenticated, userData?.role, roleKey, router]);

  return (
    <div>
      <NavBar />
      <main className="login-shell">
        <div className="container" style={{ display: "grid", gap: "2.5rem", maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-dim)", textDecoration: "none", fontSize: "0.88rem", width: "fit-content" }}>
            <ArrowLeftCircle size={18} /> Back to role selector
          </Link>

          {copy ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
              <LoginForm heading={copy.heading} subtitle={copy.subtitle} role={roleKey} />
              <aside className="section-card" style={{ padding: "2rem" }}>
                <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, margin: "0 0 1.25rem" }}>You get:</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {copy.checklist.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      <CheckCircle size={16} style={{ color: "var(--success)", flexShrink: 0 }} /> {item}
                    </li>
                  ))}
                </ul>
                <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                  Need custom onboarding? <a href="mailto:hello@collegeverse.xyz" style={{ color: "var(--accent)" }}>Talk to us</a>.
                </p>
              </aside>
            </div>
          ) : (
            <div className="section-card" style={{ padding: "2.5rem", textAlign: "center" }}>
              <h2 style={{ color: "white", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>Portal not found</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>The link you followed does not exist.</p>
              <Link href="/login"><button className="btn-primary">Go to role selector</button></Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}