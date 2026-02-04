import { useState, useEffect, useContext } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AuthContext } from "../components/AuthProvider";
import {
  HelpCircle,
  MessageCircle,
  Eye,
  ThumbsUp,
  Clock,
  Filter,
  Plus,
  CheckCircle,
  Shield,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const categories = [
  { id: "all", name: "All Questions", icon: HelpCircle },
  { id: "academics", name: "Academics", icon: null },
  { id: "placements", name: "Placements", icon: null },
  { id: "hostel", name: "Hostel Life", icon: null },
  { id: "campus", name: "Campus Culture", icon: null },
  { id: "admissions", name: "Admissions", icon: null },
  { id: "fees", name: "Fees & Scholarships", icon: null },
];

const sortOptions = [
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Most Viewed" },
  { id: "mostVoted", label: "Most Voted" },
  { id: "unanswered", label: "Unanswered" },
];

const fallbackQuestions = [
  {
    id: "1",
    title: "How is the placement scenario at IIT Bombay for CSE students?",
    body: "I'm a JEE aspirant targeting IIT Bombay CSE. Can seniors share their placement experiences and the average packages offered?",
    category: "placements",
    view_count: 1250,
    answer_count: 8,
    upvotes: 45,
    status: "answered",
    created_at: "2026-02-01T10:30:00Z",
    users: { name: "Rahul Sharma", is_verified_senior: false },
    communities: { name: "IIT Bombay Hub" },
  },
  {
    id: "2",
    title: "What's the hostel life like at BITS Pilani?",
    body: "Newly admitted to BITS Pilani. Want to know about hostel facilities, food quality, and the overall campus vibe.",
    category: "hostel",
    view_count: 890,
    answer_count: 12,
    upvotes: 32,
    status: "answered",
    created_at: "2026-02-02T15:45:00Z",
    users: { name: "Priya Patel", is_verified_senior: false },
    communities: { name: "BITS Pilani Network" },
  },
  {
    id: "3",
    title: "NIT vs IIIT - Which is better for Computer Science?",
    body: "Got offers from NIT Trichy and IIIT Hyderabad for CSE. Which one has better faculty, placements, and coding culture?",
    category: "academics",
    view_count: 2100,
    answer_count: 15,
    upvotes: 67,
    status: "answered",
    created_at: "2026-01-28T09:20:00Z",
    users: { name: "Aditya Kumar", is_verified_senior: false },
    communities: null,
  },
  {
    id: "4",
    title: "Scholarship opportunities at VIT Vellore?",
    body: "What scholarships are available at VIT for merit students? How to apply and what's the selection criteria?",
    category: "fees",
    view_count: 560,
    answer_count: 0,
    upvotes: 12,
    status: "open",
    created_at: "2026-02-03T18:00:00Z",
    users: { name: "Sneha Reddy", is_verified_senior: false },
    communities: { name: "VIT Vellore Community" },
  },
];

export default function QAPage() {
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState(fallbackQuestions);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        let query = supabase
          .from("questions")
          .select("*, users(name, is_verified_senior), communities(name)")
          .order("created_at", { ascending: false })
          .limit(20);

        if (activeCategory !== "all") {
          query = query.eq("category", activeCategory);
        }

        const { data, error } = await query;

        if (!error && data?.length) {
          setQuestions(data);
        }
      } catch (err) {
        console.warn("Failed to fetch questions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [activeCategory, sortBy]);

  const filteredQuestions = questions.filter(
    (q) =>
      activeCategory === "all" || q.category === activeCategory
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page-shell">
      <NavBar />
      <main className="qa-page">
        <div className="container">
          {/* Hero Section */}
          <header className="qa-hero glass-panel">
            <div className="hero-content">
              <span className="badge-pill">
                <HelpCircle size={16} />
                Q&A Forum
              </span>
              <h1>
                Get <span className="title-gradient">Honest Answers</span> from Real Students
              </h1>
              <p>
                Ask questions about any college. Get answers from verified seniors who've actually experienced it.
              </p>
              <Link href="/qa/ask" className="cta-main">
                <Plus size={20} />
                Ask a Question
              </Link>
            </div>
          </header>

          <div className="qa-layout">
            {/* Sidebar */}
            <aside className="qa-sidebar">
              <div className="filter-section glass-panel">
                <h3>Categories</h3>
                <nav className="category-nav">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.name}
                      {cat.id !== "all" && (
                        <span className="count">
                          {questions.filter((q) => cat.id === "all" || q.category === cat.id).length}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="filter-section glass-panel">
                <h3>Sort By</h3>
                <div className="sort-options">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.id}
                      className={`sort-btn ${sortBy === opt.id ? "active" : ""}`}
                      onClick={() => setSortBy(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Questions List */}
            <section className="questions-list">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading questions...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="empty-state glass-panel">
                  <HelpCircle size={48} />
                  <h3>No questions yet</h3>
                  <p>Be the first to ask a question in this category!</p>
                  <Link href="/qa/ask" className="cta-outline">
                    Ask a Question
                  </Link>
                </div>
              ) : (
                filteredQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} formatDate={formatDate} />
                ))
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .qa-page {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .qa-hero {
          padding: 3rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .qa-hero h1 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          margin: 1rem 0;
        }

        .qa-hero p {
          color: rgba(202, 213, 255, 0.78);
          max-width: 500px;
          margin: 0 auto 1.5rem;
        }

        .qa-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .qa-layout {
            grid-template-columns: 1fr;
          }
          .qa-sidebar {
            display: none;
          }
        }

        .filter-section {
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .filter-section h3 {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          color: rgba(202, 213, 255, 0.6);
        }

        .category-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .category-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          color: rgba(202, 213, 255, 0.8);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .category-btn:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .category-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--accent-primary);
          color: white;
        }

        .category-btn .count {
          font-size: 0.8rem;
          color: rgba(202, 213, 255, 0.5);
        }

        .sort-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .sort-btn {
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 6px;
          color: rgba(202, 213, 255, 0.7);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sort-btn:hover {
          border-color: var(--accent-primary);
        }

        .sort-btn.active {
          background: var(--accent-primary);
          color: white;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem;
        }

        .empty-state p {
          color: rgba(202, 213, 255, 0.6);
          margin-bottom: 1.5rem;
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
      `}</style>
    </div>
  );
}

function QuestionCard({ question, formatDate }) {
  return (
    <article className="question-card glass-panel">
      <div className="card-stats">
        <div className="stat">
          <strong>{question.upvotes}</strong>
          <span>votes</span>
        </div>
        <div className={`stat ${question.answer_count > 0 ? "has-answers" : ""} ${question.status === "answered" ? "accepted" : ""}`}>
          <strong>{question.answer_count}</strong>
          <span>answers</span>
        </div>
        <div className="stat">
          <strong>{question.view_count}</strong>
          <span>views</span>
        </div>
      </div>

      <div className="card-content">
        <Link href={`/qa/${question.id}`} className="question-title">
          {question.title}
        </Link>
        <p className="question-excerpt">{question.body.slice(0, 150)}...</p>

        <div className="card-meta">
          <span className={`category-tag ${question.category}`}>
            {question.category}
          </span>
          {question.communities?.name && (
            <span className="community-tag">
              {question.communities.name}
            </span>
          )}
          <div className="author-info">
            <span className="author-name">
              {question.users?.name || "Anonymous"}
              {question.users?.is_verified_senior && (
                <Shield size={14} className="verified-badge" />
              )}
            </span>
            <span className="post-date">
              <Clock size={14} />
              {formatDate(question.created_at)}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .question-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .question-card:hover {
          border-color: rgba(99, 102, 241, 0.3);
        }

        .card-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 70px;
          text-align: center;
        }

        .stat {
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.4);
        }

        .stat strong {
          display: block;
          font-size: 1.1rem;
        }

        .stat span {
          font-size: 0.7rem;
          color: rgba(202, 213, 255, 0.5);
        }

        .stat.has-answers {
          border: 1px solid #22c55e;
        }

        .stat.accepted {
          background: rgba(34, 197, 94, 0.2);
        }

        .card-content {
          flex: 1;
        }

        .question-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #e2e8f0;
          text-decoration: none;
          display: block;
          margin-bottom: 0.5rem;
          transition: color 0.2s ease;
        }

        .question-title:hover {
          color: var(--accent-primary);
        }

        .question-excerpt {
          color: rgba(202, 213, 255, 0.65);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
        }

        .category-tag {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          background: rgba(99, 102, 241, 0.2);
          color: var(--accent-primary);
        }

        .community-tag {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .author-info {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.8rem;
          color: rgba(202, 213, 255, 0.5);
        }

        .author-name {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        :global(.verified-badge) {
          color: #22c55e;
        }

        .post-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        @media (max-width: 600px) {
          .question-card {
            flex-direction: column;
          }
          .card-stats {
            flex-direction: row;
            justify-content: flex-start;
          }
          .author-info {
            margin-left: 0;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </article>
  );
}
