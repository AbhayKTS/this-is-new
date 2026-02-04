import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import CommunityShowcase from "../components/CommunityShowcase";
import FeaturesSection from "../components/FeaturesSection";
import LeaderboardPreview from "../components/LeaderboardPreview";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <NavBar />
      <main>
        <Hero />
        <CommunityShowcase />
        <FeaturesSection />
        <LeaderboardPreview />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
