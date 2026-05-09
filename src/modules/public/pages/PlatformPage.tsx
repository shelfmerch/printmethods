import Header from "@/modules/public/platform/Header";
import HeroSection from "@/modules/public/platform/HeroSection";
import BeTheBoss from "@/modules/public/platform/BeTheBoss";
import EcosystemPyramid from "@/modules/public/platform/EcosystemPyramid";
import FeaturesGrid from "@/modules/public/platform/FeaturesGrid";
import YouTubeIntegration from "@/modules/public/platform/YouTubeIntegration";
import ExpertCTASection from "@/modules/public/platform/ExpertCTASection";
import Footer from "@/modules/public/platform/Footer";

const PlatformPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BeTheBoss />
        <EcosystemPyramid />
        <FeaturesGrid />
        <YouTubeIntegration />
        <ExpertCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PlatformPage;
