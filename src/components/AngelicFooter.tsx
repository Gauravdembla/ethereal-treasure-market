import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";

const AngelicFooter = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const blessedTexts = [
    "Every item here carries high-vibrational energy to support your healing journey. May you be guided to what your soul needs most today.",
    "These sacred treasures are blessed with divine light and love. Trust your intuition as you choose what resonates with your spirit.",
    "Each piece has been carefully selected to bring peace, healing, and spiritual awakening into your life. You are exactly where you need to be.",
    "The universe has guided you here for a reason. Allow these mystical tools to support your transformation and inner growth.",
    "Infused with angelic energy and pure intentions, these items are here to elevate your vibration and connect you with your higher self.",
    "May these divine gifts bring clarity to your path and illuminate the magic that already exists within you. You are deeply loved.",
    "These healing treasures carry the wisdom of ancient traditions and the power of modern spiritual awakening. Choose with your heart.",
    "Every crystal, card, and sacred item here vibrates with love and light. Trust the process and embrace your spiritual journey.",
    "You are a beautiful soul on a sacred path. These tools are here to remind you of your own divine nature and infinite potential.",
    "The angels have whispered their blessings upon each item. May they bring you the peace, love, and healing you seek."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % blessedTexts.length);
        setIsVisible(true);
      }, 1500); // Much slower fade transition (1.5 seconds)

    }, 12000); // Change text every 12 seconds

    return () => clearInterval(interval);
  }, [blessedTexts.length]);
  return (
    <footer className="py-16 px-6 bg-gradient-to-t from-angelic-lavender/20 to-transparent">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <Sparkles className="w-6 h-6 text-angelic-gold animate-pulse" />
          <Heart className="w-8 h-8 text-angelic-rose fill-angelic-rose/20" />
          <Sparkles className="w-6 h-6 text-angelic-gold animate-pulse" />
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-soft">
          <h3 className="font-playfair text-2xl font-semibold text-angelic-deep mb-4">
            Blessed with Divine Energy
          </h3>
          
          <div className="relative min-h-[4rem] flex items-center justify-center">
            <p
              className={`text-angelic-deep/80 leading-relaxed max-w-2xl mx-auto text-lg transition-opacity duration-1000 ease-in-out ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {blessedTexts[currentTextIndex]}
            </p>
          </div>
          
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-angelic-gold rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-angelic-rose rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-angelic-deep/60 text-sm">
            Crafted with ✨ love & light ✨ for the Angels On Earth community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AngelicFooter;