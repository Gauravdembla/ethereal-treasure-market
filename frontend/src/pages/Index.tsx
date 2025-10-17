import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import TestimonialsSection from "@/components/TestimonialsSection";
import AngelicFooter from "@/components/AngelicFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ProductGrid />
      <TestimonialsSection />
      <AngelicFooter />
    </div>
  );
};

export default Index;