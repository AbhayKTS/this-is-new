import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../components/AuthContext";
import { HelpCircle, MessageCircle, Eye, ThumbsUp, Clock, Search, Plus, CheckCircle, Shield } from "lucide-react";

const categories = [
  { id: "all", label: "All Questions" },
  { id: "academics", label: "Academics" },
  { id: "placements", label: "Placements" },
  { id: "hostel", label: "Hostel Life" },
  { id: "campus", label: "Campus Culture" },
  { id: "admissions", label: "Admissions" },
  { id: "fees", label: "Fees & Scholarships" },
];

const demoQuestions = [
  { id: "1", title: "How is the placement scenario at IIT Bombay for CSE students?", category: "placements", views: 1250, answers: 8, upvotes: 45, status: "answered", author: "Rahul Sharma", community: "IIT Bombay Hub", time: "3 days ago" },
  { id: "2", title: "What is the hostel life like at BITS Pilani?", category: "hostel", views: 890, answers: 12, upvotes: 32, status: "answered", author: "Priya Patel", community: "BITS Pilani Network", time: "2 days ago" },
  { id: "3", title: "NIT vs IIIT - Which is better for Computer Science?", category: "academics", views: 2100, answers: 15, upvotes: 67, status: "answered", author: "Aditya Kumar", community: null, time: "5 days ago" },
  { id: "4", title: "Scholarship opportunities at VIT Vellore?", category: "fees", views: 670, answers: 4, upvotes: 18, status: "open", author: "Meera Das", community: "VIT Community", time: "1 day ago" },
  { id: "5", title: "Best coding clubs to join in Delhi University?", category: "campus", views: 540, answers: 6, upvotes: 24, status: "answered", author: "Vikas Sharma", community: null, time: "4 days ago" },
  { id: "6", title: "How to prepare for JEE Advanced while in 12th?", category: "admissions", views: 3200, answers: 22, upvotes: 89, status: "answered", author: "Sneha Gupta", community: null, time: "1 week ago" },
];

export default function QAPage() {
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = demoQuestions.filter((q) => {
    if (activeCategory !== "all" && q.category !== activeCategory) return false;
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout title="Q&A Forum" showSearch={false}>
      <div className="page-hero">
        <span className="badge-pill"><HelpCircle size={14} /> Community Q&A</span>
        <h1>Ask. Answer. <span className="text-gradient">Grow together.</span></h1>
        <p>Get verified answers from seniors, faculty, and industry mentors.</p>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        {isAuthenticated && (
          <button className="btn-primary btn-sm" style={{ marginLeft: "auto" }}><Plus size={16} /> Ask Question</button>
        )}
      </div>

      <div className="filter-bar" style={{ paddingTop: 0 }}>
        {categories.map((cat) => (
          <button key={cat.id} className={`filter-tab${activeCategory === cat.id ? " active" : ""}`} onClick={() => setActiveCategory(cat.id)}>
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HelpCircle size={28} /></div>
          <h3>No questions found</h3>
          <p>Try changing your filters or ask a new question.</p>
        </div>
      ) : (
        <div className="item-list">
          {filtered.map((q) => (
            <div key={q.id} className="item-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%" }}>
                <h3 style={{ flex: 1, fontSize: "1rem", fontWeight: 600, color: "white", margin: 0 }}>{q.title}</h3>
                <span className={`status-pill ${q.status === "answered" ? "success" : "info"}`}>
                  {q.status === "answered" ? <><CheckCircle size={12} /> Answered</> : "Open"}
                </span>
              </div>
              <div className="qa-meta">
                <span className="qa-meta-item"><Eye size={14} /> {q.views}</span>
                <span className="qa-meta-item"><MessageCircle size={14} /> {q.answers} answers</span>
                <span className="qa-meta-item"><ThumbsUp size={14} /> {q.upvotes}</span>
                <span className="qa-meta-item"><Clock size={14} /> {q.time}</span>
                <span className="qa-meta-item"><Shield size={14} /> {q.author}</span>
                {q.community && <span className="qa-meta-item" style={{ color: "var(--accent)" }}>{q.community}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}