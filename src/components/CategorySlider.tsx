"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
}

const CategorySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const categories: Category[] = [
    // {
    //   id: "artisan-house",
    //   title: "ARTISAN HOUSE",
    //   description:
    //     "Where craftsmanship meets timeless beauty. Each curated, found piece is an heirloom of artisanal design, meticulously hand-carved from reclaimed wood to reveal layers of character and history.",
    //   image:
    //     "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    // },
    {
      id: "living-room",
      title: "LIVING ROOM",
      description:
        "Discover the living room section, where sophisticated design meets modern luxury. From statement seating to elegant accents, elevate your home with enduring style",
      image:
        "/furniture/living room.webp",
    },
    {
      id: "dining-room",
      title: "DINING ROOM",
      description:
        "Our dining room section brings elegance to every occasion. Discover refined tables and seating designed for timeless gatherings",
      image:
        "/furniture/dining room.webp",
    },
    {
      id: "bedroom",
      title: "BEDROOM",
      description:
        "Transform your bedroom into a sanctuary of comfort & style",
      image:
        "/furniture/bedroom.jpg",
    },
    // {
    //   id: "bedroom 1",
    //   title: "BEDROOM 1",
    //   description:
    //     "Transform your bedroom into a sanctuary of comfort & style",
    //   image:
    //     "/furniture/bedroom 1.jpg",
    // },
    // {
    //   id: "bedroom 2",
    //   title: "BEDROOM 2",
    //   description:
    //     "Transform your bedroom into a sanctuary of comfort & style",
    //   image:
    //     "/furniture/bedroom 2.jpg",
    // },
    {
      id: "office",
      title: "OFFICE",
      description:
        "Curated office pieces that inspire success and style",
      image:
        "/furniture/office.webp",
    },
    {
      id: "entry-and-decor",
      title: "ENTRY & DECOR",
      description:
        "Make a lasting first impression with entryway pieces and decor",
      image:
        "/furniture/entry and decor.webp",
    },
    {
      id: "outdoor",
      title: "OUTDOOR",
      description:
        "Outdoor living made easy with modern, weather-ready furniture",
      image:
        "/furniture/outdoor.jpg",
    },
    // {
    //   id: "lighting",
    //   title: "LIGHTING",
    //   description:
    //     "From charming chandeliers to accent pieces, these handcrafted fixtures bring warmth, personality, and artisanal beauty to every space.",
    //   image:
    //     "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    // },
  ];

  const slideLeft = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setCurrentIndex(Math.min(categories.length - 1, currentIndex + 1));
    }
  };

  return (
    <section className="py-16 bg-white">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-light tracking-[0.2em] text-gray-900 mb-4">
          SHOP BY CATEGORY
        </h2>
      </div>

      {/* Slider Container - Full Width */}
      <div className="relative w-full">
        {/* Left Arrow */}
        <button
          onClick={slideLeft}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={slideRight}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
          disabled={currentIndex === categories.length - 1}
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pl-6 pr-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-none w-80 bg-white group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden mb-6 h-80">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:opacity-10 transition-all duration-300" />
              </div>

              {/* Content */}
              <div className="text-center px-4">
                <h3 className="text-xl font-medium tracking-wider text-gray-900 mb-4">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default CategorySlider;
