import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to TruKart Nepal</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your one-stop shop for the latest electronics. From smartphones to laptops,
          find the best tech at great prices.
        </p>
        <Button variant="outline" asChild>
          <Link href="/products">Shop Now</Link>
        </Button>
      </section>

      </div>
  );
}