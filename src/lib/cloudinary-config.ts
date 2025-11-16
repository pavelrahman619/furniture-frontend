import { Cloudinary } from '@cloudinary/url-gen';

// Cloudinary configuration
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  },
});

// Cloudinary configuration for server-side operations
export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
};

// Validate Cloudinary configuration
export const validateCloudinaryConfig = (): boolean => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing Cloudinary environment variables: ${missingVars.join(', ')}`
    );
    return false;
  }

  return true;
};

// Upload preset for unsigned uploads (to be configured in Cloudinary dashboard)
export const CLOUDINARY_UPLOAD_PRESET = 'furniture_content_uploads';

// Folder structure for organized uploads
export const CLOUDINARY_FOLDERS = {
  HERO_IMAGES: 'furniture-ecom/hero',
  SALE_IMAGES: 'furniture-ecom/sale',
  CONTENT_IMAGES: 'furniture-ecom/content',
  PRODUCT_IMAGES: 'furniture-ecom/products',
} as const;

// Image transformation presets
export const IMAGE_TRANSFORMATIONS = {
  HERO_BANNER: {
    width: 1920,
    height: 800,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  SALE_BANNER: {
    width: 1200,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  THUMBNAIL: {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
} as const;