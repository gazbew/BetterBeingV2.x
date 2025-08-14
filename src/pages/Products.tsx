import { useMemo, useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Breadcrumbs, breadcrumbConfigs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import SearchFilters from "@/components/SearchFilters";
import { useSearch, useSearchMetadata, SearchableItem } from "@/hooks/useSearch";
import { api } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, isAddingToCart } = useCart();

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.searchProducts({ limit: 100 }),
          api.getCategories()
        ]);

        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data.products);
        } else {
          throw new Error(productsResponse.error || 'Failed to fetch products');
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data.categories);
        } else {
          console.warn('Failed to fetch categories:', categoriesResponse.error);
          setCategories([]);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
        toast.error('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform products to work with search hook
  const searchableProducts: SearchableItem[] = useMemo(() => 
    products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      category: product.category_name,
      brand: undefined,
      price: product.price,
      inStock: product.in_stock,
      featured: product.is_featured,
      rating: product.rating,
      popularity: product.reviews_count,
      tags: product.tags || [],
    })), [products]
  );

  // Get search metadata
  const { categories: searchCategories, brands, priceRange } = useSearchMetadata(searchableProducts);
  
  // Use search hook
  const {
    filteredItems,
    searchQuery,
    filters,
    isLoading: isSearching,
    totalCount,
    handleSearchChange,
    handleFiltersChange,
    clearSearch,
    clearFilters,
    clearAll,
  } = useSearch({
    items: searchableProducts,
    searchFields: ['name', 'description', 'tags'],
    debounceMs: 300,
  });

  // Map filtered results back to original product objects
  const filteredProducts = useMemo(() => {
    return filteredItems.map(item => 
      products.find(p => p.id.toString() === item.id)!
    ).filter(Boolean);
  }, [filteredItems, products]);

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart({ productId, quantity: 1 });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
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

      <div className="container mx-auto px-4 py-2">
        <Breadcrumbs items={breadcrumbConfigs.products} className="mb-6" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search and Filters */}
          <aside className="w-full lg:w-80 shrink-0">
            <SearchFilters
              onSearchChange={handleSearchChange}
              onFiltersChange={handleFiltersChange}
              categories={searchCategories}
              brands={brands}
              priceRange={priceRange}
              className="lg:sticky lg:top-4"
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Info and Loading */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {isSearching ? 'Searching...' : `${filteredProducts.length} products found`}
                  {totalCount > 0 && ` of ${totalCount} total`}
                </p>
                {isSearching && (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                )}
              </div>
              
              {(Object.keys(filters).length > 0 || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-[#C1581B]"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Products */}
            {filteredProducts.length === 0 && !isSearching ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <Button variant="outline" onClick={clearAll}>
                  Clear all filters
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
                              {product.category_name}
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
                          {(product.benefits || []).slice(0, 3).map((benefit: string, i: number) => (
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
                            {product.rating} ({(product.reviews_count || 0).toLocaleString()})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-2xl font-bold text-[#C1581B]">R{product.price}</span>
                          {product.original_price && product.original_price > product.price && (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                R{product.original_price}
                              </span>
                              <span className="bg-[#C1581B]/20 text-[#C1581B] px-2 py-0.5 rounded text-xs font-medium">
                                Save{" "}
                                {Math.round(
                                  (1 - product.price / product.original_price) * 100
                                )}
                                %
                              </span>
                            </>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="mb-4">
                          {product.in_stock ? (
                            <span className="text-sm text-green-600 font-medium">
                              ✓ In Stock {product.stock_count && `(${product.stock_count} left)`}
                            </span>
                          ) : (
                            <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <Button
                            className="flex-1 bg-[#C1581B] hover:bg-[#B34E16] text-white shadow-wellness"
                            disabled={!product.in_stock || isAddingToCart}
                            onClick={() => handleAddToCart(product.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
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