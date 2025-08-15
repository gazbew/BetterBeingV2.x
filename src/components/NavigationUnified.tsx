import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  ChevronDown,
  Leaf,
  Sparkles,
  Shield,
  LogOut,
  UserCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface NavigationProps {
  variant?: 'default' | 'glass' | 'enhanced' | 'enterprise';
  className?: string;
}

const productCategories = [
  { name: "Supplements", href: "/products?category=supplements", description: "Natural vitamins & minerals", icon: Leaf },
  { name: "Skincare", href: "/products?category=skincare", description: "Organic beauty products", icon: Sparkles },
  { name: "Wellness", href: "/products?category=wellness", description: "Mind & body health", icon: Shield },
];

const wellnessResources = [
  { name: "Wellness Blog", href: "/blog", description: "Expert health tips" },
  { name: "Nutrition Guide", href: "/nutrition", description: "Balanced eating plans" },
  { name: "Mindfulness", href: "/mindfulness", description: "Mental wellness practices" },
  { name: "Sleep Health", href: "/sleep", description: "Better rest solutions" },
];

export const NavigationUnified: React.FC<NavigationProps> = ({ 
  variant = 'default',
  className 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartSummary } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target?.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const cartCount = cartSummary?.totalQuantity || 0;
  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Dynamic styles based on variant
  const getHeaderStyles = () => {
    const baseStyles = "fixed top-0 left-0 right-0 z-50 transition-all duration-300";
    
    switch (variant) {
      case 'glass':
        return cn(
          baseStyles,
          scrolled 
            ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50" 
            : "bg-white/10 backdrop-blur-sm border-b border-white/20"
        );
      case 'enhanced':
        return cn(
          baseStyles,
          scrolled 
            ? "bg-background/95 backdrop-blur-xl shadow-elegant border-b border-border/50" 
            : "bg-background/80 backdrop-blur-sm border-b border-border/30"
        );
      case 'enterprise':
        return cn(
          baseStyles,
          "bg-background border-b border-border shadow-sm"
        );
      default:
        return cn(
          baseStyles,
          scrolled 
            ? "bg-background/95 backdrop-blur-xl shadow-md border-b border-border/50" 
            : "bg-background/80 backdrop-blur-sm border-b border-border/30"
        );
    }
  };

  const getLogoStyles = () => {
    switch (variant) {
      case 'glass':
        return "w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg";
      case 'enhanced':
        return "w-12 h-12 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center shadow-wellness glow-primary";
      default:
        return "w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg";
    }
  };

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Wellness', path: '/wellness' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-[60]"
      >
        Skip to main content
      </a>

      <header className={cn(getHeaderStyles(), className)} role="banner">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              aria-label="Better Being - Natural Wellness Home"
            >
              <div className="relative">
                <div className={getLogoStyles()}>
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                {variant === 'enhanced' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-neutral-900" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  BETTER BEING
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Natural Wellness
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:block" role="navigation" aria-label="Main navigation">
              <NavigationMenu>
                <NavigationMenuList className="space-x-2">
                  
                  {/* Home */}
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink 
                        className={cn(
                          "relative group text-sm uppercase tracking-wide px-4 py-2 rounded-md transition-all duration-300 font-medium",
                          isActive("/") 
                            ? "text-primary bg-primary/10" 
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        Home
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {/* Products Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm uppercase tracking-wide font-medium">
                      Products
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[500px] lg:grid-cols-[1fr_1fr]">
                        <div className="row-span-3">
                          <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-accent/20 p-6 no-underline outline-none focus:shadow-md">
                            <Leaf className="h-8 w-8 text-primary" />
                            <div className="mb-2 mt-4 text-lg font-semibold tracking-tight text-primary">
                              Natural Products
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Discover our curated collection of natural wellness products for mind, body, and spirit.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {productCategories.map((category) => (
                            <Link
                              key={category.name}
                              to={category.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center space-x-2">
                                <category.icon className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium tracking-tight">
                                  {category.name}
                                </div>
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {category.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Wellness Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm uppercase tracking-wide font-medium">
                      Wellness
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[400px] p-4">
                        <div className="grid gap-2">
                          {wellnessResources.map((resource) => (
                            <Link
                              key={resource.name}
                              to={resource.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="text-sm font-medium tracking-tight">
                                {resource.name}
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {resource.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* About & Contact */}
                  {['About', 'Contact'].map((item) => (
                    <NavigationMenuItem key={item}>
                      <Link to={`/${item.toLowerCase()}`}>
                        <NavigationMenuLink 
                          className={cn(
                            "relative group text-sm uppercase tracking-wide px-4 py-2 rounded-md transition-all duration-300 font-medium",
                            isActive(`/${item.toLowerCase()}`) 
                              ? "text-primary bg-primary/10" 
                              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                          )}
                        >
                          {item}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-border/50 rounded-lg bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </form>

              {/* Wishlist */}
              <Button 
                variant="ghost" 
                size="sm"
                className="relative transition-all duration-300 hover:scale-105"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm">{user.firstName}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Orders & Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}

              <Separator orientation="vertical" className="h-8" />

              {/* Cart */}
              <Button 
                size="sm"
                className="relative bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs border-2 border-background">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              <Link to="/checkout">
                <Button 
                  variant="outline"
                  size="sm"
                  className="transition-all duration-300 hover:scale-105"
                >
                  Checkout
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  aria-label="Toggle mobile menu"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center space-x-3">
                      <div className={getLogoStyles()}>
                        <Leaf className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-lg font-bold">BETTER BEING</span>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Natural Wellness
                        </p>
                      </div>
                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    Navigate to explore our natural wellness products and resources.
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </form>

                  <Separator />

                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        className={cn(
                          "block text-base py-2 px-3 rounded-lg transition-colors",
                          isActive(item.path) 
                            ? "text-primary bg-primary/10" 
                            : "text-foreground hover:text-primary hover:bg-primary/5"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <Separator />

                  {/* Mobile Actions */}
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <User className="w-4 h-4 mr-2" />
                        Account
                      </Button>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-primary hover:bg-primary/90 relative"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      View Cart
                      {cartCount > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                    
                    <Link to="/checkout" className="block">
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Proceed to Checkout
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16" />
    </>
  );
};

export default NavigationUnified;