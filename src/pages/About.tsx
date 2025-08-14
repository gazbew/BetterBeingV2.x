import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Leaf, Shield, Users, Award, Globe } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-bb-orange/10 to-bb-champagne pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-bb-orange text-white hover:bg-bb-orange/90 mb-6">
              ✨ Our Story
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-bb-orange mb-6">
              Better Being
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Make wellness accessible to all. We care about lives, truth and impact. 
              <span className="text-bb-orange font-semibold">Providing good only.</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-bb-orange" />
                <span>Passionate</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-bb-orange" />
                <span>Relatable</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-bb-orange" />
                <span>Unshakable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-bb-orange mb-4">Our Creator Brand</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built on care, driven by success. We lead with heart & knowledge, think ahead, 
                and show up with solutions people trust.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Purpose */}
              <Card className="border-bb-orange/20 hover:border-bb-orange/40 transition-colors">
                <CardHeader className="text-center">
                  <Heart className="w-8 h-8 text-bb-orange mx-auto mb-2" />
                  <CardTitle className="text-bb-orange">Purpose</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Make wellness accessible to all
                  </p>
                </CardContent>
              </Card>

              {/* Positioning */}
              <Card className="border-bb-orange/20 hover:border-bb-orange/40 transition-colors">
                <CardHeader className="text-center">
                  <Globe className="w-8 h-8 text-bb-orange mx-auto mb-2" />
                  <CardTitle className="text-bb-orange">Positioning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    We lead with heart & knowledge, think ahead, and show up with solutions people trust
                  </p>
                </CardContent>
              </Card>

              {/* Values */}
              <Card className="border-bb-orange/20 hover:border-bb-orange/40 transition-colors">
                <CardHeader className="text-center">
                  <Shield className="w-8 h-8 text-bb-orange mx-auto mb-2" />
                  <CardTitle className="text-bb-orange">Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Built on care. Driven by success
                  </p>
                </CardContent>
              </Card>

              {/* Personality */}
              <Card className="border-bb-orange/20 hover:border-bb-orange/40 transition-colors">
                <CardHeader className="text-center">
                  <Users className="w-8 h-8 text-bb-orange mx-auto mb-2" />
                  <CardTitle className="text-bb-orange">Personality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Passionate, Relatable & Unshakable
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Promise */}
      <section className="py-16 bg-bb-champagne/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Leaf className="w-16 h-16 text-bb-orange mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-bb-orange mb-6">
              Products that work. Principles that hold.
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              We care about lives, truth and impact. Our commitment is to provide good only - 
              products that truly make a difference in your wellness journey.
            </p>
            <Button className="bg-bb-orange hover:bg-bb-orange/90 text-white">
              Discover Our Products
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

