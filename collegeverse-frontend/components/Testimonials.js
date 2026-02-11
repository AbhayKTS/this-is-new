import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "CollegeVerse helped our chapter showcase projects and unlock verified credentials that recruiters actually trust.",
    name: "Priya Sharma",
    role: "Community Lead, DSC VIT",
  },
  {
    quote: "The leaderboard insights push our students to ship faster. MicroGigs gave them real experience before internships.",
    name: "Prof. Raghav Rao",
    role: "Faculty Mentor, SRCC",
  },
  {
    quote: "Recruiting from CollegeVerse means we see proof-of-work, not just resumes. It simplifies early talent scouting.",
    name: "Ananya Joshi",
    role: "Campus Hiring, Polygon Labs",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonial-section">
      <div className="container">
        <div className="section-intro">
          <span className="badge-pill">Trust Signals</span>
          <h2>
            Loved by <span className="text-gradient">students, colleges, and recruiters</span>
          </h2>
          <p>Verified achievements that make every profile future-proof.</p>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((t) => (
            <article className="testimonial-card" key={t.name}>
              <Quote size={24} style={{ color: "var(--primary-hover)", opacity: 0.7 }} />
              <p className="testimonial-quote">{t.quote}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name.split(" ").map((n) => n[0]).join("")}</div>
                <div className="testimonial-info">
                  <span>{t.name}</span>
                  <span>{t.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;