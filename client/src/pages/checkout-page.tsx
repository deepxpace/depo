import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addressSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react"; // Added missing import

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: {
      address: any;
      paymentMethod: string;
    }) => {
      const total = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      const response = await apiRequest("POST", "/api/orders", {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        total,
        address: data.address,
        paymentMethod: data.paymentMethod,
      });

      return response.json();
    },
    onSuccess: () => {
      clearCart();
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Checkout error:", error);
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    setLocation("/auth");
    return null;
  }

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>
            Please enter your delivery details and select a payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                checkoutMutation.mutate({
                  address: data,
                  paymentMethod,
                })
              )}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Payment Method</FormLabel>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    NPR {(total / 100).toLocaleString()}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={checkoutMutation.isPending}
                >
                  Place Order
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}