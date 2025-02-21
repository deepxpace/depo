import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="h-[400px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="p-6">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-[400px] object-cover rounded-lg"
        />
      </Card>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary">
            NPR {(product.price / 100).toLocaleString()}
          </p>
        </div>

        <p className="text-muted-foreground">{product.description}</p>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Stock: {product.stock} units
          </p>
          <Button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
