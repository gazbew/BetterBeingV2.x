import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-wellness.jpg";

export const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 text-center">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Subtle Hero Image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            opacity: 0.05
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Simple Badge */}
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-secondary/20 text-foreground rounded-full text-xs font-heading uppercase tracking-wider">
              Est. 2020 • Natural Wellness
            </span>
          </div>

          {/* Clear, Bold Headline */}
          <h1 className="mb-6">
            <span className="block text-6xl md:text-7xl lg:text-8xl font-heading font-bold text-foreground mb-4">
              BETTER BEING
            </span>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-body text-muted-foreground">
              Premium Natural Wellness Solutions
            </span>
          </h1>

          {/* Clean Description */}
          <p className="text-lg md:text-xl font-body text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Discover premium botanical supplements meticulously formulated with 
            ethically-sourced ingredients and backed by scientific research.
          </p>

          {/* Clean Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">50K+</div>
              <div className="text-xs md:text-sm font-body text-muted-foreground uppercase tracking-wider">Customers</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">100%</div>
              <div className="text-xs md:text-sm font-body text-muted-foreground uppercase tracking-wider">Natural</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">4.9★</div>
              <div className="text-xs md:text-sm font-body text-muted-foreground uppercase tracking-wider">Rating</div>
            </div>
          </div>

          {/* Professional CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading uppercase px-8 py-4 text-sm tracking-wider shadow-lg"
            >
              SHOP COLLECTION
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-heading uppercase px-8 py-4 text-sm tracking-wider"
            >
              VIEW CATALOG
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <span className="font-body">12,000+ Reviews</span>
            </div>
            <span className="text-border">•</span>
            <span className="font-body">Free Shipping Over R500</span>
            <span className="text-border">•</span>
            <span className="font-body">30-Day Guarantee</span>
          </div>
        </div>
      </div>

    </section>
  );
};