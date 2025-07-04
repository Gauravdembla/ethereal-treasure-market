import { Button } from "@/components/ui/button";
import { Sparkles, Heart } from "lucide-react";
import heroBackground from "@/assets/hero-divine-background.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-white/30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <Sparkles className="w-6 h-6 text-angelic-gold opacity-70" />
      </div>
      <div className="absolute top-32 right-16 animate-pulse">
        <Heart className="w-5 h-5 text-angelic-rose opacity-60" />
      </div>
      <div className="absolute bottom-20 left-16 float">
        <Sparkles className="w-4 h-4 text-primary opacity-50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-6 text-angelic-deep leading-tight">
          ✨ Featured Healing Treasures ✨
        </h1>
        
        <p className="text-lg md:text-xl text-angelic-deep/80 mb-8 max-w-2xl mx-auto leading-relaxed">
          Handpicked tools to align your energy and awaken your light
        </p>
        
        <Button 
          variant="divine"
          size="lg"
          className="text-lg shadow-divine hover:shadow-glow"
          onClick={() => {
            document.getElementById('products')?.scrollIntoView({ 
              behavior: 'smooth' 
            });
          }}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Scroll to Shop
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;