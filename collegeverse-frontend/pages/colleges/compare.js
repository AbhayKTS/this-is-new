import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import {
  School,
  Search,
  MapPin,
  Star,
  Scale,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Home,
  Users,
  Building,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

const fallbackColleges = [
  {
    id: "1",
    name: "Indian Institute of Technology Bombay",
    location: "Mumbai, Maharashtra",
    type: "IIT",
    overall_rating: 4.8,
    placement_rating: 4.9,
    academics_rating: 4.7,
    hostel_rating: 4.2,
    campus_rating: 4.6,
    infrastructure_rating: 4.5,
    total_reviews: 245,
  },
  {
    id: "2",
    name: "Birla Institute of Technology and Science, Pilani",
    location: "Pilani, Rajasthan",
    type: "Private",
    overall_rating: 4.6,
    placement_rating: 4.5,
    academics_rating: 4.6,
    hostel_rating: 4.3,
    campus_rating: 4.7,
    infrastructure_rating: 4.4,
    total_reviews: 189,
  },
  {
    id: "3",
    name: "National Institute of Technology Trichy",
    location: "Tiruchirappalli, Tamil Nadu",
    type: "NIT",
    overall_rating: 4.5,
    placement_rating: 4.4,
    academics_rating: 4.5,
    hostel_rating: 4.0,
    campus_rating: 4.4,
    infrastructure_rating: 4.3,
    total_reviews: 156,
  },
];

const ratingCategories = [
  { key: "academics_rating", label: "Academics", icon: School },
  { key: "placement_rating", label: "Placements", icon: Briefcase },
  { key: "hostel_rating", label: "Hostel", icon: Home },
  { key: "campus_rating", label: "Campus Life", icon: Users },
  { key: "infrastructure_rating", label: "Infrastructure", icon: Building },
];

export default function CompareColleges() {
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allColleges, setAllColleges] = useState(fallbackColleges);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchColleges = async () => {
      try {
        const { data } = await supabase
          .from("colleges")
          .select("*")
          .order("overall_rating", { ascending: false })
          .limit(50);
        if (data?.length) setAllColleges(data);
      } catch (err) {
        console.warn("Failed to fetch colleges", err);
      }
    };

    fetchColleges();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const filtered = allColleges.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedColleges.find((s) => s.id === c.id)
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, allColleges, selectedColleges]);

  const addCollege = (college) => {
    if (selectedColleges.length >= 4) {
      alert("You can compare up to 4 colleges");
      return;
    }
    setSelectedColleges([...selectedColleges, college]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeCollege = (collegeId) => {
    setSelectedColleges(selectedColleges.filter((c) => c.id !== collegeId));
  };

  const getWinner = (key) => {
    if (selectedColleges.length < 2) return null;
    let maxVal = -1;
    let winnerId = null;
    selectedColleges.forEach((c) => {
      if ((c[key] || 0) > maxVal) {
        maxVal = c[key] || 0;
        winnerId = c.id;
      }
    });
    return winnerId;
  };

  return (
    <div className="page-shell">
      <NavBar />
      <main className="compare-page">
        <div className="container">
          <header className="compare-hero glass-panel">
            <Link href="/colleges" className="back-link">
              <ChevronLeft size={20} />
              Back to Colleges
            </Link>
            <span className="badge-pill">
              <Scale size={16} />
              College Comparison
            </span>
            <h1>
              Compare <span className="title-gradient">Colleges Side by Side</span>
            </h1>
            <p>
              Select up to 4 colleges to compare based on real student ratings across academics, placements, hostel, and more.
            </p>
          </header>

          {/* College Selection */}
          <section className="selection-section glass-panel">
            <h2>Select Colleges to Compare</h2>
            <div className="search-container">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search for a college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((college) => (
                    <li key={college.id} onClick={() => addCollege(college)}>
                      <span className="college-name">{college.name}</span>
                      <span className="college-location">{college.location}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="selected-colleges">
              {selectedColleges.map((college) => (
                <div key={college.id} className="selected-tag">
                  <span>{college.name}</span>
                  <button onClick={() => removeCollege(college.id)}>×</button>
                </div>
              ))}
              {selectedColleges.length === 0 && (
                <p className="hint">Search and add colleges above to start comparing</p>
              )}
            </div>
          </section>

          {/* Comparison Table */}
          {selectedColleges.length >= 2 && (
            <section className="comparison-section">
              <div className="comparison-table">
                {/* Header Row */}
                <div className="table-row header-row">
                  <div className="category-cell">Category</div>
                  {selectedColleges.map((college) => (
                    <div key={college.id} className="college-cell">
                      <div className="college-header">
                        <h3>{college.name}</h3>
                        <span className="college-type">{college.type}</span>
                        <div className="overall-rating">
                          <Star size={16} className="star-icon" />
                          <strong>{college.overall_rating?.toFixed(1) || "N/A"}</strong>
                          <span>({college.total_reviews || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rating Categories */}
                {ratingCategories.map((category) => {
                  const winnerId = getWinner(category.key);
                  return (
                    <div key={category.key} className="table-row">
                      <div className="category-cell">
                        <category.icon size={18} />
                        {category.label}
                      </div>
                      {selectedColleges.map((college) => (
                        <div
                          key={college.id}
                          className={`college-cell ${winnerId === college.id ? "winner" : ""}`}
                        >
                          <div className="rating-display">
                            <div className="rating-bar">
                              <div
                                className="rating-fill"
                                style={{ width: `${(college[category.key] || 0) * 20}%` }}
                              />
                            </div>
                            <span className="rating-value">
                              {college[category.key]?.toFixed(1) || "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Verdict */}
              <div className="verdict glass-panel">
                <h3>Quick Verdict</h3>
                <div className="verdict-grid">
                  {ratingCategories.slice(0, 3).map((category) => {
                    const winnerId = getWinner(category.key);
                    const winner = selectedColleges.find((c) => c.id === winnerId);
                    return (
                      <div key={category.key} className="verdict-item">
                        <span className="verdict-label">Best for {category.label}</span>
                        <strong>{winner?.name || "N/A"}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {selectedColleges.length < 2 && selectedColleges.length > 0 && (
            <div className="hint-section glass-panel">
              <p>Add at least one more college to start comparison</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .compare-page {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .compare-hero {
          padding: 2rem 3rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(202, 213, 255, 0.6);
          text-decoration: none;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .back-link:hover {
          color: var(--accent-primary);
        }

        .compare-hero h1 {
          font-size: clamp(1.5rem, 4vw, 2rem);
          margin: 1rem 0;
        }

        .compare-hero p {
          color: rgba(202, 213, 255, 0.7);
          max-width: 600px;
          margin: 0 auto;
        }

        .selection-section {
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .selection-section h2 {
          margin-bottom: 1.5rem;
        }

        .search-container {
          position: relative;
          max-width: 500px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 1rem 1.5rem;
        }

        .search-bar input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          outline: none;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          margin-top: 0.5rem;
          list-style: none;
          padding: 0;
          z-index: 10;
          max-height: 300px;
          overflow-y: auto;
        }

        .search-results li {
          padding: 1rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          transition: background 0.2s ease;
        }

        .search-results li:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .search-results li:last-child {
          border-bottom: none;
        }

        .search-results .college-name {
          display: block;
          font-weight: 500;
        }

        .search-results .college-location {
          font-size: 0.8rem;
          color: rgba(202, 213, 255, 0.5);
        }

        .selected-colleges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .selected-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid var(--accent-primary);
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .selected-tag button {
          background: none;
          border: none;
          color: rgba(202, 213, 255, 0.6);
          font-size: 1.2rem;
          cursor: pointer;
          line-height: 1;
        }

        .selected-tag button:hover {
          color: #ef4444;
        }

        .hint {
          color: rgba(202, 213, 255, 0.5);
          font-size: 0.9rem;
        }

        .comparison-section {
          margin-bottom: 2rem;
        }

        .comparison-table {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          overflow: hidden;
        }

        .table-row {
          display: grid;
          grid-template-columns: 180px repeat(${selectedColleges.length}, 1fr);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .header-row {
          background: rgba(99, 102, 241, 0.1);
        }

        .category-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          font-weight: 500;
          border-right: 1px solid rgba(148, 163, 184, 0.1);
        }

        .college-cell {
          padding: 1rem 1.5rem;
          border-right: 1px solid rgba(148, 163, 184, 0.1);
          transition: background 0.2s ease;
        }

        .college-cell:last-child {
          border-right: none;
        }

        .college-cell.winner {
          background: rgba(34, 197, 94, 0.1);
        }

        .college-header h3 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .college-type {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 4px;
          font-size: 0.7rem;
          margin-bottom: 0.5rem;
        }

        .overall-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        :global(.star-icon) {
          color: #f59e0b;
          fill: #f59e0b;
        }

        .overall-rating span {
          color: rgba(202, 213, 255, 0.5);
          font-size: 0.75rem;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rating-bar {
          flex: 1;
          height: 8px;
          background: rgba(148, 163, 184, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .rating-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 4px;
        }

        .rating-value {
          font-weight: 600;
          min-width: 40px;
        }

        .verdict {
          margin-top: 2rem;
          padding: 2rem;
        }

        .verdict h3 {
          margin-bottom: 1.5rem;
        }

        .verdict-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .verdict-item {
          padding: 1rem;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 8px;
        }

        .verdict-label {
          display: block;
          font-size: 0.85rem;
          color: rgba(202, 213, 255, 0.6);
          margin-bottom: 0.5rem;
        }

        .hint-section {
          text-align: center;
          padding: 3rem;
          color: rgba(202, 213, 255, 0.6);
        }

        @media (max-width: 768px) {
          .table-row {
            grid-template-columns: 120px repeat(${selectedColleges.length}, 1fr);
          }
          .category-cell {
            padding: 0.75rem;
            font-size: 0.85rem;
          }
          .college-cell {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
