import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import HeroCarousel from "@/components/hero-carousel";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id?: number;
  category_name?: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const { data: featuredProductsData, isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", "featured"],
    queryFn: async () => {
      const response = await fetch("/api/products?featured=true&limit=8");
      if (!response.ok) throw new Error("Failed to fetch featured products");
      return response.json();
    },
  });

  const { addToCart } = useCart();
  const { items, addToWishlist, removeFromWishlist } = useWishlist();

  // Filter products for different sections
  const featuredProducts = featuredProductsData?.slice(0, 8) || [];
  const mostSellingProducts = products?.slice(0, 8) || [];
  const newArrivals = products?.slice(-8) || [];

  const ProductGrid = ({ productList, showSale = true }: { productList: Product[], showSale?: boolean }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {productList.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {showSale && product.featured && (
                <Badge className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-600 text-white">
                  FEATURED
                </Badge>
              )}
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop';
                    }}
                  />
                </div>
              </Link>
            </div>
            <div className="p-4 space-y-3">
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-sm text-navy-800 hover:text-red-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <p className="text-xs text-gray-600 line-clamp-2">
                {product.description}
              </p>
              {product.category_name && (
                <Badge variant="secondary" className="text-xs">
                  {product.category_name}
                </Badge>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600">
                      NPR {product.price.toLocaleString()}
                    </span>
                    {showSale && product.featured && (
                      <span className="text-sm text-gray-500 line-through">
                        NPR {(product.price * 1.2).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={() => {
                    const isInWishlistCheck = items?.some((item) => item.product_id === product.id);
                    isInWishlistCheck
                      ? removeFromWishlist(product.id)
                      : addToWishlist(product.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      items?.some((item) => item.product_id === product.id)
                        ? "text-red-500 fill-red-500"
                        : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Hero Carousel Banner */}
      <HeroCarousel />

      {/* Explore Our Collections Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800" style={{ color: '#000080' }}>
            Explore Our Collections
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium products
          </p>
        </div>

        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full max-w-[500px] grid-cols-3 mx-auto bg-gray-100">
            <TabsTrigger 
              value="featured" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold"
            >
              Featured ({featuredProducts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="most-selling"
              className="data-[state=active]:bg-navy-800 data-[state=active]:text-white font-semibold"
              style={{ backgroundColor: 'var(--state-active, transparent)', color: 'var(--state-active-color, inherit)' }}
            >
              Most Selling ({mostSellingProducts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="new-arrivals"
              className="data-[state=active]:bg-navy-800 data-[state=active]:text-white font-semibold"
              style={{ backgroundColor: 'var(--state-active, transparent)', color: 'var(--state-active-color, inherit)' }}
            >
              New Arrivals ({newArrivals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="mt-8">
            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <Skeleton key={n} className="h-[400px] w-full" />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <ProductGrid productList={featuredProducts} showSale={true} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No featured products available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="most-selling" className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <Skeleton key={n} className="h-[400px] w-full" />
                ))}
              </div>
            ) : mostSellingProducts.length > 0 ? (
              <ProductGrid productList={mostSellingProducts} showSale={false} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new-arrivals" className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <Skeleton key={n} className="h-[400px] w-full" />
                ))}
              </div>
            ) : newArrivals.length > 0 ? (
              <ProductGrid productList={newArrivals} showSale={false} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No new arrivals available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Quick Stats or Features Section */}
      <section className="bg-gray-50 py-12 rounded-lg">
        <div className="text-center space-y-8">
          <h3 className="text-2xl font-bold text-navy-800">Why Choose NepTechMart?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-4xl">🚚</div>
              <h4 className="font-semibold">Fast Delivery</h4>
              <p className="text-sm text-gray-600">Quick and reliable delivery across Nepal</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl">💎</div>
              <h4 className="font-semibold">Quality Products</h4>
              <p className="text-sm text-gray-600">Carefully curated premium products</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl">🔒</div>
              <h4 className="font-semibold">Secure Payment</h4>
              <p className="text-sm text-gray-600">Safe and secure payment methods</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}