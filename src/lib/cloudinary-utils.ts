import { cloudinary, CLOUDINARY_FOLDERS, IMAGE_TRANSFORMATIONS } from './cloudinary-config';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { quality, format } from '@cloudinary/url-gen/actions/delivery';

// Types for image upload
export interface ImageUploadOptions {
  folder?: keyof typeof CLOUDINARY_FOLDERS;
  transformation?: keyof typeof IMAGE_TRANSFORMATIONS;
  tags?: string[];
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

// Upload image to Cloudinary (client-side)
export const uploadImageToCloudinary = async (
  file: File,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> => {
  try {
    const { folder = 'CONTENT_IMAGES', tags = [] } = options;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'furniture_content_uploads'); // This needs to be configured in Cloudinary
    formData.append('folder', CLOUDINARY_FOLDERS[folder]);
    
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Generate optimized image URL with transformations
export const getOptimizedImageUrl = (
  publicId: string,
  transformationType: keyof typeof IMAGE_TRANSFORMATIONS = 'THUMBNAIL'
): string => {
  const transformation = IMAGE_TRANSFORMATIONS[transformationType];
  
  const image = cloudinary
    .image(publicId)
    .resize(fill().width(transformation.width).height(transformation.height))
    .delivery(quality(transformation.quality))
    .delivery(format(transformation.format));

  return image.toURL();
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file size must be less than 10MB',
    };
  }

  return { valid: true };
};

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' and version (if present)
    let pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    // Remove version if present (starts with 'v' followed by numbers)
    if (pathAfterUpload[0] && /^v\d+$/.test(pathAfterUpload[0])) {
      pathAfterUpload = pathAfterUpload.slice(1);
    }
    
    // Join the remaining parts and remove file extension
    const publicIdWithExtension = pathAfterUpload.join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// Delete image from Cloudinary (requires server-side implementation)
export const deleteImageFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // This would typically be done server-side for security
    // For now, we'll just return true as a placeholder
    console.log('Delete image request for:', publicId);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};