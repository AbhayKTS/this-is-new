import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "CollegeVerse helped our chapter showcase projects and unlock verified credentials that recruiters actually trust.",
    name: "Priya Sharma",
    role: "Community Lead, DSC VIT",
  },
  {
    quote:
      "The leaderboard insights push our students to ship faster. MicroGigs gave them real experience before internships.",
    name: "Prof. Raghav Rao",
    role: "Faculty Mentor, SRCC",
  },
  {
    quote:
      "Recruiting from CollegeVerse means we see proof-of-work, not just resumes. It simplifies early talent scouting for us.",
    name: "Ananya Joshi",
    role: "Campus Hiring, Polygon Labs",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="testimonial-shell">
      <div className="container">
        <div className="section-intro">
          <span className="badge-pill">Trust Signals</span>
          <h2>
            Loved by <span className="title-gradient">students, colleges, and recruiters</span>
          </h2>
          <p>Glassmorphism, neon vibes, and verified achievements that make every profile future-proof.</p>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((t) => (
            <article className="testimonial-card" key={t.name}>
              <Quote size={28} style={{ color: "rgba(137, 162, 255, 0.8)" }} />
              <p className="testimonial-quote">{t.quote}</p>
              <div className="testimonial-meta">
                <span>{t.name}</span>
                <span>{t.role}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
