import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Leaf, 
  X,
  Badge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavigationGlassOptimizedProps {
  className?: string;
}

export const NavigationGlassOptimized = ({ className }: NavigationGlassOptimizedProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    setScrolled(scrollTop > 50);
  }, []);

  useEffect(() => {
    let ticking = false;

    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Wellness', path: '/wellness' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        scrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-border shadow-lg" 
          : "bg-white/10 backdrop-blur-md border-b border-white/20",
        className
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            aria-label="Better Being Home"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200",
              "bg-gradient-to-br from-primary to-green-600 shadow-lg group-hover:shadow-xl"
            )}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              "font-bold text-lg transition-colors duration-200",
              scrolled ? "text-foreground" : "text-white"
            )}>
              Better Being
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "transition-all duration-200 hover:bg-white/10",
                    scrolled ? "text-foreground hover:bg-accent" : "text-white",
                    isActivePath(item.path) && "bg-white/20 font-semibold"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Search */}
            <div className="hidden md:block">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-64 bg-white/10 border-white/20 placeholder:text-white/70",
                      scrolled && "bg-background border-border placeholder:text-muted-foreground"
                    )}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                    className={cn(
                      "text-white hover:bg-white/10",
                      scrolled && "text-foreground hover:bg-accent"
                    )}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className={cn(
                    "text-white hover:bg-white/10",
                    scrolled && "text-foreground hover:bg-accent"
                  )}
                  aria-label="Open search"
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-white hover:bg-white/10 relative",
                scrolled && "text-foreground hover:bg-accent"
              )}
              aria-label="Favorites"
            >
              <Heart className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-white hover:bg-white/10 relative",
                scrolled && "text-foreground hover:bg-accent"
              )}
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {/* Cart badge would go here */}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-white hover:bg-white/10",
                scrolled && "text-foreground hover:bg-accent"
              )}
              aria-label="Account"
            >
              <User className="w-4 h-4" />
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "md:hidden text-white hover:bg-white/10",
                    scrolled && "text-foreground hover:bg-accent"
                  )}
                  aria-label="Open menu"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gradient-to-br from-primary to-green-600">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-2 mb-8">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white">
                      Better Being
                    </span>
                  </div>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="mb-6">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/10 border-white/20 placeholder:text-white/70 text-white"
                    />
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex-1">
                    <ul className="space-y-2">
                      {navigationItems.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={cn(
                              "block px-4 py-3 rounded-lg text-white transition-colors hover:bg-white/10",
                              isActivePath(item.path) && "bg-white/20 font-semibold"
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};