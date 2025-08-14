import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, MessageCircle, Heart } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-bb-orange/10 to-bb-champagne pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-bb-orange text-white hover:bg-bb-orange/90 mb-6">
              💬 Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-bb-orange mb-6">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              We're here to support your wellness journey. 
              <span className="text-bb-orange font-semibold">Let's connect and create better being together.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-bb-orange mb-6">Get in Touch</h2>
                  <p className="text-muted-foreground mb-8">
                    Ready to start your wellness journey? Have questions about our products? 
                    Our passionate team is here to help you find the perfect solutions.
                  </p>
                </div>

                <div className="space-y-6">
                  <Card className="border-bb-orange/20">
                    <CardContent className="flex items-center space-x-4 pt-6">
                      <div className="bg-bb-orange/10 p-3 rounded-full">
                        <Mail className="w-6 h-6 text-bb-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-bb-orange">Email Us</h3>
                        <p className="text-muted-foreground">hello@betterbeing.co.za</p>
                        <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-bb-orange/20">
                    <CardContent className="flex items-center space-x-4 pt-6">
                      <div className="bg-bb-orange/10 p-3 rounded-full">
                        <Phone className="w-6 h-6 text-bb-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-bb-orange">Call Us</h3>
                        <p className="text-muted-foreground">+27 11 123 4567</p>
                        <p className="text-sm text-muted-foreground">Mon-Fri, 8AM-6PM SAST</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-bb-orange/20">
                    <CardContent className="flex items-center space-x-4 pt-6">
                      <div className="bg-bb-orange/10 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-bb-orange" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-bb-orange">Support Hours</h3>
                        <p className="text-muted-foreground">Monday - Friday: 8AM - 6PM</p>
                        <p className="text-sm text-muted-foreground">Saturday: 9AM - 2PM</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-bb-champagne/30 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-6 h-6 text-bb-orange" />
                    <h3 className="font-semibold text-bb-orange">Wellness Promise</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Every interaction with our team reflects our commitment to your wellness journey. 
                    We listen, understand, and provide solutions that truly work.
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="border-bb-orange/20">
                <CardHeader>
                  <CardTitle className="text-bb-orange flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Tell us how we can help you on your wellness journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-bb-orange">First Name</label>
                      <Input placeholder="Your first name" className="border-bb-orange/20 focus:border-bb-orange" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-bb-orange">Last Name</label>
                      <Input placeholder="Your last name" className="border-bb-orange/20 focus:border-bb-orange" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-bb-orange">Email</label>
                    <Input type="email" placeholder="your.email@example.com" className="border-bb-orange/20 focus:border-bb-orange" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-bb-orange">Subject</label>
                    <Input placeholder="How can we help?" className="border-bb-orange/20 focus:border-bb-orange" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-bb-orange">Message</label>
                    <Textarea 
                      placeholder="Tell us about your wellness goals or any questions you have..."
                      rows={6}
                      className="border-bb-orange/20 focus:border-bb-orange"
                    />
                  </div>

                  <Button className="w-full bg-bb-orange hover:bg-bb-orange/90 text-white">
                    Send Message
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    By sending this message, you agree to our commitment to your wellness journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;

