'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { uploadImageToCloudinary, validateImageFile, ImageUploadOptions } from '@/lib/cloudinary-utils';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  onImageRemove?: () => void;
  uploadOptions?: ImageUploadOptions;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  onImageRemove,
  uploadOptions = {},
  className = '',
  placeholder = 'Click to upload or drag and drop an image',
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset image load error when currentImage changes
  useEffect(() => {
    setImageLoadError(false);
  }, [currentImage]);

  // Prevent page refresh during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        return 'Image upload is in progress. Are you sure you want to leave?';
      }
    };

    if (isUploading) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isUploading]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setUploadSuccess(false);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    
    try {
      const result = await uploadImageToCloudinary(file, uploadOptions);
      
      if (result.success && result.url) {
        setImageLoadError(false); // Reset image load error on successful upload
        setUploadSuccess(true);
        onImageChange(result.url);
        
        // Hide success message after 2 seconds
        setTimeout(() => {
          setUploadSuccess(false);
        }, 2000);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
    }
    setError(null);
    setImageLoadError(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`
          relative rounded-xl transition-all duration-300 cursor-pointer group
          ${currentImage 
            ? 'border-2 border-solid border-gray-200 hover:border-gray-300 p-2' 
            : dragActive 
              ? 'border-2 border-dashed border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/10 p-4' 
              : 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 p-4'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {currentImage ? (
          <div className="relative group">
            <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
              {!imageLoadError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={currentImage}
                  alt="Uploaded content"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={() => {
                    setImageLoadError(true);
                  }}
                  onLoad={() => {
                    setImageLoadError(false);
                    setError(null);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gradient-to-br from-red-50 to-orange-50">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                    <ImageIcon className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-red-600">Failed to load image</p>
                  <p className="text-xs text-gray-500 mt-1">Click to upload a new image</p>
                </div>
              )}
            </div>
            
            {/* Upload overlay when replacing image */}
            {isUploading && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 bg-opacity-95 rounded-lg flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="bg-white p-4 rounded-full shadow-lg mb-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-blue-900">Uploading new image...</p>
                <p className="text-xs text-orange-600 mt-2 font-medium bg-orange-100 px-2 py-1 rounded-full">
                  ⚠️ Don't refresh the page
                </p>
                <div className="w-32 bg-gray-200 rounded-full h-1 mt-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            )}
            
            {/* Success overlay */}
            {uploadSuccess && (
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 bg-opacity-95 rounded-lg flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="bg-white p-4 rounded-full shadow-lg mb-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-sm font-semibold text-green-800">Upload successful!</p>
              </div>
            )}
            
            {/* Remove button */}
            {onImageRemove && !disabled && !isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
              >
                <X size={14} />
              </button>
            )}
            
            {/* Hover overlay */}
            {!imageLoadError && !isUploading && !uploadSuccess && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-300 rounded-lg flex items-center justify-center backdrop-blur-0 hover:backdrop-blur-sm">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <span className="text-gray-800 font-medium text-sm flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Click to change image
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 animate-ping"></div>
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-900">Uploading image...</p>
                  <p className="text-sm text-orange-600 mt-2 font-medium bg-orange-100 px-3 py-1 rounded-full inline-block">
                    ⚠️ Don't refresh the page during upload
                  </p>
                </div>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse transition-all duration-1000" style={{ width: '65%' }}></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className={`
                    flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 transform group-hover:scale-110
                    ${dragActive 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100'
                    }
                  `}>
                    {dragActive ? (
                      <Upload className="h-10 w-10 text-white animate-bounce" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    )}
                  </div>
                  {dragActive && (
                    <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 animate-pulse"></div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {dragActive ? (
                      <span className="text-blue-600">Drop your image here!</span>
                    ) : (
                      placeholder
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, WebP up to 10MB
                  </p>
                  {!dragActive && (
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 mt-3">
                      <div className="flex items-center space-x-1">
                        <Upload className="w-3 h-3" />
                        <span>Click to browse</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Drag & drop</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Uploading... Please don't refresh the page or navigate away.</p>
            </div>
          </div>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Image uploaded successfully!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};