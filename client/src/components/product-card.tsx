import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "./cart-provider";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-48 w-full object-cover transition-transform hover:scale-105"
        />
      </Link>
      
      <CardHeader>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <p className="text-2xl font-semibold text-primary">
          NPR {(product.price / 100).toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}
