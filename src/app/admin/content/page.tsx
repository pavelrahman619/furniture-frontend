"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Eye,
  ImageIcon,
  Type,
  MousePointer,
} from "lucide-react";

// Content interfaces for type safety
interface HeroContent {
  backgroundImage: string;
  title: string;
  buttonText: string;
}

interface SaleSectionContent {
  backgroundImage: string;
  title: string;
  buttonText: string;
}

interface ContentData {
  hero: HeroContent;
  saleSection: SaleSectionContent;
}

// Default content values
const defaultContent: ContentData = {
  hero: {
    backgroundImage:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2158&q=80",
    title: "NEW ARRIVALS",
    buttonText: "CHECK IT OUT",
  },
  saleSection: {
    backgroundImage:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "SUMMER SALE",
    buttonText: "SHOP ALL",
  },
};

export default function ContentManagementPage() {
  const [content, setContent] = useState<ContentData>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem("landing-page-content");
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContent(parsedContent);
      } catch (error) {
        console.error("Error parsing saved content:", error);
        setContent(defaultContent);
      }
    }
    setIsLoading(false);
  }, []);

  // Handle content changes
  const handleContentChange = (
    section: keyof ContentData,
    field: keyof HeroContent | keyof SaleSectionContent,
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Save content to localStorage
  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("landing-page-content", JSON.stringify(content));

      // Simulate save delay for better UX
      setTimeout(() => {
        setIsSaving(false);
        // Dispatch a custom event to notify other components of the content change
        window.dispatchEvent(
          new CustomEvent("contentUpdated", { detail: content })
        );
        alert(
          "Content saved successfully! Changes will be visible on the landing page."
        );
      }, 500);
    } catch (error) {
      console.error("Error saving content:", error);
      setIsSaving(false);
      alert("Error saving content. Please try again.");
    }
  };

  // Reset to default content
  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all content to default values?")
    ) {
      setContent(defaultContent);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Admin
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">
                Content Management
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Edit" : "Preview"}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {!showPreview ? (
          <div className="space-y-8">
            {/* Hero Section Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Hero Section
                  </h2>
                  <p className="text-sm text-gray-600">
                    Main banner content displayed at the top of the landing page
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Background Image */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      value={content.hero.backgroundImage}
                      onChange={(e) =>
                        handleContentChange(
                          "hero",
                          "backgroundImage",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter image URL"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Type className="h-4 w-4 mr-2" />
                      Title Text
                    </label>
                    <input
                      type="text"
                      value={content.hero.title}
                      onChange={(e) =>
                        handleContentChange("hero", "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter title text"
                    />
                  </div>

                  {/* Button Text */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MousePointer className="h-4 w-4 mr-2" />
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={content.hero.buttonText}
                      onChange={(e) =>
                        handleContentChange(
                          "hero",
                          "buttonText",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter button text"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="aspect-[16/9] relative rounded-lg overflow-hidden border border-gray-200">
                    {content.hero.backgroundImage && (
                      <Image
                        src={content.hero.backgroundImage}
                        alt="Hero background preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        onError={() => {}}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-xl font-light tracking-wider mb-3">
                          {content.hero.title}
                        </h3>
                        <button className="bg-black bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 text-xs font-medium tracking-wider transition-all duration-300">
                          {content.hero.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sale Section Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <ImageIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sale Section
                  </h2>
                  <p className="text-sm text-gray-600">
                    Promotional section content displayed on the landing page
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Background Image */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      value={content.saleSection.backgroundImage}
                      onChange={(e) =>
                        handleContentChange(
                          "saleSection",
                          "backgroundImage",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter image URL"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Type className="h-4 w-4 mr-2" />
                      Title Text
                    </label>
                    <input
                      type="text"
                      value={content.saleSection.title}
                      onChange={(e) =>
                        handleContentChange(
                          "saleSection",
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter title text"
                    />
                  </div>

                  {/* Button Text */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MousePointer className="h-4 w-4 mr-2" />
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={content.saleSection.buttonText}
                      onChange={(e) =>
                        handleContentChange(
                          "saleSection",
                          "buttonText",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter button text"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="aspect-[16/9] relative rounded-lg overflow-hidden border border-gray-200">
                    {content.saleSection.backgroundImage && (
                      <Image
                        src={content.saleSection.backgroundImage}
                        alt="Sale section background preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        onError={() => {}}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-2xl font-light tracking-wider mb-3">
                          {content.saleSection.title}
                        </h3>
                        <button className="bg-white text-gray-900 px-4 py-2 text-xs font-medium tracking-wider uppercase hover:bg-gray-100 transition-all duration-300">
                          {content.saleSection.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Preview Mode */
          <div className="space-y-8">
            {/* Hero Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Hero Section Preview
                </h3>
              </div>
              <div className="relative h-96">
                {content.hero.backgroundImage && (
                  <Image
                    src={content.hero.backgroundImage}
                    alt="Hero background preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    onError={() => {}}
                  />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em] mb-8">
                      {content.hero.title}
                    </h1>
                    <button className="bg-black bg-opacity-80 hover:bg-opacity-100 text-white px-8 py-3 text-sm font-medium tracking-wider transition-all duration-300 hover:scale-105">
                      {content.hero.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sale Section Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Sale Section Preview
                </h3>
              </div>
              <div className="relative h-96">
                {content.saleSection.backgroundImage && (
                  <Image
                    src={content.saleSection.backgroundImage}
                    alt="Sale section background preview"
                    fill
                    className="object-cover"
                    onError={() => {}}
                  />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.3em] mb-8">
                      {content.saleSection.title}
                    </h2>
                    <button className="bg-white text-gray-900 px-8 py-3 text-sm font-medium tracking-wider uppercase hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      {content.saleSection.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
