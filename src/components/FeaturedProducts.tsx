"use client";

import Image from "next/image";
import Link from "next/link";

interface FeaturedItem {
  id: string;
  title: string;
  slug: string;
  image: string;
}

const FeaturedProducts = () => {
  const featuredItems: FeaturedItem[] = [
    {
      id: "living-room",
      title: "LIVING ROOM",
      slug: "living-room",
      image: "/furniture/featured/living.png",
    },
    {
      id: "dining-room",
      title: "DINING ROOM",
      slug: "dining-room",
      image: "/furniture/featured/dining.jpg",
    },
    {
      id: "bedroom",
      title: "BEDROOM",
      slug: "bedroom",
      image: "/furniture/featured/bedroom.jpg",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light tracking-[0.2em] text-gray-900">
            FEATURED COLLECTIONS
          </h2>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <Link
              key={item.id}
              href={`/products?category=${item.slug}`}
              className="group cursor-pointer"
            >
              {/* Tall Image */}
              <div className="relative overflow-hidden mb-6 h-96 md:h-[500px]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:opacity-10 transition-all duration-300" />
              </div>

              {/* Title */}
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-light tracking-[0.2em] text-gray-900">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
