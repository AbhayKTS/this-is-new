import { useContext, useEffect, useMemo, useState } from "react";
import { CalendarClock, GraduationCap, ShieldCheck, Users } from "lucide-react";
import NavBar from "../../components/NavBar";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { AuthContext } from "../../components/AuthProvider";

const iconMap = {
  users: Users,
  placements: GraduationCap,
  recruiters: ShieldCheck,
  events: CalendarClock,
};

const fallbackMetrics = [
  { key: "verified_students", label: "Verified students", value: "4,320", delta: "+8.6%", icon: "users" },
  { key: "placements", label: "Placements this year", value: "612", delta: "+14.2%", icon: "placements" },
  { key: "recruiters", label: "Active recruiters", value: "39", delta: "+3", icon: "recruiters" },
  { key: "events", label: "Upcoming events", value: "6", delta: "Next 30 days", icon: "events" },
];

const fallbackVerificationQueue = [
  { id: "queue-ishita", name: "Ishita Singh", program: "BBA '26", status: "Documents pending" },
  { id: "queue-raghav", name: "Raghav Bansal", program: "MBA '25", status: "Ready to approve" },
  { id: "queue-tanvi", name: "Tanvi Iyer", program: "B.Tech '27", status: "Needs review" },
];

const fallbackEvents = [
  { id: "event-ai", title: "AI Hiring Day", date: "14 Sep", owner: "Tech Council" },
  { id: "event-design", title: "Design Hiring Studio", date: "21 Sep", owner: "Creative Labs" },
  { id: "event-fintech", title: "Fintech Superweek", date: "28 Sep", owner: "E-Cell" },
];

const fallbackStandouts = [
  { id: "student-arjun", name: "Arjun Patel", domain: "Product", score: 9420, microgigs: 6 },
  { id: "student-sana", name: "Sana Mir", domain: "AI & Data", score: 9185, microgigs: 8 },
  { id: "student-dev", name: "Dev Mehra", domain: "Marketing", score: 9010, microgigs: 5 },
  { id: "student-khushi", name: "Khushi Jain", domain: "Consulting", score: 8960, microgigs: 7 },
];

export default function Colleges() {
  const { profile } = useContext(AuthContext);

  const [metricCards, setMetricCards] = useState(fallbackMetrics);
  const [verificationQueue, setVerificationQueue] = useState(fallbackVerificationQueue);
  const [events, setEvents] = useState(fallbackEvents);
  const [standoutStudents, setStandoutStudents] = useState(fallbackStandouts);
  const [placementForecast, setPlacementForecast] = useState("87%");
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  const collegeIdentifier = useMemo(() => {
    if (!profile) return null;
    return profile.college_id || profile.college_slug || profile.college || profile.id;
  }, [profile]);

  useEffect(() => {
    if (!isSupabaseConfigured || !collegeIdentifier) {
      setLoading(false);
      if (!isSupabaseConfigured) {
        setError("");
      }
      return;
    }

    let ignore = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [metricsRes, queueRes, eventsRes, standoutsRes, highlightsRes] = await Promise.all([
          supabase
            .from("college_metrics")
            .select("key, label, value, delta, icon")
            .eq("college_id", collegeIdentifier)
            .order("display_order", { ascending: true }),
          supabase
            .from("student_verifications")
            .select("id, name, program, status")
            .eq("college_id", collegeIdentifier)
            .order("created_at", { ascending: true })
            .limit(6),
          supabase
            .from("college_events")
            .select("id, title, event_date, owner")
            .eq("college_id", collegeIdentifier)
            .order("event_date", { ascending: true })
            .limit(6),
          supabase
            .from("standout_students")
            .select("id, name, domain, score, microgigs")
            .eq("college_id", collegeIdentifier)
            .order("score", { ascending: false })
            .limit(8),
          supabase
            .from("college_highlights")
            .select("placement_forecast")
            .eq("college_id", collegeIdentifier)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (ignore) return;

        if (!metricsRes.error && metricsRes.data) {
          const parsedMetrics = metricsRes.data.map((metric) => ({
            key: metric.key,
            label: metric.label || "Metric",
            value: metric.value || "-",
            delta: metric.delta || "",
            icon: metric.icon || "users",
          }));
          setMetricCards(parsedMetrics.length ? parsedMetrics : fallbackMetrics);
        } else if (metricsRes.error) {
          console.warn("College metrics fetch error", metricsRes.error);
          setMetricCards(fallbackMetrics);
        }

        if (!queueRes.error && queueRes.data) {
          setVerificationQueue(queueRes.data.length ? queueRes.data : []);
        } else if (queueRes.error) {
          console.warn("Verification queue fetch error", queueRes.error);
          setVerificationQueue(fallbackVerificationQueue);
        }

        if (!eventsRes.error && eventsRes.data) {
          const parsedEvents = eventsRes.data.map((event) => ({
            id: event.id,
            title: event.title,
            date: event.event_date || "TBA",
            owner: event.owner || "Campus team",
          }));
          setEvents(parsedEvents.length ? parsedEvents : []);
        } else if (eventsRes.error) {
          console.warn("Events fetch error", eventsRes.error);
          setEvents(fallbackEvents);
        }

        if (!standoutsRes.error && standoutsRes.data) {
          setStandoutStudents(standoutsRes.data.length ? standoutsRes.data : []);
        } else if (standoutsRes.error) {
          console.warn("Standout students fetch error", standoutsRes.error);
          setStandoutStudents(fallbackStandouts);
        }

        if (!highlightsRes.error && highlightsRes.data) {
          setPlacementForecast(highlightsRes.data.placement_forecast || "87%");
        } else if (highlightsRes.error) {
          console.warn("Highlights fetch error", highlightsRes.error);
        }

        const encounteredErrors = [metricsRes.error, queueRes.error, eventsRes.error, standoutsRes.error, highlightsRes.error].filter(Boolean);
        if (encounteredErrors.length) {
          setError("Some widgets failed to sync with Supabase. Showing cached data.");
        }
      } catch (err) {
        if (!ignore) {
          console.warn("College dashboard fetch failed", err);
          setError("Unable to reach Supabase right now. Showing cached data.");
          setMetricCards(fallbackMetrics);
          setVerificationQueue(fallbackVerificationQueue);
          setEvents(fallbackEvents);
          setStandoutStudents(fallbackStandouts);
          setPlacementForecast("87%");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, [collegeIdentifier]);

  const MetricIcon = (iconKey) => iconMap[iconKey] || Users;

  return (
    <div className="page-shell">
      <NavBar />
      <main className="page-main">
        <section className="dashboard-hero glass-panel">
          <div>
            <span className="badge-pill">College Command Center</span>
            <h1 className="font-display">Guide your cohort to the next big opportunity</h1>
            <p>
              Track verification pipelines, surface standout talent, and automate recruiter handoffs in one futuristic workspace.
            </p>
          </div>
          <div className="hero-metric">
            <strong>{placementForecast}</strong>
            <span>placement forecast for this batch</span>
          </div>
        </section>

        {error && (
          <p style={{ color: "#f87171", margin: 0 }}>{error}</p>
        )}

        <section className="metric-grid">
          {metricCards.map((metric) => {
            const Icon = MetricIcon(metric.icon);
            return (
              <article key={metric.label} className="metric-card glass-panel">
                <div className="metric-icon">
                  <Icon size={22} />
                </div>
                <div className="metric-copy">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
                <span className="metric-delta">{metric.delta}</span>
              </article>
            );
          })}
        </section>

        <section className="college-grid">
          <article className="verification-hub glass-panel">
            <header>
              <h2 className="font-display">Verification queue</h2>
              <button type="button" className="cta-outline">
                Review all
              </button>
            </header>
            <div className="queue-list">
              {(verificationQueue.length ? verificationQueue : fallbackVerificationQueue).map((student) => (
                <div key={student.id || student.name} className="queue-card">
                  <div>
                    <h3>{student.name}</h3>
                    <span>{student.program}</span>
                  </div>
                  <button type="button" className="cta-outline">
                    {student.status}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="events-hub glass-panel">
            <header>
              <h2 className="font-display">Talent experiences</h2>
              <button type="button" className="cta-outline">
                Launch event
              </button>
            </header>
            <div className="events-list">
              {(events.length ? events : fallbackEvents).map((event) => (
                <div key={event.id || event.title} className="event-card">
                  <span className="event-date">{event.date}</span>
                  <div>
                    <h3>{event.title}</h3>
                    <span>{event.owner}</span>
                  </div>
                  <button type="button" className="cta-outline">
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="table-panel glass-panel">
          <header className="table-header">
            <span>Standout students ready for spotlight</span>
            <button type="button" className="cta-outline">
              Export list
            </button>
          </header>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Domain</th>
                  <th>Score</th>
                  <th>MicroGigs shipped</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(standoutStudents.length ? standoutStudents : fallbackStandouts).map((student) => (
                  <tr key={student.id || student.name}>
                    <td>{student.name}</td>
                    <td>{student.domain}</td>
                    <td>{student.score}</td>
                    <td>{student.microgigs}</td>
                    <td>
                      <button type="button" className="cta-outline">
                        Introduce recruiter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
