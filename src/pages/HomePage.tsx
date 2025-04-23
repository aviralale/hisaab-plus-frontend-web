import Features from "@/components/features-12";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integration-section";
import Testimonials from "@/components/testimonial-section";
import HomePageLayout from "@/layout/HomePageLayout";

const HomePage = () => {
  return (
    <HomePageLayout>
      <HeroSection />
      <Features />
      <IntegrationsSection />
      <Testimonials />
    </HomePageLayout>
  );
};

export default HomePage;
