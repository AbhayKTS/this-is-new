import { useContext, useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AuthContext } from "../components/AuthProvider";

const fallbackGigs = [
  {
    id: "gig-festival-poster",
    title: "Design a festival poster",
    brand: "Pulse Records",
    reward: "200 credits",
    duration: "Due in 4 days",
    tags: ["Design", "Remote", "Paid"],
    blurb:
      "Create a poster that captures the energy of India's largest indie music festival. Deliver layered files plus social cutdowns.",
  },
  {
    id: "gig-ambassador",
    title: "Campus ambassador sprint",
    brand: "Notion",
    reward: "Badge + 120 credits",
    duration: "Starts next week",
    tags: ["Marketing", "Hybrid", "Collaboration"],
    blurb:
      "Run a 7-day productivity challenge for your campus. Host 2 workshops, capture testimonials, and compile a playbook.",
  },
  {
    id: "gig-onboarding",
    title: "Prototype onboarding flow",
    brand: "Zepto",
    reward: "INR 6,000 stipend",
    duration: "Due in 6 days",
    tags: ["Product", "UX", "Sprint"],
    blurb:
      "Map and prototype a frictionless onboarding journey for new delivery partners. Include journey maps and hi-fi screens.",
  },
  {
    id: "gig-resume-polish",
    title: "AI resume polish",
    brand: "Superhuman",
    reward: "110 credits",
    duration: "Due in 2 days",
    tags: ["AI", "Writing", "Remote"],
    blurb:
      "Use our AI tooling to transform 15 raw resumes into narrative-rich profiles. Provide before/after comparisons.",
  },
];

const fallbackApplications = [
  { id: "app-collab-calendar", title: "Influencer collaboration calendar", status: "In review", eta: "Decision in 2 days" },
  { id: "app-campus-finance", title: "Campus finance podcast", status: "Shortlisted", eta: "Pitch round tomorrow" },
  { id: "app-figma-clean", title: "Figma design clean-up", status: "Submitted", eta: "Awaiting feedback" },
];

const fallbackTags = ["Trending", ...Array.from(new Set(fallbackGigs.flatMap((gig) => gig.tags)))];

function toTags(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function formatDeadline(deadline) {
  if (!deadline) return "Flexible";
  const due = new Date(deadline);
  if (Number.isNaN(due.getTime())) return "Flexible";

  const now = new Date();
  const diffInMs = due.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays > 1) return `Due in ${diffInDays} days`;
  if (diffInDays === 1) return "Due tomorrow";
  if (diffInDays === 0) return "Due today";
  return "Closing soon";
}

export default function MicroGigs() {
  const { user } = useContext(AuthContext);

  const [gigs, setGigs] = useState(fallbackGigs);
  const [availableTags, setAvailableTags] = useState(fallbackTags);
  const [activeTag, setActiveTag] = useState("Trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [myApplications, setMyApplications] = useState(fallbackApplications);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");
  const [newGigCount, setNewGigCount] = useState(fallbackGigs.length);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let ignore = false;

    const fetchGigs = async () => {
      setLoading(true);
      setError("");

      try {
        const { data, error: gigsError } = await supabase
          .from("microgigs")
          .select("id, title, brand, reward, duration, tags, blurb, deadline, created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        if (ignore) return;

        if (gigsError) {
          console.warn("MicroGigs fetch error", gigsError);
          setError(gigsError.message);
          setGigs(fallbackGigs);
          setNewGigCount(fallbackGigs.length);
          setAvailableTags(fallbackTags);
          return;
        }

        if (data) {
          const mapped = data.map((gig) => ({
            id: gig.id ?? gig.title,
            title: gig.title ?? "Untitled brief",
            brand: gig.brand ?? "Partner brand",
            reward: gig.reward ?? "Credits",
            duration: gig.duration ?? formatDeadline(gig.deadline),
            tags: toTags(gig.tags),
            blurb: gig.blurb ?? "", 
          }));

          setGigs(mapped.length ? mapped : fallbackGigs);
          setNewGigCount(mapped.length || fallbackGigs.length);

          const tags = new Set(mapped.flatMap((gig) => gig.tags));
          setAvailableTags(tags.size ? ["Trending", ...Array.from(tags)] : fallbackTags);
        }
      } catch (err) {
        if (!ignore) {
          console.warn("MicroGigs fetch failed", err);
          setError(err.message || String(err));
          setGigs(fallbackGigs);
          setNewGigCount(fallbackGigs.length);
          setAvailableTags(fallbackTags);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchGigs();

    return () => {
      ignore = true;
    };
  }, [isSupabaseConfigured]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) {
      setMyApplications(fallbackApplications);
      return;
    }

    let ignore = false;

    const fetchApplications = async () => {
      try {
        const { data, error: appsError } = await supabase
          .from("microgig_applications")
          .select("id, title, status, decision_eta, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(12);

        if (ignore) return;

        if (appsError) {
          console.warn("MicroGigs applications fetch error", appsError);
          setMyApplications(fallbackApplications);
          return;
        }

        if (data && data.length) {
          const mapped = data.map((entry) => ({
            id: entry.id,
            title: entry.title ?? "In-flight application",
            status: entry.status ?? "Submitted",
            eta: entry.decision_eta ?? "Awaiting update",
          }));
          setMyApplications(mapped);
        } else {
          setMyApplications([]);
        }
      } catch (err) {
        if (!ignore) {
          console.warn("MicroGigs applications fetch failed", err);
          setMyApplications(fallbackApplications);
        }
      }
    };

    fetchApplications();

    return () => {
      ignore = true;
    };
  }, [isSupabaseConfigured, user?.id]);

  const filteredGigs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return gigs.filter((gig, index) => {
      const matchesQuery =
        !normalizedQuery ||
        gig.title.toLowerCase().includes(normalizedQuery) ||
        gig.brand.toLowerCase().includes(normalizedQuery) ||
        gig.reward.toLowerCase().includes(normalizedQuery);

      const matchesTag =
        activeTag === "Trending" ? index < 6 : gig.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase());

      return matchesQuery && matchesTag;
    });
  }, [gigs, searchQuery, activeTag]);

  return (
    <div className="page-shell">
      <NavBar />
      <main className="page-main">
        <section className="microgigs-hero glass-panel">
          <div>
            <span className="badge-pill">MicroGigs Marketplace</span>
            <h1 className="font-display">Sprint-sized projects, career-sized impact</h1>
            <p>
              Browse live briefs from brands and startups. Earn credits, unlock badges, and showcase completed gigs on your public profile.
            </p>
          </div>
          <div className="hero-metric">
            <strong>{newGigCount}</strong>
            <span>New gigs this week</span>
          </div>
        </section>

        <div className="microgigs-grid">
          <section className="gig-feed glass-panel">
            <div className="feed-toolbar">
              <input
                className="search-input"
                placeholder="Search by skill, brand, or reward"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <div className="chip-group">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`filter-chip${activeTag === tag ? " active" : ""}`}
                    onClick={() => setActiveTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p style={{ color: "#f87171", margin: 0 }}>Showing cached briefs while we reconnect to Supabase.</p>
            )}

            <div className="gig-cards">
              {loading ? (
                <div className="gig-card" style={{ textAlign: "center" }}>
                  <p>Loading fresh briefs...</p>
                </div>
              ) : filteredGigs.length ? (
                filteredGigs.map((gig) => (
                  <article key={gig.id} className="gig-card">
                    <header>
                      <div>
                        <h3>{gig.title}</h3>
                        <span>{gig.brand}</span>
                      </div>
                      <div className="gig-meta">
                        <span>{gig.reward}</span>
                        <span>{gig.duration}</span>
                      </div>
                    </header>
                    <p>{gig.blurb}</p>
                    <div className="tag-row">
                      {gig.tags.map((tag) => (
                        <span key={`${gig.id}-${tag}`}>{tag}</span>
                      ))}
                    </div>
                    <div className="card-actions">
                      <button type="button" className="cta-outline">
                        View brief
                      </button>
                      <button type="button" className="cta-solid">
                        Apply now
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="gig-card" style={{ textAlign: "center" }}>
                  <p>No briefs match your filters yet. Try clearing search or switching tags.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="gig-sidebar glass-panel">
            <h2 className="font-display">My Applications</h2>
            <p>{user ? "Track decisions and prep for next steps." : "Sign in to sync your applications automatically."}</p>
            <div className="application-list">
              {myApplications.length ? (
                myApplications.map((entry) => (
                  <div key={entry.id} className="application-card">
                    <h3>{entry.title}</h3>
                    <span>{entry.status}</span>
                    <p>{entry.eta}</p>
                  </div>
                ))
              ) : (
                <div className="application-card" style={{ textAlign: "center" }}>
                  <p>No applications yet. Spin up a brief to see it tracked here.</p>
                </div>
              )}
            </div>
            <button type="button" className="cta-outline">
              View portfolio
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
