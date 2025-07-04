import { Heart, Sparkles } from "lucide-react";

const AngelicFooter = () => {
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
          
          <p className="text-angelic-deep/80 leading-relaxed max-w-2xl mx-auto text-lg">
            Every item here carries high-vibrational energy to support your healing journey. 
            May you be guided to what your soul needs most today.
          </p>
          
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