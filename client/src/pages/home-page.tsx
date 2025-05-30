
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import HeroCarousel from "@/components/hero-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const oneplusProducts = products?.filter(p => p.name.toLowerCase().includes('oneplus') || p.name.toLowerCase().includes('one plus')) || [];
  const fireboltProducts = products?.filter(p => p.name.toLowerCase().includes('fire-boltt') || p.name.toLowerCase().includes('fireboltt')) || [];

  return (
    <div className="space-y-12">
      {/* Hero Carousel Banner */}
      <HeroCarousel />

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Featured Products</h2>
        <Tabs defaultValue="oneplus" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mx-auto">
            <TabsTrigger value="oneplus">OnePlus</TabsTrigger>
            <TabsTrigger value="firebolt">Fire-Boltt</TabsTrigger>
          </TabsList>
          <TabsContent value="oneplus" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-[300px] w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {oneplusProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="firebolt" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-[300px] w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {fireboltProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
