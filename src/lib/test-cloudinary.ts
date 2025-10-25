// Manual test functions for Cloudinary integration
// These can be called from the browser console or test page

import { validateCloudinaryConfig, cloudinary } from './cloudinary-config';
import { validateImageFile, getOptimizedImageUrl } from './cloudinary-utils';

/**
 * Test Cloudinary configuration
 */
export const testCloudinaryConfig = (): boolean => {
  console.log('🧪 Testing Cloudinary Configuration...');
  
  const isValid = validateCloudinaryConfig();
  console.log(`Configuration valid: ${isValid}`);
  
  if (!isValid) {
    console.log('❌ Please check your environment variables:');
    console.log('- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    console.log('- CLOUDINARY_API_KEY');
    console.log('- CLOUDINARY_API_SECRET');
  }
  
  return isValid;
};

/**
 * Test file validation with sample files
 */
export const testFileValidation = (): void => {
  console.log('🧪 Testing File Validation...');
  
  // Test valid file
  const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
  const validResult = validateImageFile(validFile);
  console.log(`Valid JPEG: ${validResult.valid ? '✅' : '❌'}`);
  
  // Test invalid file type
  const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
  const invalidResult = validateImageFile(invalidFile);
  console.log(`Invalid text file: ${invalidResult.valid ? '❌' : '✅'} (${invalidResult.error})`);
  
  // Test oversized file (mock)
  const oversizedFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
  const oversizedResult = validateImageFile(oversizedFile);
  console.log(`Oversized file: ${oversizedResult.valid ? '❌' : '✅'} (${oversizedResult.error})`);
};

/**
 * Test URL generation
 */
export const testUrlGeneration = (): void => {
  console.log('🧪 Testing URL Generation...');
  
  try {
    const samplePublicId = 'furniture-ecom/hero/sample-image';
    
    const heroUrl = getOptimizedImageUrl(samplePublicId, 'HERO_BANNER');
    const saleUrl = getOptimizedImageUrl(samplePublicId, 'SALE_BANNER');
    const thumbnailUrl = getOptimizedImageUrl(samplePublicId, 'THUMBNAIL');
    
    console.log('Generated URLs:');
    console.log(`Hero (1920x800): ${heroUrl}`);
    console.log(`Sale (1200x600): ${saleUrl}`);
    console.log(`Thumbnail (400x300): ${thumbnailUrl}`);
    
    // Verify URLs contain expected transformations
    const hasTransformations = heroUrl.includes('w_1920') && heroUrl.includes('h_800');
    console.log(`URL transformations: ${hasTransformations ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ URL Generation Error:', error);
  }
};

/**
 * Test Cloudinary instance
 */
export const testCloudinaryInstance = (): void => {
  console.log('🧪 Testing Cloudinary Instance...');
  
  try {
    // Test if cloudinary instance is properly configured
    const testImage = cloudinary.image('sample');
    const testUrl = testImage.toURL();
    
    console.log(`Cloudinary instance: ${testUrl ? '✅' : '❌'}`);
    console.log(`Sample URL: ${testUrl}`);
    
    // Check if cloud name is set
    const hasCloudName = testUrl.includes('res.cloudinary.com');
    console.log(`Cloud name configured: ${hasCloudName ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Cloudinary Instance Error:', error);
  }
};

/**
 * Run all tests
 */
export const runAllCloudinaryTests = (): void => {
  console.log('🚀 Running All Cloudinary Tests...\n');
  
  testCloudinaryConfig();
  console.log('');
  
  testFileValidation();
  console.log('');
  
  testUrlGeneration();
  console.log('');
  
  testCloudinaryInstance();
  console.log('');
  
  console.log('✅ All tests completed. Check the console output above for results.');
  console.log('💡 To test image upload, use the ImageUpload component in your app.');
};