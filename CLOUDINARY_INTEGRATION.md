# Cloudinary Integration Guide

This document explains how to set up and use Cloudinary for image management in the furniture e-commerce admin panel.

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Cloudinary Dashboard Configuration

1. **Create Upload Preset:**
   - Go to your Cloudinary dashboard
   - Navigate to Settings > Upload
   - Create a new upload preset named `furniture_content_uploads`
   - Set it to "Unsigned" for client-side uploads
   - Configure folder structure and transformations as needed

2. **Folder Structure:**
   The integration uses the following folder structure:
   - `furniture-ecom/hero` - Hero section images
   - `furniture-ecom/sale` - Sale section images
   - `furniture-ecom/content` - General content images

## Usage

### Basic Image Upload Component

```tsx
import { ImageUpload } from '@/components/ImageUpload';

const MyComponent = () => {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUpload
      currentImage={imageUrl}
      onImageChange={setImageUrl}
      onImageRemove={() => setImageUrl('')}
      uploadOptions={{
        folder: 'HERO_IMAGES',
        transformation: 'HERO_BANNER',
        tags: ['hero', 'content'],
      }}
    />
  );
};
```

### Integration with Admin Content Page

To integrate with the existing admin content page (`src/app/admin/content/page.tsx`):

1. Import the ImageUpload component
2. Replace existing background image input fields
3. Use the component for hero and sale section images

Example integration:

```tsx
// Replace the existing background image input with:
<ImageUpload
  currentImage={content.hero.backgroundImage}
  onImageChange={(url) => updateContent('hero', 'backgroundImage', url)}
  uploadOptions={{
    folder: 'HERO_IMAGES',
    transformation: 'HERO_BANNER',
    tags: ['hero', 'banner'],
  }}
  placeholder="Upload hero background image"
/>
```

## Features

### Image Upload
- Drag and drop support
- File validation (type and size)
- Progress indicators
- Error handling
- Automatic optimization

### Image Transformations
- **Hero Banner**: 1920x800px, optimized quality
- **Sale Banner**: 1200x600px, optimized quality
- **Thumbnail**: 400x300px, optimized quality

### Utilities

#### Upload Image
```tsx
import { uploadImageToCloudinary } from '@/lib/cloudinary-utils';

const result = await uploadImageToCloudinary(file, {
  folder: 'HERO_IMAGES',
  tags: ['hero', 'content'],
});
```

#### Generate Optimized URL
```tsx
import { getOptimizedImageUrl } from '@/lib/cloudinary-utils';

const optimizedUrl = getOptimizedImageUrl(publicId, 'HERO_BANNER');
```

#### Validate Image File
```tsx
import { validateImageFile } from '@/lib/cloudinary-utils';

const validation = validateImageFile(file);
if (!validation.valid) {
  console.error(validation.error);
}
```

## File Structure

```
src/
├── lib/
│   ├── cloudinary-config.ts      # Cloudinary configuration
│   └── cloudinary-utils.ts       # Upload and utility functions
├── components/
│   ├── ImageUpload.tsx           # Main upload component
│   └── AdminImageUploadExample.tsx # Usage example
```

## Configuration Options

### Upload Options
- `folder`: Target folder in Cloudinary
- `transformation`: Image transformation preset
- `tags`: Array of tags for organization

### Transformation Presets
- `HERO_BANNER`: 1920x800px for hero sections
- `SALE_BANNER`: 1200x600px for sale sections
- `THUMBNAIL`: 400x300px for thumbnails

## Security Notes

- Client-side uploads use unsigned upload presets
- Server-side operations require API credentials
- File validation prevents malicious uploads
- Size limits prevent abuse (10MB max)

## Troubleshooting

### Common Issues

1. **Upload Preset Not Found**
   - Ensure the upload preset `furniture_content_uploads` exists in your Cloudinary dashboard
   - Make sure it's set to "Unsigned"

2. **Environment Variables**
   - Verify all required environment variables are set
   - Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is accessible client-side

3. **CORS Issues**
   - Cloudinary allows uploads from any domain by default
   - If restricted, add your domain to allowed origins

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG_API=true
```

This will log upload attempts and errors to the console.