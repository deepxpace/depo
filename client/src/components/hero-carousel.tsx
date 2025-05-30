import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const bannerSlides = [
  {
    id: 1,
    title: "Latest Smartphones",
    subtitle: "Discover cutting-edge mobile technology",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=400&fit=crop",
    link: "/products?category=Mobile%20Phones",
  },
  {
    id: 2,
    title: "Premium Laptops",
    subtitle: "Power your productivity",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=400&fit=crop",
    link: "/products?category=Laptops",
  },
  {
    id: 3,
    title: "Smart Accessories",
    subtitle: "Enhance your digital lifestyle",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&h=400&fit=crop",
    link: "/products?category=Accessories",
  },
  {
    id: 4,
    title: "Home Appliances",
    subtitle: "Modern solutions for modern homes",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop",
    link: "/products?category=Home%20Appliances",
  },
  {
    id: 5,
    title: "Electronics Sale",
    subtitle: "Best deals on top brands",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop",
    link: "/products",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {bannerSlides.map((slide, index) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0 rounded-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-[400px] w-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center text-white space-y-4 max-w-2xl px-6">
                        <h1 className="text-4xl md:text-6xl font-bold text-white">
                          {slide.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200">
                          {slide.subtitle}
                        </p>
                        <div className="pt-4">
                          <Button 
                            asChild 
                            size="lg" 
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                          >
                            <Link href={slide.link}>
                              Shop Now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/20 border-white/20 text-white hover:bg-white/30" />
        <CarouselNext className="right-4 bg-white/20 border-white/20 text-white hover:bg-white/30" />
      </Carousel>
      
      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? "bg-red-600" 
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}