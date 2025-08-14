import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, Heart, Search, Filter, X } from "lucide-react";
import { products, categories, Category, Product, getProductsByCategory } from "@/data/products";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get current category
  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // Filter products
  let filteredProducts = [...products];
  
  // Category filter
  if (selectedCategory !== "all") {
    filteredProducts = getProductsByCategory(selectedCategory, 
      selectedSubcategory !== "all" ? selectedSubcategory : undefined
    );
  }
  
  // Search filter
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.benefits.some(benefit => benefit.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // Price filter
  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(v => parseInt(v));
    filteredProducts = filteredProducts.filter(product => {
      const price = parseInt(product.price.replace(/[R,]/g, ""));
      return price >= min && price <= max;
    });
  }
  
  // Sort products
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseInt(a.price.replace(/[R,]/g, "")) - parseInt(b.price.replace(/[R,]/g, ""));
      case "price-high":
        return parseInt(b.price.replace(/[R,]/g, "")) - parseInt(a.price.replace(/[R,]/g, ""));
      case "rating":
        return b.rating - a.rating;
      case "popular":
        return b.reviews - a.reviews;
      case "featured":
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSearchQuery("");
    setPriceRange("all");
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-wellness py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-6 py-2 mb-6">
              <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center">
                <span className="text-white font-bold text-xs">BB</span>
              </div>
              <span className="text-sm font-medium text-white">Better Being Products</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Premium Natural Products
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Discover our complete range of {products.length}+ premium wellness products,
              each meticulously formulated for your optimal health.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  Clear all
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Category Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Filter */}
              {currentCategory && currentCategory.subcategories && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Subcategory</label>
                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Subcategories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {currentCategory.subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator className="my-6" />

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-500">Under R500</SelectItem>
                    <SelectItem value="500-1000">R500 - R1,000</SelectItem>
                    <SelectItem value="1000-1500">R1,000 - R1,500</SelectItem>
                    <SelectItem value="1500-999999">Above R1,500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-6" />

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-white">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                {/* Mobile filters content - same as desktop */}
                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Apply button */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={clearFilters}
                    >
                      Clear
                    </Button>
                    <Button
                      className="flex-1 bg-[#C1581B] hover:bg-[#B34E16]"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products found
                {selectedCategory !== "all" && (
                  <span> in {currentCategory?.name}</span>
                )}
              </p>
              {(selectedCategory !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#C1581B]"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {(selectedCategory !== "all" || searchQuery || priceRange !== "all") && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {currentCategory?.name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedSubcategory("all");
                      }}
                    />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {priceRange !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Price: {priceRange.replace("-", " - R")}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setPriceRange("all")}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="relative group hover:shadow-wellness transition-all duration-500 hover:-translate-y-2 border-0 bg-white overflow-hidden"
                  >
                    {product.featured && (
                      <div className="absolute top-3 left-3 bg-[#C1581B] text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                        Featured
                      </div>
                    )}
                    {product.popular && !product.featured && (
                      <div className="absolute top-3 left-3 bg-[#C1581B]/80 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                        Best Seller
                      </div>
                    )}
                    
                    <CardContent className="p-0">
                      {/* Product Image Container */}
                      <Link to={`/product/${product.id}`}>
                        <div className="relative h-64 bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center cursor-pointer">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform group-hover:scale-105"
                          />
                          {/* Category Badge */}
                          <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-3 py-1 shadow-md">
                            <span className="text-xs font-medium text-gray-600">
                              {categories.find(c => c.id === product.categoryId)?.name}
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-6">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="text-xl font-bold text-primary mb-2 hover:text-[#C1581B] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Benefits */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.benefits.slice(0, 3).map((benefit, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex text-accent">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating)
                                    ? "fill-current"
                                    : "fill-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {product.rating} ({product.reviews.toLocaleString()})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-2xl font-bold text-[#C1581B]">{product.price}</span>
                          <span className="text-sm text-muted-foreground line-through">
                            {product.originalPrice}
                          </span>
                          <span className="bg-[#C1581B]/20 text-[#C1581B] px-2 py-0.5 rounded text-xs font-medium">
                            Save{" "}
                            {Math.round(
                              (1 -
                                parseInt(product.price.replace(/[R,]/g, "")) /
                                  parseInt(product.originalPrice.replace(/[R,]/g, ""))) *
                                100
                            )}
                            %
                          </span>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-4">
                          {product.inStock ? (
                            <span className="text-sm text-green-600 font-medium">
                              ✓ In Stock {product.stockCount && `(${product.stockCount} left)`}
                            </span>
                          ) : (
                            <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <Button
                            className="flex-1 bg-[#C1581B] hover:bg-[#B34E16] text-white shadow-wellness"
                            disabled={!product.inStock}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 border-[#C1581B] text-[#C1581B] hover:bg-[#C1581B]/10"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}