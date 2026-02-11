import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import FeaturesSection from "../components/FeaturesSection";
import CommunityShowcase from "../components/CommunityShowcase";
import LeaderboardPreview from "../components/LeaderboardPreview";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="page-shell">
      <NavBar />
      <main>
        <Hero />
        <FeaturesSection />
        <LeaderboardPreview />
        <CommunityShowcase />
        <Testimonials />

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-box">
              <span className="badge-pill"><Sparkles size={14} /> Ready to launch?</span>
              <h2>Join the <span className="text-gradient">CollegeVerse</span> today</h2>
              <p>Start your journey and connect with thousands of students, colleges and micro opportunities.</p>
              <div className="cta-actions">
                <Link href="/login" className="btn-primary btn-lg">Get Started Free</Link>
                <Link href="/colleges" className="btn-ghost btn-lg">Explore Colleges</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
