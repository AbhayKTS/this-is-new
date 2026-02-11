import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../components/AuthContext";
import { Star, MapPin, Globe, Phone, Mail, Building2, Users, GraduationCap, Trophy, Briefcase, ThumbsUp, MessageCircle, Send, ArrowLeft, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

const demoColleges = {
  "1": { name: "IIT Bombay", location: "Mumbai, Maharashtra", type: "Government", established: 1958, website: "iitb.ac.in", phone: "+91-22-2572-2545", email: "info@iitb.ac.in", rating: 4.7, ratings: 1250, students: 12400, faculty: 680, courses: 95, avgPkg: 21.5, highPkg: 280, placementRate: 96 },
  "2": { name: "IIT Delhi", location: "New Delhi", type: "Government", established: 1961, website: "iitd.ac.in", phone: "+91-11-2659-1999", email: "info@iitd.ac.in", rating: 4.8, ratings: 1100, students: 11200, faculty: 620, courses: 88, avgPkg: 22.0, highPkg: 300, placementRate: 97 },
  "3": { name: "BITS Pilani", location: "Pilani, Rajasthan", type: "Private", established: 1964, website: "bits-pilani.ac.in", phone: "+91-1596-242-210", email: "info@bits-pilani.ac.in", rating: 4.5, ratings: 890, students: 9800, faculty: 450, courses: 72, avgPkg: 18.5, highPkg: 150, placementRate: 93 },
};

const demoReviews = [
  { id: 1, author: "Verified Student", date: "2 weeks ago", rating: 5, title: "Best engineering college in India", content: "The academics are world-class. Faculty is incredibly supportive and the research opportunities are unmatched. Campus life is vibrant with tons of clubs and events.", pros: "Excellent faculty, Great placements, Amazing campus", cons: "Competitive environment, Pressure can be high", helpful: 42 },
  { id: 2, author: "Alumni 2023", date: "1 month ago", rating: 4, title: "Great experience overall", content: "Loved my time here. The curriculum is rigorous but prepares you well for the industry. The alumni network is incredibly strong.", pros: "Strong alumni network, Good infrastructure", cons: "Food quality could improve", helpful: 28 },
  { id: 3, author: "Current Student", date: "3 months ago", rating: 4, title: "Solid academics with room for improvement", content: "The teaching quality is great for core subjects. Electives could have more variety. The campus is beautiful and well-maintained.", pros: "Beautiful campus, Good labs", cons: "Limited elective options", helpful: 15 },
];

const tabs = ["overview", "academics", "placements", "reviews"];

export default function CollegeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", content: "", pros: "", cons: "" });
  const [votes, setVotes] = useState({});

  const college = demoColleges[id] || demoColleges["1"];
  if (!college) return null;

  const toggleVote = (reviewId) => setVotes((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));

  const StarRating = ({ value, onChange, size = 20 }) => (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} style={{ cursor: onChange ? "pointer" : "default", color: s <= value ? "var(--warning)" : "var(--glass-border)", fill: s <= value ? "var(--warning)" : "none" }} onClick={() => onChange && onChange(s)} />
      ))}
    </div>
  );

  return (
    <div>
      <Head><title>{college.name} | CollegeVerse</title></Head>
      <NavBar />
      <main style={{ minHeight: "100vh", paddingTop: "5rem" }}>
        <div className="container" style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <Link href="/colleges" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> Back to colleges
          </Link>

          <div className="section-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                {college.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 0.35rem" }}>{college.name}</h1>
                <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4, margin: "0 0 0.5rem" }}><MapPin size={14} /> {college.location}</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span className={"status-pill " + (college.type === "Government" ? "success" : "info")}>{college.type}</span>
                  <span className="status-pill" style={{ background: "rgba(139,92,246,0.15)", color: "var(--accent)" }}>Est. {college.established}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", justifyContent: "flex-end", marginBottom: "0.25rem" }}>
                  <Star size={20} style={{ color: "var(--warning)", fill: "var(--warning)" }} />
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{college.rating}</span>
                </div>
                <p style={{ color: "var(--text-dim)", fontSize: "0.78rem", margin: 0 }}>{college.ratings} ratings</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
            {tabs.map((t) => (
              <button key={t} className={"filter-tab" + (activeTab === t ? " active" : "")} onClick={() => setActiveTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div>
              <div className="item-grid" style={{ marginBottom: "2rem" }}>
                {[
                  { label: "Students", value: college.students.toLocaleString(), icon: Users },
                  { label: "Faculty", value: college.faculty, icon: GraduationCap },
                  { label: "Courses", value: college.courses, icon: Building2 },
                  { label: "Placement Rate", value: college.placementRate + "%", icon: Trophy },
                ].map((s) => (
                  <div key={s.label} className="stat-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--glass-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}><s.icon size={20} /></div>
                    <div>
                      <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: 0 }}>{s.value}</p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="section-card">
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", marginBottom: "1rem" }}>Contact Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {[
                    { label: "Website", value: college.website, icon: Globe },
                    { label: "Phone", value: college.phone, icon: Phone },
                    { label: "Email", value: college.email, icon: Mail },
                  ].map((c) => (
                    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <c.icon size={16} style={{ color: "var(--accent)" }} />
                      <div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", margin: 0 }}>{c.label}</p>
                        <p style={{ fontSize: "0.88rem", color: "var(--info)", margin: 0 }}>{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "academics" && (
            <div className="section-card">
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", marginBottom: "1rem" }}>Academic Highlights</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["World-class research labs in AI, Robotics, and Quantum Computing", "95+ undergraduate and postgraduate programs", "International exchange programs with 40+ universities", "Industry-sponsored projects and capstone programs", "State-of-the-art library with 500K+ resources"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", borderRadius: 10, background: "var(--glass-bg)" }}>
                    <CheckCircle size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
                    <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "placements" && (
            <div>
              <div className="item-grid" style={{ marginBottom: "2rem" }}>
                {[
                  { label: "Avg Package", value: college.avgPkg + " LPA", color: "var(--success)" },
                  { label: "Highest Package", value: college.highPkg + " LPA", color: "var(--accent)" },
                  { label: "Placement Rate", value: college.placementRate + "%", color: "var(--warning)" },
                ].map((s) => (
                  <div key={s.label} className="stat-card" style={{ padding: "1.25rem", borderLeft: "3px solid " + s.color }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color, margin: "0 0 0.1rem" }}>{s.value}</p>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="section-card">
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", marginBottom: "1rem" }}>Top Recruiters</h3>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {["Google", "Microsoft", "Amazon", "Goldman Sachs", "Flipkart", "Adobe", "Oracle", "Samsung", "Uber", "McKinsey"].map((company) => (
                    <span key={company} className="status-pill info">{company}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "white", margin: 0 }}>Student Reviews ({demoReviews.length})</h3>
                {isAuthenticated && (
                  <button className="btn-primary btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                    <Send size={14} /> Write Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="section-card" style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ color: "white", fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}>Write Your Review</h4>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginBottom: 4, display: "block" }}>Overall Rating</label>
                    <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                  </div>
                  <input className="form-input" placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} style={{ marginBottom: "0.75rem" }} />
                  <textarea className="form-input" rows={3} placeholder="Share your experience..." value={reviewForm.content} onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })} style={{ marginBottom: "0.75rem" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                    <input className="form-input" placeholder="Pros (comma separated)" value={reviewForm.pros} onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })} />
                    <input className="form-input" placeholder="Cons (comma separated)" value={reviewForm.cons} onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })} />
                  </div>
                  <button className="btn-primary btn-sm">Submit Review</button>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {demoReviews.map((r) => (
                  <div key={r.id} className="section-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "white", margin: "0 0 0.25rem" }}>{r.title}</h4>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>{r.author} &middot; {r.date}</p>
                      </div>
                      <StarRating value={r.rating} size={16} />
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>{r.content}</p>
                    {r.pros && <p style={{ fontSize: "0.82rem", marginBottom: "0.35rem" }}><span style={{ color: "var(--success)", fontWeight: 500 }}>Pros:</span> <span style={{ color: "var(--text-muted)" }}>{r.pros}</span></p>}
                    {r.cons && <p style={{ fontSize: "0.82rem", marginBottom: "0.75rem" }}><span style={{ color: "var(--error)", fontWeight: 500 }}>Cons:</span> <span style={{ color: "var(--text-muted)" }}>{r.cons}</span></p>}
                    <button className={"btn-ghost btn-sm" + (votes[r.id] ? " active" : "")} onClick={() => toggleVote(r.id)} style={{ color: votes[r.id] ? "var(--accent)" : "var(--text-dim)" }}>
                      <ThumbsUp size={14} /> Helpful ({r.helpful + (votes[r.id] ? 1 : 0)})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}