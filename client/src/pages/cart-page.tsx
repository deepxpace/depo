import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const total = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
      
      await apiRequest("POST", "/api/orders", {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        total,
      });
    },
    onSuccess: () => {
      clearCart();
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
      setLocation("/");
    },
  });

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to checkout",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }

    checkoutMutation.mutate();
  };

  if (items.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Shopping Cart</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.product.id}>
              <TableCell>{item.product.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                NPR {(item.product.price / 100).toLocaleString()}
              </TableCell>
              <TableCell>
                NPR {((item.product.price * item.quantity) / 100).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: NPR {(total / 100).toLocaleString()}
        </div>
        <Button onClick={handleCheckout} disabled={checkoutMutation.isPending}>
          Checkout
        </Button>
      </div>
    </div>
  );
}
