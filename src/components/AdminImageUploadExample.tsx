'use client';

import React, { useState } from 'react';
import { ImageUpload } from './ImageUpload';
// import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary-config';

/**
 * Example component showing how to use ImageUpload in admin content management
 * This demonstrates the integration for hero and sale section background images
 */
export const AdminImageUploadExample: React.FC = () => {
  const [heroImage, setHeroImage] = useState<string>('');
  const [saleImage, setSaleImage] = useState<string>('');

  const handleHeroImageChange = (imageUrl: string) => {
    setHeroImage(imageUrl);
    console.log('Hero image updated:', imageUrl);
    // Here you would typically update your content state or call an API
  };

  const handleSaleImageChange = (imageUrl: string) => {
    setSaleImage(imageUrl);
    console.log('Sale image updated:', imageUrl);
    // Here you would typically update your content state or call an API
  };

  const handleHeroImageRemove = () => {
    setHeroImage('');
    console.log('Hero image removed');
  };

  const handleSaleImageRemove = () => {
    setSaleImage('');
    console.log('Sale image removed');
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Content Image Management</h2>
      
      {/* Hero Section Image Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Hero Section Background</h3>
        <ImageUpload
          currentImage={heroImage}
          onImageChange={handleHeroImageChange}
          onImageRemove={handleHeroImageRemove}
          uploadOptions={{
            folder: 'HERO_IMAGES',
            transformation: 'HERO_BANNER',
            tags: ['hero', 'banner', 'content'],
          }}
          placeholder="Upload hero section background image"
          className="max-w-md"
        />
        {heroImage && (
          <div className="text-sm text-gray-600">
            <p>Current hero image URL:</p>
            <code className="bg-gray-100 p-1 rounded text-xs break-all">
              {heroImage}
            </code>
          </div>
        )}
      </div>

      {/* Sale Section Image Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Sale Section Background</h3>
        <ImageUpload
          currentImage={saleImage}
          onImageChange={handleSaleImageChange}
          onImageRemove={handleSaleImageRemove}
          uploadOptions={{
            folder: 'SALE_IMAGES',
            transformation: 'SALE_BANNER',
            tags: ['sale', 'banner', 'content'],
          }}
          placeholder="Upload sale section background image"
          className="max-w-md"
        />
        {saleImage && (
          <div className="text-sm text-gray-600">
            <p>Current sale image URL:</p>
            <code className="bg-gray-100 p-1 rounded text-xs break-all">
              {saleImage}
            </code>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Integration Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Images are automatically optimized and stored in Cloudinary</li>
          <li>• Hero images are resized to 1920x800px for optimal display</li>
          <li>• Sale images are resized to 1200x600px for consistent layout</li>
          <li>• Images are organized in folders: furniture-ecom/hero and furniture-ecom/sale</li>
          <li>• To integrate with existing admin content page, replace the background image input fields</li>
        </ul>
      </div>
    </div>
  );
};