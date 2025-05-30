
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function OrdersPage() {
  const { user } = useAuth();
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Order History</h1>
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Order History</h1>
        <p className="text-muted-foreground">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order History</h1>
      
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Order #{order.id}</CardTitle>
              <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                {order.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div>
                <span className="font-medium">Items:</span>
                <div className="mt-1 text-sm text-muted-foreground">
                  {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                    <div key={index}>
                      Product ID {item.productId} × {item.quantity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
