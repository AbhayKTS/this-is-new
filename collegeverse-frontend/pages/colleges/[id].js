import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import { useAuth } from "../../components/AuthContext";
import { 
  Star, 
  MapPin, 
  Globe, 
  Phone, 
  Mail,
  Building2,
  Users,
  GraduationCap,
  Trophy,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter
} from "lucide-react";

export default function CollegeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [college, setCollege] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSort, setReviewSort] = useState("recent");
  const [expandedReviews, setExpandedReviews] = useState({});
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    academicsRating: 0,
    facilitiesRating: 0,
    placementRating: 0,
    campusLifeRating: 0,
    title: "",
    content: "",
    pros: "",
    cons: "",
    anonymous: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch college details
  useEffect(() => {
    if (id) {
      fetchCollegeData();
    }
  }, [id]);

  const fetchCollegeData = async () => {
    setLoading(true);
    try {
      // Fetch college details
      const collegeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/colleges/${id}`);
      if (!collegeRes.ok) throw new Error("College not found");
      const collegeData = await collegeRes.json();
      setCollege(collegeData.data || collegeData);

      // Fetch reviews
      const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/colleges/${id}/reviews`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.data || reviewsData || []);
      }
    } catch (err) {
      console.error("Error fetching college:", err);
      setError(err.message);
      // Use fallback data for demo
      setCollege(fallbackCollegeData);
      setReviews(fallbackReviews);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth?redirect=" + encodeURIComponent(router.asPath));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/colleges/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          categoryRatings: {
            academics: reviewForm.academicsRating,
            facilities: reviewForm.facilitiesRating,
            placement: reviewForm.placementRating,
            campusLife: reviewForm.campusLifeRating
          },
          title: reviewForm.title,
          content: reviewForm.content,
          pros: reviewForm.pros.split("\n").filter(p => p.trim()),
          cons: reviewForm.cons.split("\n").filter(c => c.trim()),
          anonymous: reviewForm.anonymous
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to submit review");
      }

      setSubmitSuccess(true);
      setShowReviewForm(false);
      setReviewForm({
        rating: 0,
        academicsRating: 0,
        facilitiesRating: 0,
        placementRating: 0,
        campusLifeRating: 0,
        title: "",
        content: "",
        pros: "",
        cons: "",
        anonymous: false
      });
      
      // Refresh reviews
      fetchCollegeData();
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!user) {
      router.push("/auth?redirect=" + encodeURIComponent(router.asPath));
      return;
    }

    try {
      const token = await user.getIdToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ voteType })
      });
      
      // Update local state
      setReviews(reviews.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            upvotes: voteType === "up" ? (r.upvotes || 0) + 1 : r.upvotes,
            downvotes: voteType === "down" ? (r.downvotes || 0) + 1 : r.downvotes
          };
        }
        return r;
      }));
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const toggleReviewExpand = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const renderStars = (rating, size = 16, interactive = false, onChange = null) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`star ${star <= rating ? "filled" : ""} ${interactive ? "interactive" : ""}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === "recent") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (reviewSort === "helpful") {
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else if (reviewSort === "highest") {
      return b.rating - a.rating;
    } else if (reviewSort === "lowest") {
      return a.rating - b.rating;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Loading college details...</p>
      </div>
    );
  }

  if (error && !college) {
    return (
      <div className="error-container">
        <AlertCircle size={48} />
        <h2>College Not Found</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/colleges")} className="btn-primary">
          Browse Colleges
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{college?.name || "College"} | CollegeVerse</title>
      </Head>
      
      <NavBar />
      
      <main className="college-detail-page">
        {/* Back Button */}
        <button className="back-btn" onClick={() => router.back()}>
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Hero Section */}
        <section className="college-hero">
          <div className="hero-bg" style={{ backgroundImage: `url(${college?.coverImage || '/images/college-default.jpg'})` }} />
          <div className="hero-content">
            <div className="college-logo">
              {college?.logo ? (
                <img src={college.logo} alt={college.name} />
              ) : (
                <Building2 size={48} />
              )}
            </div>
            <div className="college-info">
              <h1>{college?.name}</h1>
              <div className="college-meta">
                <span><MapPin size={16} /> {college?.city}, {college?.state}</span>
                <span><Building2 size={16} /> {college?.type || "University"}</span>
                <span><GraduationCap size={16} /> Est. {college?.established || "N/A"}</span>
              </div>
              <div className="college-rating">
                {renderStars(college?.averageRating || 0, 20)}
                <span className="rating-value">{(college?.averageRating || 0).toFixed(1)}</span>
                <span className="rating-count">({college?.totalReviews || reviews.length} reviews)</span>
              </div>
            </div>
            <div className="hero-actions">
              <button 
                className="btn-primary"
                onClick={() => {
                  setActiveTab("reviews");
                  setShowReviewForm(true);
                }}
              >
                Write a Review
              </button>
              <button 
                className="btn-secondary"
                onClick={() => router.push(`/colleges/compare?colleges=${id}`)}
              >
                Compare
              </button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews & Ratings
          </button>
          <button 
            className={`tab ${activeTab === "placements" ? "active" : ""}`}
            onClick={() => setActiveTab("placements")}
          >
            Placements
          </button>
          <button 
            className={`tab ${activeTab === "qa" ? "active" : ""}`}
            onClick={() => setActiveTab("qa")}
          >
            Q&A
          </button>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="success-message">
            <CheckCircle size={20} />
            Review submitted successfully! Thank you for your feedback.
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              {/* Quick Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <Trophy className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">#{college?.ranking || "N/A"}</span>
                    <span className="stat-label">NIRF Ranking</span>
                  </div>
                </div>
                <div className="stat-card">
                  <Users className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{college?.totalStudents?.toLocaleString() || "N/A"}</span>
                    <span className="stat-label">Students</span>
                  </div>
                </div>
                <div className="stat-card">
                  <Briefcase className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{college?.placementRate || "N/A"}%</span>
                    <span className="stat-label">Placement Rate</span>
                  </div>
                </div>
                <div className="stat-card">
                  <GraduationCap className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{college?.courses?.length || 0}</span>
                    <span className="stat-label">Courses</span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="section-card">
                <h2>About {college?.name}</h2>
                <p>{college?.description || "No description available."}</p>
              </div>

              {/* Contact Info */}
              <div className="section-card">
                <h2>Contact Information</h2>
                <div className="contact-grid">
                  {college?.website && (
                    <a href={college.website} target="_blank" rel="noopener noreferrer" className="contact-item">
                      <Globe size={18} />
                      <span>{college.website}</span>
                    </a>
                  )}
                  {college?.email && (
                    <a href={`mailto:${college.email}`} className="contact-item">
                      <Mail size={18} />
                      <span>{college.email}</span>
                    </a>
                  )}
                  {college?.phone && (
                    <a href={`tel:${college.phone}`} className="contact-item">
                      <Phone size={18} />
                      <span>{college.phone}</span>
                    </a>
                  )}
                  {college?.address && (
                    <div className="contact-item">
                      <MapPin size={18} />
                      <span>{college.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="section-card">
                <h2>Rating Breakdown</h2>
                <div className="rating-breakdown">
                  {[
                    { label: "Academics", key: "academics", color: "#3b82f6" },
                    { label: "Facilities", key: "facilities", color: "#10b981" },
                    { label: "Placements", key: "placement", color: "#f59e0b" },
                    { label: "Campus Life", key: "campusLife", color: "#8b5cf6" }
                  ].map(({ label, key, color }) => (
                    <div key={key} className="rating-bar">
                      <span className="rating-label">{label}</span>
                      <div className="rating-progress">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${((college?.categoryRatings?.[key] || 0) / 5) * 100}%`,
                            backgroundColor: color
                          }} 
                        />
                      </div>
                      <span className="rating-number">{(college?.categoryRatings?.[key] || 0).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-tab">
              {/* Review Form Toggle */}
              {!showReviewForm && (
                <button 
                  className="btn-write-review"
                  onClick={() => setShowReviewForm(true)}
                >
                  <MessageCircle size={20} />
                  Write a Review
                </button>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div className="review-form-card">
                  <h3>Share Your Experience</h3>
                  {!user && (
                    <div className="auth-notice">
                      <AlertCircle size={18} />
                      Please <a href={`/auth?redirect=${encodeURIComponent(router.asPath)}`}>login</a> to submit a review.
                    </div>
                  )}
                  
                  <form onSubmit={handleReviewSubmit}>
                    {/* Overall Rating */}
                    <div className="form-group">
                      <label>Overall Rating *</label>
                      {renderStars(reviewForm.rating, 32, true, (val) => 
                        setReviewForm({ ...reviewForm, rating: val })
                      )}
                    </div>

                    {/* Category Ratings */}
                    <div className="category-ratings">
                      <div className="form-group">
                        <label>Academics</label>
                        {renderStars(reviewForm.academicsRating, 24, true, (val) => 
                          setReviewForm({ ...reviewForm, academicsRating: val })
                        )}
                      </div>
                      <div className="form-group">
                        <label>Facilities</label>
                        {renderStars(reviewForm.facilitiesRating, 24, true, (val) => 
                          setReviewForm({ ...reviewForm, facilitiesRating: val })
                        )}
                      </div>
                      <div className="form-group">
                        <label>Placements</label>
                        {renderStars(reviewForm.placementRating, 24, true, (val) => 
                          setReviewForm({ ...reviewForm, placementRating: val })
                        )}
                      </div>
                      <div className="form-group">
                        <label>Campus Life</label>
                        {renderStars(reviewForm.campusLifeRating, 24, true, (val) => 
                          setReviewForm({ ...reviewForm, campusLifeRating: val })
                        )}
                      </div>
                    </div>

                    {/* Review Title */}
                    <div className="form-group">
                      <label>Review Title *</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                        placeholder="Summarize your experience in a title"
                        required
                      />
                    </div>

                    {/* Review Content */}
                    <div className="form-group">
                      <label>Your Review *</label>
                      <textarea
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                        placeholder="Share details about your experience at this college..."
                        rows={5}
                        required
                      />
                    </div>

                    {/* Pros */}
                    <div className="form-group">
                      <label>Pros (one per line)</label>
                      <textarea
                        value={reviewForm.pros}
                        onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                        placeholder="Great faculty&#10;Good campus infrastructure&#10;Active clubs"
                        rows={3}
                      />
                    </div>

                    {/* Cons */}
                    <div className="form-group">
                      <label>Cons (one per line)</label>
                      <textarea
                        value={reviewForm.cons}
                        onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                        placeholder="Limited parking&#10;Expensive canteen"
                        rows={3}
                      />
                    </div>

                    {/* Anonymous */}
                    <div className="form-group checkbox-group">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={reviewForm.anonymous}
                        onChange={(e) => setReviewForm({ ...reviewForm, anonymous: e.target.checked })}
                      />
                      <label htmlFor="anonymous">Post anonymously</label>
                    </div>

                    {submitError && (
                      <div className="error-notice">
                        <AlertCircle size={18} />
                        {submitError}
                      </div>
                    )}

                    <div className="form-actions">
                      <button type="button" className="btn-cancel" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={submitting || !user || reviewForm.rating === 0}
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="reviews-list">
                <div className="reviews-header">
                  <h3>{reviews.length} Reviews</h3>
                  <div className="reviews-sort">
                    <Filter size={16} />
                    <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)}>
                      <option value="recent">Most Recent</option>
                      <option value="helpful">Most Helpful</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>
                </div>

                {sortedReviews.length === 0 ? (
                  <div className="no-reviews">
                    <MessageCircle size={48} />
                    <h4>No reviews yet</h4>
                    <p>Be the first to share your experience!</p>
                  </div>
                ) : (
                  sortedReviews.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.anonymous ? "?" : (review.userName?.[0] || "U")}
                          </div>
                          <div>
                            <span className="reviewer-name">
                              {review.anonymous ? "Anonymous" : (review.userName || "User")}
                            </span>
                            {review.isVerified && (
                              <span className="verified-badge">
                                <CheckCircle size={12} /> Verified Student
                              </span>
                            )}
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.rating, 16)}
                          <span>{review.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <h4 className="review-title">{review.title}</h4>
                      
                      <p className={`review-content ${expandedReviews[review.id] ? "expanded" : ""}`}>
                        {review.content}
                      </p>
                      
                      {review.content?.length > 300 && (
                        <button 
                          className="expand-btn"
                          onClick={() => toggleReviewExpand(review.id)}
                        >
                          {expandedReviews[review.id] ? (
                            <>Show Less <ChevronUp size={16} /></>
                          ) : (
                            <>Read More <ChevronDown size={16} /></>
                          )}
                        </button>
                      )}

                      {(review.pros?.length > 0 || review.cons?.length > 0) && (
                        <div className="pros-cons">
                          {review.pros?.length > 0 && (
                            <div className="pros">
                              <h5>Pros</h5>
                              <ul>
                                {review.pros.map((pro, i) => (
                                  <li key={i}><CheckCircle size={14} /> {pro}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {review.cons?.length > 0 && (
                            <div className="cons">
                              <h5>Cons</h5>
                              <ul>
                                {review.cons.map((con, i) => (
                                  <li key={i}><AlertCircle size={14} /> {con}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="review-actions">
                        <button 
                          className="vote-btn"
                          onClick={() => handleVote(review.id, "up")}
                        >
                          <ThumbsUp size={16} />
                          {review.upvotes || 0}
                        </button>
                        <button 
                          className="vote-btn"
                          onClick={() => handleVote(review.id, "down")}
                        >
                          <ThumbsDown size={16} />
                          {review.downvotes || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "placements" && (
            <div className="placements-tab">
              <div className="section-card">
                <h2>Placement Statistics</h2>
                <div className="placement-stats">
                  <div className="placement-stat">
                    <span className="stat-label">Highest Package</span>
                    <span className="stat-value">₹{college?.placements?.highest || "N/A"} LPA</span>
                  </div>
                  <div className="placement-stat">
                    <span className="stat-label">Average Package</span>
                    <span className="stat-value">₹{college?.placements?.average || "N/A"} LPA</span>
                  </div>
                  <div className="placement-stat">
                    <span className="stat-label">Median Package</span>
                    <span className="stat-value">₹{college?.placements?.median || "N/A"} LPA</span>
                  </div>
                  <div className="placement-stat">
                    <span className="stat-label">Placement Rate</span>
                    <span className="stat-value">{college?.placementRate || "N/A"}%</span>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <h2>Top Recruiters</h2>
                <div className="recruiters-grid">
                  {(college?.topRecruiters || ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro"]).map((recruiter, i) => (
                    <div key={i} className="recruiter-card">
                      <Briefcase size={20} />
                      <span>{recruiter}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "qa" && (
            <div className="qa-tab">
              <div className="qa-header">
                <h2>Questions about {college?.name}</h2>
                <button 
                  className="btn-primary"
                  onClick={() => router.push(`/qa?college=${id}`)}
                >
                  Ask a Question
                </button>
              </div>
              <div className="qa-notice">
                <MessageCircle size={24} />
                <p>Visit our Q&A section to ask questions and get answers from students and alumni.</p>
                <button 
                  className="btn-secondary"
                  onClick={() => router.push(`/qa?college=${id}`)}
                >
                  Go to Q&A
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .loading-container, .error-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0f0f1a;
          color: white;
          gap: 1rem;
        }
        
        .loader {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .college-detail-page {
          min-height: 100vh;
          background: #0f0f1a;
          padding-bottom: 4rem;
        }
        
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 1rem 2rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .back-btn:hover {
          color: white;
        }
        
        .college-hero {
          position: relative;
          padding: 3rem 2rem;
          margin-bottom: 1rem;
        }
        
        .hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.3;
        }
        
        .hero-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, #0f0f1a);
        }
        
        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        
        .college-logo {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: white;
        }
        
        .college-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .college-info {
          flex: 1;
          min-width: 300px;
        }
        
        .college-info h1 {
          font-size: 2rem;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .college-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }
        
        .college-meta span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .college-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .rating-value {
          color: white;
          font-weight: 600;
          font-size: 1.25rem;
        }
        
        .rating-count {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
        }
        
        .hero-actions {
          display: flex;
          gap: 1rem;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .tabs-container {
          display: flex;
          gap: 0.5rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;
        }
        
        .tab {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          padding: 1rem 1.5rem;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .tab:hover {
          color: white;
        }
        
        .tab.active {
          color: #6366f1;
          border-bottom-color: #6366f1;
        }
        
        .success-message {
          max-width: 1200px;
          margin: 1rem auto;
          padding: 1rem 2rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .tab-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .stat-icon {
          color: #6366f1;
        }
        
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
        }
        
        .stat-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }
        
        .section-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .section-card h2 {
          color: white;
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        
        .section-card p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }
        
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .contact-item:hover {
          color: #6366f1;
        }
        
        .rating-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .rating-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .rating-label {
          color: rgba(255, 255, 255, 0.8);
          width: 100px;
          font-size: 0.875rem;
        }
        
        .rating-progress {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .rating-number {
          color: white;
          font-weight: 600;
          width: 30px;
        }
        
        /* Reviews Tab */
        .btn-write-review {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 2rem;
        }
        
        .review-form-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .review-form-card h3 {
          color: white;
          margin-bottom: 1.5rem;
        }
        
        .auth-notice, .error-notice {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .auth-notice a {
          color: #6366f1;
          text-decoration: underline;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        .form-group input[type="text"],
        .form-group textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #6366f1;
        }
        
        .form-group textarea {
          resize: vertical;
        }
        
        .category-ratings {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #6366f1;
        }
        
        .checkbox-group label {
          margin-bottom: 0;
          cursor: pointer;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        .btn-cancel {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.7);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .btn-submit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .reviews-header h3 {
          color: white;
        }
        
        .reviews-sort {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .reviews-sort select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 0.5rem 1rem;
          color: white;
        }
        
        .no-reviews {
          text-align: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .no-reviews h4 {
          color: white;
          margin: 1rem 0 0.5rem;
        }
        
        .review-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .reviewer-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }
        
        .reviewer-name {
          color: white;
          font-weight: 500;
          display: block;
        }
        
        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: #10b981;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }
        
        .review-date {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          display: block;
        }
        
        .review-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
        }
        
        .review-title {
          color: white;
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
        }
        
        .review-content {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          overflow: hidden;
          max-height: 100px;
          transition: max-height 0.3s;
        }
        
        .review-content.expanded {
          max-height: none;
        }
        
        .expand-btn {
          background: none;
          border: none;
          color: #6366f1;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        .pros-cons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .pros h5 {
          color: #10b981;
          margin-bottom: 0.5rem;
        }
        
        .cons h5 {
          color: #ef4444;
          margin-bottom: 0.5rem;
        }
        
        .pros ul, .cons ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .pros li, .cons li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        
        .pros li svg {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .cons li svg {
          color: #ef4444;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .review-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .vote-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 0.5rem 1rem;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .vote-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        /* Stars */
        :global(.stars-container) {
          display: flex;
          gap: 0.25rem;
        }
        
        :global(.star) {
          color: rgba(255, 255, 255, 0.2);
          transition: color 0.2s;
        }
        
        :global(.star.filled) {
          color: #fbbf24;
          fill: #fbbf24;
        }
        
        :global(.star.interactive) {
          cursor: pointer;
        }
        
        :global(.star.interactive:hover) {
          color: #fbbf24;
        }
        
        /* Placements Tab */
        .placement-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .placement-stat {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }
        
        .placement-stat .stat-label {
          display: block;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.5rem;
        }
        
        .placement-stat .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 600;
          color: #10b981;
        }
        
        .recruiters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .recruiter-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .recruiter-card svg {
          color: #6366f1;
        }
        
        /* Q&A Tab */
        .qa-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .qa-header h2 {
          color: white;
        }
        
        .qa-notice {
          text-align: center;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .qa-notice svg {
          color: #6366f1;
          margin-bottom: 1rem;
        }
        
        .qa-notice p {
          margin-bottom: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            text-align: center;
          }
          
          .college-meta {
            justify-content: center;
          }
          
          .college-rating {
            justify-content: center;
          }
          
          .hero-actions {
            width: 100%;
            flex-direction: column;
          }
          
          .tabs-container {
            padding: 0 1rem;
          }
          
          .tab-content {
            padding: 1rem;
          }
          
          .pros-cons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

// Fallback data for demo
const fallbackCollegeData = {
  id: "demo",
  name: "Demo University",
  city: "Mumbai",
  state: "Maharashtra",
  type: "Private University",
  established: 1985,
  averageRating: 4.2,
  totalReviews: 156,
  ranking: 25,
  totalStudents: 15000,
  placementRate: 92,
  description: "Demo University is a premier institution dedicated to academic excellence and innovation. With state-of-the-art facilities and world-class faculty, we prepare students for success in their chosen fields.",
  website: "https://example.edu",
  email: "admissions@example.edu",
  phone: "+91 22 1234 5678",
  address: "123 University Road, Mumbai, Maharashtra 400001",
  categoryRatings: {
    academics: 4.3,
    facilities: 4.0,
    placement: 4.5,
    campusLife: 3.8
  },
  placements: {
    highest: 45,
    average: 12,
    median: 10
  },
  topRecruiters: ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro", "Deloitte", "Accenture"]
};

const fallbackReviews = [
  {
    id: "1",
    userId: "user1",
    userName: "Rahul S.",
    rating: 4.5,
    title: "Great learning experience",
    content: "My 4 years at this university were transformative. The faculty is highly knowledgeable and always willing to help. The placement cell works hard to bring top companies to campus. The only downside is that some facilities could be better maintained.",
    pros: ["Excellent faculty", "Good placement opportunities", "Active student clubs"],
    cons: ["Some facilities need maintenance", "Expensive canteen"],
    upvotes: 24,
    downvotes: 2,
    isVerified: true,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    userId: "user2",
    userName: "Priya M.",
    rating: 4.0,
    title: "Solid academics, average campus life",
    content: "The academic rigor is excellent and prepares you well for the industry. However, the campus life could be more vibrant. More cultural events and better sports facilities would make it perfect.",
    pros: ["Strong academics", "Industry-relevant curriculum"],
    cons: ["Limited cultural events", "Sports facilities need improvement"],
    upvotes: 18,
    downvotes: 1,
    isVerified: true,
    createdAt: "2024-02-01T14:20:00Z"
  },
  {
    id: "3",
    userId: "user3",
    userName: null,
    anonymous: true,
    rating: 3.5,
    title: "Decent but overpriced",
    content: "The education quality is good but the fees are quite high compared to what you get. The placement stats are good though, so it might be worth it in the long run.",
    pros: ["Good placements", "Reputable brand"],
    cons: ["High fees", "Value for money is questionable"],
    upvotes: 12,
    downvotes: 5,
    isVerified: false,
    createdAt: "2024-02-10T09:15:00Z"
  }
];
