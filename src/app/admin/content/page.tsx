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
import { ContentService, ContentServiceError } from "@/services/content.service";
import type { HeroContent, SaleSectionContent } from "@/services/content.service";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { ToastProvider, useToast } from "@/components/ToastProvider";

// Content interfaces for type safety
interface ContentData {
  hero: HeroContent;
  saleSection: SaleSectionContent;
}

// Default content values
const defaultContent: ContentData = {
  hero: {
    backgroundImage:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2158&q=80",
    title: "NEW INTRODUCTIONS",
    buttonText: "NEW INTROS",
  },
  saleSection: {
    backgroundImage:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "SUMMER SALE",
    buttonText: "SHOP ALL",
  },
};

// Separate component to use toast hook
function ContentManagementPageContent() {
  const [content, setContent] = useState<ContentData>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<ContentServiceError | null>(null);
  
  // Granular loading states
  const [loadingStates, setLoadingStates] = useState({
    hero: { saving: false },
    saleSection: { saving: false },
    initial: true,
  });

  const { showSuccess, showError, showWarning } = useToast();

  // Load content from API on component mount
  useEffect(() => {
    loadContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      setLoadingStates(prev => ({ ...prev, initial: true }));
      setError(null);
      
      // Get auth token from localStorage if available
      const token = localStorage.getItem("auth-token");
      
      const contentData = await ContentService.getAllContent(token || undefined);
      setContent(contentData);
      
      showSuccess("Content loaded successfully");
    } catch (error) {
      console.error("Error loading content:", error);
      
      const serviceError = error instanceof ContentServiceError 
        ? error 
        : new ContentServiceError("Failed to load content. Using default values.");
      
      setError(serviceError);
      setContent(defaultContent);
      
      if (serviceError.retryable) {
        showError(
          "Failed to load content", 
          `${serviceError.message} Click retry to try again.`
        );
      } else {
        showError("Failed to load content", serviceError.message);
      }
    } finally {
      setIsLoading(false);
      setLoadingStates(prev => ({ ...prev, initial: false }));
    }
  };

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

  // Save content via API with granular loading states
  const handleSave = async () => {
    setLoadingStates(prev => ({
      ...prev,
      hero: { saving: true },
      saleSection: { saving: true },
    }));
    setError(null);
    
    try {
      // Get auth token from localStorage if available
      const token = localStorage.getItem("auth-token");
      
      // Update both hero and sale section content with individual error handling
      const results = await Promise.allSettled([
        ContentService.updateHeroContent(content.hero, "#", token || undefined),
        ContentService.updateSaleSectionContentLocal(
          content.saleSection,
          "", // description - empty for now
          [], // products - empty for now
          token || undefined
        ),
      ]);

      // Check results and handle partial failures
      const heroResult = results[0];
      const saleResult = results[1];
      
      let hasErrors = false;
      const errorMessages: string[] = [];

      if (heroResult.status === 'rejected') {
        hasErrors = true;
        const error = heroResult.reason instanceof ContentServiceError 
          ? heroResult.reason 
          : new ContentServiceError("Failed to update hero content");
        errorMessages.push(`Hero section: ${error.message}`);
      }

      if (saleResult.status === 'rejected') {
        hasErrors = true;
        const error = saleResult.reason instanceof ContentServiceError 
          ? saleResult.reason 
          : new ContentServiceError("Failed to update sale section content");
        errorMessages.push(`Sale section: ${error.message}`);
      }

      if (hasErrors) {
        const combinedError = new ContentServiceError(
          errorMessages.join('; '),
          'PARTIAL_SAVE_ERROR',
          undefined,
          true
        );
        setError(combinedError);
        showError("Partial save failure", combinedError.message);
      } else {
        // Save content to localStorage for immediate availability
        localStorage.setItem("landing-page-content", JSON.stringify(content));

        // Dispatch a custom event to notify other components of the content change
        window.dispatchEvent(
          new CustomEvent("contentUpdated", { detail: content })
        );

        showSuccess(
          "Content saved successfully!",
          "Changes will be visible on the landing page."
        );
      }
    } catch (error) {
      console.error("Error saving content:", error);
      
      const serviceError = error instanceof ContentServiceError 
        ? error 
        : new ContentServiceError("Error saving content. Please try again.");
      
      setError(serviceError);
      showError("Save failed", serviceError.message);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        hero: { saving: false },
        saleSection: { saving: false },
      }));
    }
  };

  // Save individual sections
  const handleSaveHero = async () => {
    setLoadingStates(prev => ({
      ...prev,
      hero: { saving: true },
    }));
    
    try {
      const token = localStorage.getItem("auth-token");
      const updatedHeroContent = await ContentService.updateHeroContent(content.hero, "#", token || undefined);

      showSuccess("Hero section saved successfully!");

      // Update local state with the response
      setContent(prev => ({ ...prev, hero: updatedHeroContent }));

      // Save updated content to localStorage
      const updatedContent = { ...content, hero: updatedHeroContent };
      localStorage.setItem("landing-page-content", JSON.stringify(updatedContent));

      // Dispatch event for this section
      window.dispatchEvent(
        new CustomEvent("contentUpdated", { detail: { hero: updatedHeroContent } })
      );
    } catch (error) {
      console.error("Error saving hero content:", error);
      
      const serviceError = error instanceof ContentServiceError 
        ? error 
        : new ContentServiceError("Failed to save hero content");
      
      showError("Hero save failed", serviceError.message);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        hero: { saving: false },
      }));
    }
  };

  const handleSaveSaleSection = async () => {
    setLoadingStates(prev => ({
      ...prev,
      saleSection: { saving: true },
    }));
    
    try {
      const token = localStorage.getItem("auth-token");
      const updatedSaleSectionContent = await ContentService.updateSaleSectionContentLocal(
        content.saleSection,
        "",
        [],
        token || undefined
      );

      showSuccess("Sale section saved successfully!");

      // Update local state with the response
      setContent(prev => ({ ...prev, saleSection: updatedSaleSectionContent }));

      // Save updated content to localStorage
      const updatedContent = { ...content, saleSection: updatedSaleSectionContent };
      localStorage.setItem("landing-page-content", JSON.stringify(updatedContent));

      // Dispatch event for this section
      window.dispatchEvent(
        new CustomEvent("contentUpdated", { detail: { saleSection: updatedSaleSectionContent } })
      );
    } catch (error) {
      console.error("Error saving sale section content:", error);
      
      const serviceError = error instanceof ContentServiceError 
        ? error 
        : new ContentServiceError("Failed to save sale section content");
      
      showError("Sale section save failed", serviceError.message);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        saleSection: { saving: false },
      }));
    }
  };

  // Reset to default content
  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all content to default values?")
    ) {
      setContent(defaultContent);
      setError(null);
      showWarning("Content reset to default values", "Remember to save your changes.");
    }
  };

  // Retry loading content
  const handleRetry = () => {
    loadContent();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="blue" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading content...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
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
                disabled={loadingStates.hero.saving || loadingStates.saleSection.saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(loadingStates.hero.saving || loadingStates.saleSection.saving) ? (
                  <>
                    <LoadingSpinner size="sm" color="gray" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4">
              <ErrorMessage
                title="Content Management Error"
                message={error.message}
                onRetry={error.retryable ? handleRetry : undefined}
                retryLabel="Retry Loading"
              />
            </div>
          )}
        </div>

        {!showPreview ? (
          <div className="space-y-8">
            {/* Hero Section Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
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
                <button
                  onClick={handleSaveHero}
                  disabled={loadingStates.hero.saving}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loadingStates.hero.saving ? (
                    <>
                      <LoadingSpinner size="sm" color="gray" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Hero
                    </>
                  )}
                </button>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
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
                <button
                  onClick={handleSaveSaleSection}
                  disabled={loadingStates.saleSection.saving}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loadingStates.saleSection.saving ? (
                    <>
                      <LoadingSpinner size="sm" color="gray" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Sale
                    </>
                  )}
                </button>
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

// Main component wrapped with ToastProvider
export default function ContentManagementPage() {
  return (
    <ToastProvider>
      <ContentManagementPageContent />
    </ToastProvider>
  );
}
