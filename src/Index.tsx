import Header from "@/modules/public/home/Header";
import HeroSection from "@/modules/public/home/HeroSection";
import PartnerLogos from "@/modules/public/home/PartnerLogos";
import ZeroInvestmentSection from "@/modules/public/home/ZeroInvestmentSection";
import ProductsShowcase from "@/modules/public/home/ProductsShowcase";
import LaunchStoreSection from "@/modules/public/home/LaunchStoreSection";
import PrintOnDemandSection from "@/modules/public/home/PrintOnDemandSection";
import HowItWorksSection from "@/modules/public/home/HowItWorksSection";
import SuccessFeaturesSection from "@/modules/public/home/SuccessFeaturesSection";
import StoreConnectionSection from "@/modules/public/home/StoreConnectionSection";
import YouTubePartnerSection from "@/modules/public/home/YouTubePartnerSection";
import TestimonialSection from "@/modules/public/home/TestimonialSection";
import ExpertCTASection from "@/modules/public/home/ExpertCTASection";
import Footer from "@/modules/public/home/Footer";
import "./fonts.css";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PartnerLogos />
        <ZeroInvestmentSection />
        <ProductsShowcase />
        <LaunchStoreSection />
        <PrintOnDemandSection />
        <HowItWorksSection />
        <SuccessFeaturesSection />
        <StoreConnectionSection />
        <YouTubePartnerSection />
        <TestimonialSection />
        <ExpertCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
