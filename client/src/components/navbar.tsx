import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, Search, ChevronDown, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "Mobile Phones",
    "Laptops", 
    "Accessories",
    "Home Appliances",
    "Electronics"
  ];

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 mr-4">
          <img 
            src="/neptokart-logo.png" 
            alt="NeptoKart" 
            className="h-16 w-auto object-contain max-w-[180px]"
          />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 h-10 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
            />
            <Button 
              size="sm" 
              className="absolute right-1 top-1 h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-6">
          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-red-600 transition-colors">
              Categories
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {categories.map((category) => (
                <DropdownMenuItem key={category} asChild>
                  <Link href={`/products?category=${encodeURIComponent(category)}`} className="w-full">
                    {category}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link href="/products" className="w-full font-semibold">
                  All Products
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-red-600 transition-colors">
              <User className="h-4 w-4" />
              Account
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {user ? (
                <>
                  <DropdownMenuItem className="font-medium">
                    {user.username}
                  </DropdownMenuItem>
                  {(user.role === "vendor" || user.role === "admin") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="w-full">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    className="text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth" className="w-full">
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth" className="w-full">
                      Register
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wishlist */}
          <Link href="/wishlist">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-red-600">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Wishlist</span>
            </Button>
          </Link>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="relative flex items-center gap-1 hover:text-red-600">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">Cart</span>
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-xs flex items-center justify-center text-white">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}