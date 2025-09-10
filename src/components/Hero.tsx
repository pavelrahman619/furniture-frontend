"use client";

import { useState, useEffect } from "react";

// Content interface
interface HeroContent {
  backgroundImage: string;
  title: string;
  buttonText: string;
}

// Default content values
const defaultContent: HeroContent = {
  backgroundImage: "/furniture/new intro.webp",
  title: "NEW INTRODUCTIONS",
  buttonText: "NEW INTROS",
};

const Hero = () => {
  const [content, setContent] = useState<HeroContent>(defaultContent);

  // Load content from localStorage on component mount
  useEffect(() => {
    const loadContent = () => {
      const savedContent = localStorage.getItem("landing-page-content");
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent);
          if (parsedContent.hero) {
            setContent(parsedContent.hero);
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
      if (event.detail?.hero) {
        setContent(event.detail.hero);
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
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${content.backgroundImage}')`,
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.2em] mb-8 leading-tight">
          {content.title}
        </h1>

        {/* CTA Button */}
        <button className="bg-black bg-opacity-80 hover:bg-opacity-100 text-white px-8 py-3 text-sm font-medium tracking-wider transition-all duration-300 hover:scale-105">
          {content.buttonText}
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-px h-16 bg-white/50"></div>
      </div>
    </section>
  );
};

export default Hero;
