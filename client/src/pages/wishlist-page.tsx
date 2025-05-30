
import { useWishlist } from "@/components/wishlist-provider";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ShoppingCart, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { items, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Your wishlist is empty</h1>
        <p className="text-muted-foreground">
          Start adding products you love to your wishlist
        </p>
        <Button variant="outline" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        My Wishlist ({items.length} items)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
            <CardContent className="p-0">
              <Link href={`/products/${item.product.id}`}>
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <div className="p-4 space-y-3">
                <Link href={`/products/${item.product.id}`}>
                  <h3 className="font-semibold text-sm text-navy-800 hover:text-red-600 transition-colors line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>
                
                <p className="text-xs text-gray-600 line-clamp-2">
                  {item.product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-red-600">
                    NPR {(item.product.price / 100).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => addToCart(item.product)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                    disabled={item.product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromWishlist(item.productId)}
                    className="px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
