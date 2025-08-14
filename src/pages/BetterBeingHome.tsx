import React from 'react';
import { HeroSection } from "@/components/HeroSection";
import { ProductsSection } from "@/components/ProductsSection";
import { WellnessJourney } from "@/components/WellnessJourney";
import { Footer } from "@/components/Footer";
import NavigationEnhanced from "@/components/NavigationEnhanced";

const BetterBeingHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationEnhanced />
      <HeroSection />
      <ProductsSection />
      <WellnessJourney />
      <Footer />
    </div>
  );
};

export default BetterBeingHome;