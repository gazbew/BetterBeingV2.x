import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-wellness.jpg";

export const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-accent rounded-full animate-float opacity-60" />
      <div className="absolute top-40 right-20 w-6 h-6 bg-accent/50 rounded-full animate-float animation-delay-1000 opacity-40" />
      <div className="absolute bottom-32 left-20 w-8 h-8 bg-primary/30 rounded-full animate-float animation-delay-2000 opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#C1581B]/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-[#C1581B]/30">
            <Star className="w-4 h-4 text-[#C1581B] animate-glow" />
            <span className="text-sm font-medium text-primary-foreground">Better Being - Natural Wellness</span>
            <Sparkles className="w-4 h-4 text-[#C1581B] animate-glow" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 leading-tight">
            Better Being
            <span className="block bg-gradient-to-r from-[#C1581B] to-[#E8823A] bg-clip-text text-transparent animate-glow">
              Natural Wellness
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover premium natural products and expert wisdom that will revolutionize your health, 
            elevate your energy, and unlock your body's incredible potential for transformation.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-primary-foreground/80">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">50,000+</div>
              <div className="text-sm">Lives Transformed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">100%</div>
              <div className="text-sm">Natural Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm">Expert Support</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-[#C1581B] hover:bg-[#B34E16] text-white text-lg px-8 py-4 shadow-premium animate-bounce-gentle"
            >
              Shop Better Being Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-4"
            >
              Explore Products
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-primary-foreground/60 text-sm">
            <div className="flex items-center space-x-2">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span>4.9/5 from 12,000+ reviews</span>
            </div>
            <div className="hidden sm:block">•</div>
            <span>Free shipping worldwide</span>
            <div className="hidden sm:block">•</div>
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-accent rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};