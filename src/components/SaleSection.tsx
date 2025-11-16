"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Content interface
interface SaleSectionContent {
  backgroundImage: string;
  title: string;
  buttonText: string;
}

// Default content values
const defaultContent: SaleSectionContent = {
  backgroundImage:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  title: "SUMMER SALE",
  buttonText: "SHOP ALL",
};

const SaleSection = () => {
  const [content, setContent] = useState<SaleSectionContent>(defaultContent);

  // Load content from localStorage on component mount
  useEffect(() => {
    const loadContent = () => {
      const savedContent = localStorage.getItem("landing-page-content");
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent);
          if (parsedContent.saleSection) {
            setContent(parsedContent.saleSection);
          }
        } catch (error) {
          console.error("Error parsing saved content:", error);
          setContent(defaultContent);
        }
      }
    };

    loadContent();

    // Listen for content updates from the admin panel
    const handleContentUpdate = (event: CustomEvent) => {
      if (event.detail?.saleSection) {
        setContent(event.detail.saleSection);
      }
    };

    window.addEventListener(
      "contentUpdated",
      handleContentUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "contentUpdated",
        handleContentUpdate as EventListener
      );
    };
  }, []);

  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${content.backgroundImage}')`
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {/* Sale Title */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.3em] text-white mb-8 drop-shadow-lg">
          {content.title}
        </h2>

        {/* Shop All Button */}
        <Link
          href="/products"
          className="bg-white text-gray-900 px-8 py-3 text-sm font-medium tracking-wider uppercase hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
        >
          {content.buttonText}
        </Link>
      </div>
    </section>
  );
};

export default SaleSection;
