import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Clean and Professional */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">BB</span>
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-gray-900 tracking-wider">BETTER BEING</h1>
              <p className="text-[10px] font-body text-gray-500 uppercase tracking-widest">Natural Wellness</p>
            </div>
          </div>

          {/* Desktop Navigation - Clear and Readable */}
          <nav className="hidden lg:flex items-center space-x-10">
            <a href="#home" className="font-heading text-xs uppercase tracking-wider text-gray-700 hover:text-primary transition-colors font-medium">Home</a>
            <a href="#products" className="font-heading text-xs uppercase tracking-wider text-gray-700 hover:text-primary transition-colors font-medium">Products</a>
            <a href="#wellness" className="font-heading text-xs uppercase tracking-wider text-gray-700 hover:text-primary transition-colors font-medium">Wellness</a>
            <a href="#about" className="font-heading text-xs uppercase tracking-wider text-gray-700 hover:text-primary transition-colors font-medium">About</a>
            <a href="#contact" className="font-heading text-xs uppercase tracking-wider text-gray-700 hover:text-primary transition-colors font-medium">Contact</a>
          </nav>

          {/* Desktop Actions - Clear CTAs */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/account">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-700 hover:text-primary hover:bg-gray-50 font-heading uppercase text-xs tracking-wider"
              >
                <User className="w-4 h-4 mr-2" />
                Account
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white font-heading uppercase text-xs tracking-wider px-6 py-2.5 shadow-md"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50">
            <nav className="flex flex-col space-y-4 mt-4">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#products" className="text-foreground hover:text-primary transition-colors">Products</a>
              <a href="#wellness" className="text-foreground hover:text-primary transition-colors">Wellness Tips</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button variant="default" size="sm">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop Now
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};