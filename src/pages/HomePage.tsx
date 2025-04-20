import Features from "@/components/features-12";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integration-section";
import Testimonials from "@/components/testimonial-section";

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <Features />
      <IntegrationsSection />
      <Testimonials />
    </div>
  );
};

export default HomePage;
