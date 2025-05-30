import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, LogOut, Heart, Package, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { items: wishlistItems = [] } = useWishlist();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <img 
                src="/neptokart-logo.png" 
                alt="TruKart Nepal" 
                className="h-8 w-auto"
              />
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/">
                <Button variant="ghost" className={location === "/" ? "bg-accent" : ""}>
                  Home
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" className={location === "/products" ? "bg-accent" : ""}>
                  Products
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <Link href="/wishlist">
              <Button variant="outline" size="sm" className="relative">
                <Heart className="h-4 w-4" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.username}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile ({user.role})
                  </DropdownMenuItem>
                  <Link href="/orders">
                    <DropdownMenuItem>
                      <Package className="h-4 w-4 mr-2" />
                      Order History
                    </DropdownMenuItem>
                  </Link>
                  {user.role === "vendor" || user.role === "admin" ? (
                    <Link href="/admin">
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout.mutate()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}