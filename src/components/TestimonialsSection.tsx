import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya",
      rating: 5,
      text: "The amethyst cluster brought such peace to my meditation space. I feel more connected to my spiritual practice.",
      location: "Mumbai"
    },
    {
      id: 2,
      name: "Arjun",
      rating: 5,
      text: "Angel cards guided me through a difficult time. The messages were exactly what my soul needed to hear.",
      location: "Bangalore"
    },
    {
      id: 3,
      name: "Meera",
      rating: 5,
      text: "The healing candle's energy is incredible. My home feels more sacred and peaceful now.",
      location: "Delhi"
    },
    {
      id: 4,
      name: "Rohit",
      rating: 5,
      text: "Chakra journal helped me manifest my dreams. The sacred pages hold so much positive energy.",
      location: "Pune"
    },
    {
      id: 5,
      name: "Kavya",
      rating: 5,
      text: "Rose quartz heart opened my heart chakra. I can feel more love and compassion flowing through me.",
      location: "Chennai"
    }
  ];

  return (
    <section className="py-16 px-6 bg-gradient-divine">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-angelic-deep mb-4">
            💬 What Our Soul Family Says
          </h2>
          <p className="text-angelic-deep/70 max-w-2xl mx-auto">
            Testimonials from hearts transformed by divine energy
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial) => (
            <Card key={testimonial.id} className="p-6 bg-white/80 backdrop-blur-sm border-white/50 hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-angelic-gold text-angelic-gold" />
                ))}
              </div>
              
              <div className="relative mb-4">
                <Quote className="w-6 h-6 text-primary/30 absolute -top-2 -left-2" />
                <p className="text-angelic-deep/80 italic leading-relaxed pl-4">
                  "{testimonial.text}"
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-primary">
                  — {testimonial.name}
                </p>
                <p className="text-sm text-angelic-deep/60">
                  {testimonial.location}
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Additional testimonials for larger screens */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 mt-6">
          {testimonials.slice(3).map((testimonial) => (
            <Card key={testimonial.id} className="p-6 bg-white/80 backdrop-blur-sm border-white/50 hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-angelic-gold text-angelic-gold" />
                ))}
              </div>
              
              <div className="relative mb-4">
                <Quote className="w-6 h-6 text-primary/30 absolute -top-2 -left-2" />
                <p className="text-angelic-deep/80 italic leading-relaxed pl-4">
                  "{testimonial.text}"
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-primary">
                  — {testimonial.name}
                </p>
                <p className="text-sm text-angelic-deep/60">
                  {testimonial.location}
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-angelic-deep/60 italic">
            Join our growing community of over 10,000+ souls on their healing journey ✨
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;