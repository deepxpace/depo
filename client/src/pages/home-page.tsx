import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
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

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  const { addToCart } = useCart();
  const { items, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Sample featured products with sale data
  const featuredProducts = products?.slice(0, 4) || [];
  const mostSellingProducts = products?.slice(0, 4) || [];
  const newArrivals = products?.slice(0, 4) || [];

  const ProductGrid = ({ productList, showSale = true }: { productList: Product[], showSale?: boolean }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {productList.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {showSale && (
                <Badge className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-600 text-white">
                  SALE
                </Badge>
              )}
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600">
                      NPR {(product.price / 100).toLocaleString()}
                    </span>
                    {showSale && (
                      <span className="text-sm text-gray-500 line-through">
                        NPR {((product.price * 1.3) / 100).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={() => {
                    const isInWishlist = items?.some((item) => item.productId === product.id);
                    isInWishlist
                      ? removeFromWishlist(product.id)
                      : addToWishlist(product.id);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                  size="sm"
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      items?.some((item) => item.productId === product.id)
                        ? "text-red-500"
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
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-[400px] w-full" />
                ))}
              </div>
            ) : (
              <ProductGrid productList={featuredProducts} showSale={true} />
            )}
          </TabsContent>

          <TabsContent value="most-selling" className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-[400px] w-full" />
                ))}
              </div>
            ) : (
              <ProductGrid productList={mostSellingProducts} showSale={false} />
            )}
          </TabsContent>

          <TabsContent value="new-arrivals" className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-[400px] w-full" />
                ))}
              </div>
            ) : (
              <ProductGrid productList={newArrivals} showSale={false} />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}