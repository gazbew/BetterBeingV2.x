import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, Heart, Leaf, Sparkles, CheckCircle } from "lucide-react";
import productsImage from "@/assets/products-showcase.jpg";
import { getFeaturedProducts, Product } from "@/data/products";
import { Link } from "react-router-dom";

export const ProductsSection = () => {
  const featuredProducts = getFeaturedProducts();
  return (
    <section id="products" className="py-24 bg-gradient-to-b from-background to-primary/5 text-center">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-8 py-3 mb-8">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Premium Natural Products</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Wellness Solutions
            <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Powered by Nature
            </span>
          </h2>
          <p className="text-xl font-body text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Each product is scientifically formulated with premium botanical ingredients, 
            delivering transformative results backed by nature's wisdom and modern research.
          </p>
        </div>

        {/* Featured Banner */}
        <div className="relative mb-16 animate-scale-in">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-2xl" />
            <div className="relative z-10 text-center">
              <h3 className="text-3xl font-bold text-foreground mb-4">Premium Quality Promise</h3>
              <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Lab-Tested Purity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span>Third-Party Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Sustainably Sourced</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
          {featuredProducts.slice(0, 8).map((product: Product, index: number) => (
            <Card
              key={product.id}
              className="relative group hover:shadow-wellness transition-all duration-500 hover:-translate-y-2 border border-border/20 bg-card overflow-hidden rounded-2xl"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {product.popular && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-accent to-accent/80 text-white px-4 py-1.5 rounded-full text-sm font-semibold z-10 shadow-md">
                  ✨ Best Seller
                </div>
              )}
              
              <CardContent className="p-0">
                {/* Product Image Container */}
                <div className="relative h-64 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 flex items-center justify-center group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-500">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Wellness Badge */}
                  <div className="absolute top-4 right-4 bg-card/95 rounded-2xl p-2.5 shadow-wellness">
                    <Leaf className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">{product.description}</p>

                  {/* Benefits */}
                  <div className="space-y-2">
                    {product.benefits.slice(0, 3).map((benefit, i) => (
                      <div key={i} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 py-3 border-y border-border/20">
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {product.rating} ({product.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">{product.price}</span>
                      <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                    </div>
                    <span className="bg-gradient-to-r from-accent/20 to-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                      Save {Math.round((1 - parseInt(product.price.replace(/[R,]/g, '')) / parseInt(product.originalPrice.replace(/[R,]/g, ''))) * 100)}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:shadow-wellness text-white font-semibold transition-all hover:scale-105">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in-up">
          <Link to="/products">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-primary text-primary hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white hover:border-transparent text-lg px-10 py-6 rounded-2xl font-semibold transition-all hover:scale-105 hover:shadow-wellness"
            >
              Explore All Wellness Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};