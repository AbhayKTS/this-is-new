import { useContext, useEffect, useMemo, useState } from "react";
import { Filter, MessageSquare, Search, Sparkles, UserCheck } from "lucide-react";
import NavBar from "../../components/NavBar";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { AuthContext } from "../../components/AuthProvider";

const fallbackFilters = ["Top 1%", "Design", "AI", "Product", "Marketing"];

const fallbackCandidates = [
  {
    id: "talent-meera",
    name: "Meera Kulkarni",
    college: "IISc Bangalore",
    domain: "AI Research",
    score: 9820,
    badges: ["Prompt Architect", "Hackathon Winner"],
    availability: "Notice period: 2 weeks",
  },
  {
    id: "talent-ritvik",
    name: "Ritvik Sharma",
    college: "NIFT Delhi",
    domain: "Product Design",
    score: 9585,
    badges: ["Design Systems", "Visual Storyteller"],
    availability: "Ready to join",
  },
  {
    id: "talent-aanya",
    name: "Aanya Bose",
    college: "IIM Kozhikode",
    domain: "Business Strategy",
    score: 9490,
    badges: ["Growth Architect", "Top Mentor"],
    availability: "Open for consulting gigs",
  },
];

const fallbackPipeline = [
  { id: "pipeline-discovery", stage: "Discovery", count: 24, highlight: "+5 vs last week" },
  { id: "pipeline-interview", stage: "Interview", count: 11, highlight: "Avg score 8.7" },
  { id: "pipeline-offer", stage: "Offer", count: 4, highlight: "Closing in 3 days" },
];

export default function RecruiterDashboard() {
  const { profile } = useContext(AuthContext);

  const [filters, setFilters] = useState(fallbackFilters);
  const [activeFilter, setActiveFilter] = useState(fallbackFilters[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [talentRows, setTalentRows] = useState(fallbackCandidates);
  const [pipeline, setPipeline] = useState(fallbackPipeline);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  const recruiterOrg = useMemo(() => {
    if (!profile) return null;
    return profile.company_id || profile.company || profile.id;
  }, [profile]);

  useEffect(() => {
    if (!isSupabaseConfigured || !recruiterOrg) {
      setLoading(false);
      return;
    }

    let ignore = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [filtersRes, talentRes, pipelineRes] = await Promise.all([
          supabase
            .from("talent_filters")
            .select("label")
            .eq("company_id", recruiterOrg)
            .order("priority", { ascending: true })
            .limit(12),
          supabase
            .from("talent_recommendations")
            .select("id, name, college, domain, score, badges, availability")
            .eq("company_id", recruiterOrg)
            .order("score", { ascending: false })
            .limit(24),
          supabase
            .from("recruiter_pipeline")
            .select("id, stage, count, highlight")
            .eq("company_id", recruiterOrg)
            .order("display_order", { ascending: true })
            .limit(12),
        ]);

        if (ignore) return;

        if (!filtersRes.error && filtersRes.data?.length) {
          const uniqueFilters = filtersRes.data.map((item) => item.label).filter(Boolean);
          if (uniqueFilters.length) {
            setFilters(uniqueFilters);
            setActiveFilter(uniqueFilters[0]);
          } else {
            setFilters(fallbackFilters);
            setActiveFilter(fallbackFilters[0]);
          }
        } else if (filtersRes.error) {
          console.warn("Recruiter filters fetch error", filtersRes.error);
          setFilters(fallbackFilters);
          setActiveFilter(fallbackFilters[0]);
        }

        if (!talentRes.error && talentRes.data?.length) {
          const mapped = talentRes.data.map((candidate) => ({
            id: candidate.id,
            name: candidate.name,
            college: candidate.college,
            domain: candidate.domain,
            score: candidate.score,
            badges: Array.isArray(candidate.badges)
              ? candidate.badges
              : (candidate.badges || "")
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
            availability: candidate.availability || "Ready to explore",
          }));
          setTalentRows(mapped);
        } else if (talentRes.error) {
          console.warn("Recruiter talent fetch error", talentRes.error);
          setTalentRows(fallbackCandidates);
        }

        if (!pipelineRes.error && pipelineRes.data?.length) {
          setPipeline(pipelineRes.data);
        } else if (pipelineRes.error) {
          console.warn("Recruiter pipeline fetch error", pipelineRes.error);
          setPipeline(fallbackPipeline);
        }

        if (filtersRes.error || talentRes.error || pipelineRes.error) {
          setError("Showing cached talent data while Supabase reconnects.");
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Recruiter dashboard fetch failed", err);
          setError("Unable to reach Supabase right now. Showing cached data.");
          setFilters(fallbackFilters);
          setActiveFilter(fallbackFilters[0]);
          setTalentRows(fallbackCandidates);
          setPipeline(fallbackPipeline);
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
  }, [recruiterOrg]);

  const filteredTalent = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const active = (activeFilter || "").toLowerCase();

    return talentRows.filter((candidate) => {
      const matchesQuery =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.domain.toLowerCase().includes(query) ||
        candidate.college.toLowerCase().includes(query);

      if (!active || active === "all") {
        return matchesQuery;
      }

      const badgeMatches = (candidate.badges || []).some((badge) => badge.toLowerCase().includes(active));
      const domainMatches = candidate.domain.toLowerCase().includes(active);

      return matchesQuery && (badgeMatches || domainMatches);
    });
  }, [talentRows, searchQuery, activeFilter]);

  return (
    <div className="page-shell">
      <NavBar />
      <main className="page-main">
        <section className="recruiter-hero glass-panel">
          <div>
            <span className="badge-pill">Recruiter Control Deck</span>
            <h1 className="font-display">Source, shortlist, and close standout talent in minutes</h1>
            <p>
              Smart filters surface candidates who match your startup's vibe. Sync with your ATS, track conversations, and co-create offers without leaving the portal.
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" className="cta-solid">
              Launch curated shortlist
            </button>
            <button type="button" className="cta-outline">
              Schedule culture round
            </button>
          </div>
        </section>

        {error && <p style={{ color: "#f87171", margin: 0 }}>{error}</p>}

        <section className="recruiter-search glass-panel">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search by skills, cohort, or leaderboard rank"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button type="button" className="filter-button">
              <Filter size={16} />
              Filters
            </button>
          </div>
          <div className="chip-group">
            {filters.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`filter-chip${activeFilter === chip ? " active" : ""}`}
                onClick={() => setActiveFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        <section className="candidate-grid">
          {loading ? (
            <article className="candidate-card glass-panel" style={{ textAlign: "center" }}>
              <p>Analyzing cohorts...</p>
            </article>
          ) : filteredTalent.length ? (
            filteredTalent.map((candidate) => (
              <article key={candidate.id || candidate.name} className="candidate-card glass-panel">
                <header>
                  <div>
                    <h2>{candidate.name}</h2>
                    <span>{candidate.college}</span>
                  </div>
                  <span className="domain-tag">{candidate.domain}</span>
                </header>
                <p className="score-pill">Composite score {candidate.score}</p>
                <div className="badge-row">
                  {(candidate.badges || []).map((badge) => (
                    <span key={`${candidate.id || candidate.name}-${badge}`}>{badge}</span>
                  ))}
                </div>
                <footer>
                  <span>{candidate.availability}</span>
                  <div className="card-actions">
                    <button type="button" className="cta-outline">
                      <MessageSquare size={16} />
                      Chat
                    </button>
                    <button type="button" className="cta-solid">
                      <UserCheck size={16} />
                      Advance
                    </button>
                  </div>
                </footer>
              </article>
            ))
          ) : (
            <article className="candidate-card glass-panel" style={{ textAlign: "center" }}>
              <p>No candidates match your filters yet. Try clearing search or switch filters.</p>
            </article>
          )}
        </section>

        <section className="pipeline-glance glass-panel">
          <header>
            <h2 className="font-display">Pipeline at a glance</h2>
            <button type="button" className="cta-outline">
              Export to ATS
            </button>
          </header>
          <div className="pipeline-stats">
            {pipeline.map((item) => (
              <div key={item.id || item.stage} className="pipeline-card">
                <div className="pipeline-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <span>{item.stage}</span>
                  <strong>{item.count}</strong>
                </div>
                <span className="pipeline-highlight">{item.highlight}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
