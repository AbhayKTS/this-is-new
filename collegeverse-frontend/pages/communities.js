import { useState, useEffect, useContext } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AuthContext } from "../components/AuthProvider";
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  ArrowRight,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const fallbackCommunities = [
  {
    id: "1",
    name: "IIT Bombay Hub",
    description: "Connect with students and alumni from IIT Bombay",
    member_count: 2450,
    cover_image_url: null,
    colleges: { name: "IIT Bombay", location: "Mumbai" },
  },
  {
    id: "2",
    name: "BITS Pilani Network",
    description: "Official community for BITS Pilani students",
    member_count: 1820,
    cover_image_url: null,
    colleges: { name: "BITS Pilani", location: "Rajasthan" },
  },
  {
    id: "3",
    name: "NIT Trichy Connect",
    description: "Share experiences and get guidance from NIT Trichy seniors",
    member_count: 1340,
    cover_image_url: null,
    colleges: { name: "NIT Trichy", location: "Tamil Nadu" },
  },
  {
    id: "4",
    name: "VIT Vellore Community",
    description: "For all VITians - current students and alumni",
    member_count: 3200,
    cover_image_url: null,
    colleges: { name: "VIT Vellore", location: "Tamil Nadu" },
  },
];

export default function Communities() {
  const { user } = useContext(AuthContext);
  const [communities, setCommunities] = useState(fallbackCommunities);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [myCommunities, setMyCommunities] = useState([]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const fetchCommunities = async () => {
      try {
        const { data, error } = await supabase
          .from("communities")
          .select("*, colleges(name, location)")
          .order("member_count", { ascending: false })
          .limit(20);

        if (!error && data?.length) {
          setCommunities(data);
        }
      } catch (err) {
        console.warn("Failed to fetch communities", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-shell">
      <NavBar />
      <main className="communities-page">
        <div className="container">
          {/* Hero Section */}
          <header className="communities-hero glass-panel">
            <div className="hero-content">
              <span className="badge-pill">
                <Users size={16} />
                College Communities
              </span>
              <h1>
                Connect with Your <span className="title-gradient">College Tribe</span>
              </h1>
              <p>
                Join verified college communities. Ask questions, share experiences, and get honest guidance from seniors who've been there.
              </p>
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search communities by college name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <strong>150+</strong>
                <span>Active Communities</span>
              </div>
              <div className="stat-item">
                <strong>25K+</strong>
                <span>Verified Seniors</span>
              </div>
              <div className="stat-item">
                <strong>100K+</strong>
                <span>Questions Answered</span>
              </div>
            </div>
          </header>

          {/* Community Grid */}
          <section className="communities-grid">
            <div className="section-header">
              <h2>Popular Communities</h2>
              <Link href="/communities/create" className="cta-outline small">
                <Plus size={18} />
                Create Community
              </Link>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading communities...</p>
              </div>
            ) : (
              <div className="card-grid">
                {filteredCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            )}
          </section>

          {/* Why Join Section */}
          <section className="why-join glass-panel">
            <h2>Why Join a College Community?</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <Shield size={32} className="benefit-icon" />
                <h3>Verified Seniors</h3>
                <p>Get guidance from college ID verified seniors only</p>
              </div>
              <div className="benefit-item">
                <MessageSquare size={32} className="benefit-icon" />
                <h3>Honest Answers</h3>
                <p>Real experiences, not sugar-coated advertisements</p>
              </div>
              <div className="benefit-item">
                <TrendingUp size={32} className="benefit-icon" />
                <h3>Make Better Decisions</h3>
                <p>Compare colleges based on actual student feedback</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .communities-page {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .communities-hero {
          padding: 3rem;
          margin-bottom: 3rem;
          text-align: center;
        }

        .communities-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          margin: 1rem 0;
        }

        .communities-hero p {
          color: rgba(202, 213, 255, 0.78);
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.7;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-bar input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          outline: none;
        }

        .search-bar input::placeholder {
          color: rgba(148, 163, 184, 0.6);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .stat-item {
          text-align: center;
        }

        .stat-item strong {
          display: block;
          font-size: 1.5rem;
          color: var(--accent-primary);
        }

        .stat-item span {
          font-size: 0.875rem;
          color: rgba(202, 213, 255, 0.6);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-header h2 {
          margin: 0;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .why-join {
          margin-top: 4rem;
          padding: 3rem;
          text-align: center;
        }

        .why-join h2 {
          margin-bottom: 2rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .benefit-item {
          padding: 1.5rem;
        }

        .benefit-icon {
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .benefit-item h3 {
          margin-bottom: 0.5rem;
        }

        .benefit-item p {
          color: rgba(202, 213, 255, 0.7);
          font-size: 0.9rem;
        }

        .loading-state {
          text-align: center;
          padding: 4rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(148, 163, 184, 0.2);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .cta-outline.small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

function CommunityCard({ community }) {
  return (
    <article className="community-card tilt-card">
      <div className="card-header">
        <div className="college-avatar">
          {community.colleges?.name?.charAt(0) || "C"}
        </div>
        <div className="college-info">
          <h3>{community.name}</h3>
          <span className="college-location">
            {community.colleges?.name} • {community.colleges?.location}
          </span>
        </div>
      </div>
      <p className="card-description">{community.description}</p>
      <div className="card-footer">
        <span className="member-count">
          <Users size={16} />
          {community.member_count?.toLocaleString()} members
        </span>
        <Link href={`/communities/${community.id}`} className="join-btn">
          View
          <ArrowRight size={16} />
        </Link>
      </div>

      <style jsx>{`
        .community-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .community-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-4px);
        }

        .card-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .college-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .college-info h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .college-location {
          font-size: 0.8rem;
          color: rgba(202, 213, 255, 0.6);
        }

        .card-description {
          color: rgba(202, 213, 255, 0.75);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .member-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(202, 213, 255, 0.6);
        }

        .join-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid var(--accent-primary);
          border-radius: 8px;
          color: var(--accent-primary);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .join-btn:hover {
          background: var(--accent-primary);
          color: white;
        }
      `}</style>
    </article>
  );
}
