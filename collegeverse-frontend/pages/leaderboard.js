import { useEffect, useMemo, useState } from "react";
import { Filter, ArrowUp, ArrowDown, TrendingUp, Target } from "lucide-react";
import NavBar from "../components/NavBar";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const tabs = [
  { id: "national", label: "All India" },
  { id: "domain", label: "Domain-wise" },
  { id: "college", label: "College-wise" },
];

const fallbackRows = [
  { rank: 1, name: "Aarav Desai", college: "IIT Bombay", domain: "AI", score: 9860, movement: "up" },
  { rank: 2, name: "Nyra Kapoor", college: "BITS Pilani", domain: "Product", score: 9735, movement: "up" },
  { rank: 3, name: "Kabir Malhotra", college: "SRM Chennai", domain: "Web3", score: 9610, movement: "down" },
  { rank: 4, name: "Ira Mehta", college: "IIM Indore", domain: "BBA+MBA", score: 9488, movement: "up" },
  { rank: 5, name: "Zain Khan", college: "VJTI", domain: "CyberSec", score: 9340, movement: "up" },
];

const fallbackSummary = {
  percentile: 75,
  trendDelta: 12,
  totalRanked: 10000,
  domainsTracked: 32,
};

const uniqueFallbackDomains = Array.from(new Set(fallbackRows.map((row) => row.domain))).filter(Boolean).sort();
const uniqueFallbackColleges = Array.from(new Set(fallbackRows.map((row) => row.college))).filter(Boolean).sort();
const fallbackDomainOptions = ["all", ...uniqueFallbackDomains];
const fallbackCollegeOptions = ["all", ...uniqueFallbackColleges];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("national");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [rows, setRows] = useState(fallbackRows);
  const [domainOptions, setDomainOptions] = useState(fallbackDomainOptions);
  const [collegeOptions, setCollegeOptions] = useState(fallbackCollegeOptions);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("2 minutes ago");
  const [summary, setSummary] = useState(fallbackSummary);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let ignore = false;

    const fetchFilters = async () => {
      try {
        const { data, error: filterError } = await supabase
          .from("leaderboard_entries")
          .select("domain, college")
          .limit(500);

        if (ignore || filterError || !data) return;

        const domains = Array.from(new Set(data.map((item) => item.domain).filter(Boolean))).sort();
        const colleges = Array.from(new Set(data.map((item) => item.college).filter(Boolean))).sort();

        if (domains.length) {
          setDomainOptions(["all", ...domains]);
        }

        if (colleges.length) {
          setCollegeOptions(["all", ...colleges]);
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Leaderboard filter fetch failed", err);
        }
      }
    };

    const fetchSummary = async () => {
      try {
        const { data, error: summaryError } = await supabase
          .from("leaderboard_summary")
          .select("total_ranked, domains_tracked, percentile, trend_delta, updated_at")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (ignore || summaryError || !data) return;

        setSummary({
          percentile: data.percentile ?? fallbackSummary.percentile,
          trendDelta: data.trend_delta ?? fallbackSummary.trendDelta,
          totalRanked: data.total_ranked ?? fallbackSummary.totalRanked,
          domainsTracked: data.domains_tracked ?? fallbackSummary.domainsTracked,
        });

        if (data.updated_at) {
          setLastUpdated(new Date(data.updated_at).toLocaleTimeString());
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Leaderboard summary fetch failed", err);
        }
      }
    };

    fetchFilters();
    fetchSummary();

    return () => {
      ignore = true;
    };
  }, [isSupabaseConfigured]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setRows(fallbackRows);
      setLoading(false);
      setError("");
      return;
    }

    let ignore = false;

    const fetchRows = async () => {
      setLoading(true);
      setError("");

      try {
        let query = supabase
          .from("leaderboard_entries")
          .select("rank, name, college, domain, score, movement");

        if (selectedDomain !== "all") {
          query = query.eq("domain", selectedDomain);
        }

        if (selectedCollege !== "all") {
          query = query.eq("college", selectedCollege);
        }

        if (activeTab === "national") {
          query = query.order("score", { ascending: false });
        } else {
          query = query.order("rank", { ascending: true });
        }

        query = query.limit(100);

        const { data, error: rowsError } = await query;

        if (ignore) return;

        if (rowsError) {
          console.warn("Leaderboard fetch error", rowsError);
          setError(rowsError.message);
          setRows(fallbackRows);
        } else if (data) {
          setRows(data);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Leaderboard fetch failed", err);
          setError(err.message || String(err));
          setRows(fallbackRows);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchRows();

    return () => {
      ignore = true;
    };
  }, [activeTab, selectedDomain, selectedCollege, isSupabaseConfigured]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const domainMatch = selectedDomain === "all" || row.domain === selectedDomain;
      const collegeMatch = selectedCollege === "all" || row.college === selectedCollege;
      return domainMatch && collegeMatch;
    });
  }, [rows, selectedDomain, selectedCollege]);

  const domainLabel = (value) => (value === "all" ? "All Domains" : value);
  const collegeLabel = (value) => (value === "all" ? "All Colleges" : value);

  return (
    <div className="page-shell">
      <NavBar />
      <main className="page-main">
        <section className="leaderboard-hero glass-panel">
          <div>
            <span className="badge-pill">Live Standings</span>
            <h1 className="font-display">Explore the brightest performers</h1>
            <p>
              Switch views to compare national toppers, deep dive into domain leaderboards, or spotlight a college cohort. Data updates every 5 minutes.
            </p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <TrendingUp size={22} />
              <div>
                <strong>{summary.totalRanked.toLocaleString()}+</strong>
                <span>Ranked nationwide</span>
              </div>
            </div>
            <div className="hero-stat">
              <Target size={22} />
              <div>
                <strong>{summary.domainsTracked}</strong>
                <span>Domains tracked</span>
              </div>
            </div>
          </div>
        </section>

        <div className="leaderboard-controls glass-panel">
          <div className="tab-group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab-pill${tab.id === activeTab ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <button type="button" className="filter-chip">
              <Filter size={16} />
              Filters
            </button>
            <select className="select" value={selectedDomain} onChange={(event) => setSelectedDomain(event.target.value)}>
              {domainOptions.map((option) => (
                <option key={option} value={option}>
                  {domainLabel(option)}
                </option>
              ))}
            </select>
            <select className="select" value={selectedCollege} onChange={(event) => setSelectedCollege(event.target.value)}>
              {collegeOptions.map((option) => (
                <option key={option} value={option}>
                  {collegeLabel(option)}
                </option>
              ))}
            </select>
            <button type="button" className="cta-outline">
              View My Position
            </button>
          </div>
          {error && (
            <p style={{ color: "#f87171", margin: 0 }}>Unable to sync live data right now. Showing the latest cached view.</p>
          )}
        </div>

        <section className="leaderboard-table glass-panel">
          <header className="table-header">
            <span>
              Top performers · {activeTab === "national" ? "All India" : activeTab === "domain" ? "Domain Leaders" : "College Leaders"}
            </span>
            <span className="timestamp">Updated {lastUpdated}</span>
          </header>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>College</th>
                  <th>Domain</th>
                  <th>Score</th>
                  <th>Move</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="table-empty">Loading standings...</td>
                  </tr>
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((row) => (
                    <tr key={`${row.rank}-${row.name}`}>
                      <td>{row.rank}</td>
                      <td>{row.name}</td>
                      <td>{row.college}</td>
                      <td>{row.domain}</td>
                      <td>{row.score}</td>
                      <td>
                        {row.movement === "up" ? (
                          <span className="move up">
                            <ArrowUp size={16} />
                          </span>
                        ) : (
                          <span className="move down">
                            <ArrowDown size={16} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      {error ? "No live entries available." : "No results match your filters yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="leaderboard-summary glass-panel">
          <div className="summary-chart" />
          <div className="summary-copy">
            <h3 className="font-display">Score distribution snapshot</h3>
            <p>
              The blue gradient represents the {summary.percentile}th percentile benchmark for this week. Top cohorts are trending {summary.trendDelta}% higher than last week's average.
            </p>
            <button type="button" className="cta-outline">
              Download report
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
