import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import banner3 from "@/assets/banner-3.jpg";
import banner4 from "@/assets/banner-4.jpg";
import banner5 from "@/assets/banner-5.jpg";

const banners = [
  { image: banner1, title: "Divine Crystal Collection", subtitle: "Amethyst & Rose Quartz Healing" },
  { image: banner2, title: "Sacred Sage & Crystals", subtitle: "Cleanse Your Energy Space" },
  { image: banner3, title: "Chakra Alignment Kit", subtitle: "Balance Your Energy Centers" },
  { image: banner4, title: "Angel Card Guidance", subtitle: "Divine Messages Await" },
  { image: banner5, title: "Healing Journals", subtitle: "Sacred Self-Reflection Tools" },
];

const HeroSection = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBanner ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${banner.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevBanner}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-4 text-white leading-tight">
            {banners[currentBanner].title}
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {banners[currentBanner].subtitle}
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
            Explore Collection
          </Button>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentBanner 
                ? 'bg-white shadow-glow' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;