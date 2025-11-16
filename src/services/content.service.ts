import { apiService } from '@/lib/api-service';

/**
 * Frontend interfaces (current structure used in admin content page)
 */
export interface HeroContent {
  backgroundImage: string;
  title: string;
  buttonText: string;
}

export interface SaleSectionContent {
  backgroundImage: string;
  title: string;
  buttonText: string;
}

/**
 * Backend API interfaces (from Postman collection)
 */
export interface BannerContent {
  image_url: string;
  title: string;
  button_text: string;
  button_link: string;
}

export interface SaleSection {
  image_url?: string;
  title: string;
  description: string;
  discount_text: string;
  products: string[];
}

/**
 * API Request interfaces
 */
export interface BannerApiRequest {
  image_url: string;
  title: string;
  button_text: string;
  button_link: string;
}

export interface SaleSectionApiRequest {
  image_url?: string;
  title: string;
  description: string;
  discount_text: string;
  products: string[];
}

/**
 * API Response interfaces
 */
export interface BannerApiResponse {
  success: boolean;
  data: BannerContent;
  message?: string;
}

export interface SaleSectionApiResponse {
  success: boolean;
  data: SaleSection;
  message?: string;
}

/**
 * Cloudinary URL validation
 */
const CLOUDINARY_URL_PATTERN = /^https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/.+/;

export const validateCloudinaryUrl = (url: string): boolean => {
  if (!url) return false;
  return CLOUDINARY_URL_PATTERN.test(url) || url.startsWith('http');
};

/**
 * Data transformation functions
 */
export const transformBannerToHero = (banner: BannerContent): HeroContent => {
  return {
    backgroundImage: banner.image_url || '',
    title: banner.title || '',
    buttonText: banner.button_text || '',
  };
};

export const transformHeroToBanner = (hero: HeroContent, buttonLink: string = '#'): BannerContent => {
  return {
    image_url: hero.backgroundImage || '',
    title: hero.title || '',
    button_text: hero.buttonText || '',
    button_link: buttonLink,
  };
};

export const transformSaleSectionToLocal = (saleSection: SaleSection): SaleSectionContent => {
  return {
    backgroundImage: saleSection.image_url || '',
    title: saleSection.title || '',
    buttonText: saleSection.discount_text || '',
  };
};

export const transformLocalToSaleSection = (
  local: SaleSectionContent,
  description: string = '',
  products: string[] = []
): SaleSection => {
  return {
    image_url: local.backgroundImage || '',
    title: local.title || '',
    description: description,
    discount_text: local.buttonText || '',
    products: products,
  };
};

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delay: 1000,
  backoffMultiplier: 2,
};

/**
 * Enhanced error types
 */
export class ContentServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'ContentServiceError';
  }
}

/**
 * Retry utility function
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> => {
  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt or if error is not retryable
      if (attempt === config.maxRetries || 
          (error instanceof ContentServiceError && !error.retryable)) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      const delay = config.delay * Math.pow(config.backoffMultiplier, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Content Service Class
 */
export class ContentService {
  /**
   * Get banner/hero content from API with retry logic
   */
  static async getBannerContent(token?: string): Promise<BannerContent> {
    return withRetry(async () => {
      try {
        const response = await apiService.get<BannerContent>('/content/banner', token);

        if (!response.success || !response.data) {
          throw new ContentServiceError(
            'Failed to fetch banner content - invalid response',
            'INVALID_RESPONSE',
            undefined,
            true
          );
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching banner content:', error);
        
        if (error instanceof ContentServiceError) {
          throw error;
        }
        
        // Handle different error types
        if (error instanceof Error) {
          if (error.message.includes('Network Error') || error.message.includes('fetch')) {
            throw new ContentServiceError(
              'Network error while fetching banner content. Please check your connection.',
              'NETWORK_ERROR',
              undefined,
              true
            );
          }
          
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            throw new ContentServiceError(
              'Authentication failed. Please log in again.',
              'AUTH_ERROR',
              401,
              false
            );
          }
          
          if (error.message.includes('403') || error.message.includes('Forbidden')) {
            throw new ContentServiceError(
              'You do not have permission to access this content.',
              'PERMISSION_ERROR',
              403,
              false
            );
          }
          
          if (error.message.includes('404')) {
            throw new ContentServiceError(
              'Banner content not found.',
              'NOT_FOUND',
              404,
              false
            );
          }
          
          if (error.message.includes('500')) {
            throw new ContentServiceError(
              'Server error while fetching banner content. Please try again later.',
              'SERVER_ERROR',
              500,
              true
            );
          }
        }
        
        throw new ContentServiceError(
          'An unexpected error occurred while fetching banner content.',
          'UNKNOWN_ERROR',
          undefined,
          true
        );
      }
    });
  }

  /**
   * Update banner/hero content via API with retry logic
   */
  static async updateBannerContent(
    content: BannerApiRequest,
    token?: string
  ): Promise<BannerContent> {
    return withRetry(async () => {
      try {
        // Validate Cloudinary URL if provided
        if (content.image_url && !validateCloudinaryUrl(content.image_url)) {
          throw new ContentServiceError(
            'Invalid image URL format. Please use a valid Cloudinary URL.',
            'VALIDATION_ERROR',
            400,
            false
          );
        }

        const response = await apiService.put<BannerContent>('/content/banner', content, token);

        if (!response.success || !response.data) {
          throw new ContentServiceError(
            'Failed to update banner content - invalid response',
            'INVALID_RESPONSE',
            undefined,
            true
          );
        }

        return response.data;
      } catch (error) {
        console.error('Error updating banner content:', error);
        
        if (error instanceof ContentServiceError) {
          throw error;
        }
        
        // Handle different error types
        if (error instanceof Error) {
          if (error.message.includes('Network Error') || error.message.includes('fetch')) {
            throw new ContentServiceError(
              'Network error while updating banner content. Please check your connection.',
              'NETWORK_ERROR',
              undefined,
              true
            );
          }
          
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            throw new ContentServiceError(
              'Authentication failed. Please log in again.',
              'AUTH_ERROR',
              401,
              false
            );
          }
          
          if (error.message.includes('403') || error.message.includes('Forbidden')) {
            throw new ContentServiceError(
              'You do not have permission to update this content.',
              'PERMISSION_ERROR',
              403,
              false
            );
          }
          
          if (error.message.includes('400') || error.message.includes('Bad Request')) {
            throw new ContentServiceError(
              'Invalid content data. Please check your inputs.',
              'VALIDATION_ERROR',
              400,
              false
            );
          }
          
          if (error.message.includes('500')) {
            throw new ContentServiceError(
              'Server error while updating banner content. Please try again later.',
              'SERVER_ERROR',
              500,
              true
            );
          }
        }
        
        throw new ContentServiceError(
          'An unexpected error occurred while updating banner content.',
          'UNKNOWN_ERROR',
          undefined,
          true
        );
      }
    });
  }

  /**
   * Get sale section content from API with retry logic
   */
  static async getSaleSectionContent(token?: string): Promise<SaleSection> {
    return withRetry(async () => {
      try {
        const response = await apiService.get<SaleSection>('/content/sale-section', token);

        if (!response.success || !response.data) {
          throw new ContentServiceError(
            'Failed to fetch sale section content - invalid response',
            'INVALID_RESPONSE',
            undefined,
            true
          );
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching sale section content:', error);
        
        if (error instanceof ContentServiceError) {
          throw error;
        }
        
        // Handle different error types
        if (error instanceof Error) {
          if (error.message.includes('Network Error') || error.message.includes('fetch')) {
            throw new ContentServiceError(
              'Network error while fetching sale section content. Please check your connection.',
              'NETWORK_ERROR',
              undefined,
              true
            );
          }
          
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            throw new ContentServiceError(
              'Authentication failed. Please log in again.',
              'AUTH_ERROR',
              401,
              false
            );
          }
          
          if (error.message.includes('404')) {
            throw new ContentServiceError(
              'Sale section content not found.',
              'NOT_FOUND',
              404,
              false
            );
          }
          
          if (error.message.includes('500')) {
            throw new ContentServiceError(
              'Server error while fetching sale section content. Please try again later.',
              'SERVER_ERROR',
              500,
              true
            );
          }
        }
        
        throw new ContentServiceError(
          'An unexpected error occurred while fetching sale section content.',
          'UNKNOWN_ERROR',
          undefined,
          true
        );
      }
    });
  }

  /**
   * Update sale section content via API with retry logic
   */
  static async updateSaleSectionContent(
    content: SaleSectionApiRequest,
    token?: string
  ): Promise<SaleSection> {
    return withRetry(async () => {
      try {
        const response = await apiService.put<SaleSection>('/content/sale-section', content, token);

        if (!response.success || !response.data) {
          throw new ContentServiceError(
            'Failed to update sale section content - invalid response',
            'INVALID_RESPONSE',
            undefined,
            true
          );
        }

        return response.data;
      } catch (error) {
        console.error('Error updating sale section content:', error);
        
        if (error instanceof ContentServiceError) {
          throw error;
        }
        
        // Handle different error types
        if (error instanceof Error) {
          if (error.message.includes('Network Error') || error.message.includes('fetch')) {
            throw new ContentServiceError(
              'Network error while updating sale section content. Please check your connection.',
              'NETWORK_ERROR',
              undefined,
              true
            );
          }
          
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            throw new ContentServiceError(
              'Authentication failed. Please log in again.',
              'AUTH_ERROR',
              401,
              false
            );
          }
          
          if (error.message.includes('403') || error.message.includes('Forbidden')) {
            throw new ContentServiceError(
              'You do not have permission to update this content.',
              'PERMISSION_ERROR',
              403,
              false
            );
          }
          
          if (error.message.includes('400') || error.message.includes('Bad Request')) {
            throw new ContentServiceError(
              'Invalid content data. Please check your inputs.',
              'VALIDATION_ERROR',
              400,
              false
            );
          }
          
          if (error.message.includes('500')) {
            throw new ContentServiceError(
              'Server error while updating sale section content. Please try again later.',
              'SERVER_ERROR',
              500,
              true
            );
          }
        }
        
        throw new ContentServiceError(
          'An unexpected error occurred while updating sale section content.',
          'UNKNOWN_ERROR',
          undefined,
          true
        );
      }
    });
  }

  /**
   * Get all content (convenience method) with enhanced error handling
   */
  static async getAllContent(token?: string): Promise<{
    hero: HeroContent;
    saleSection: SaleSectionContent;
  }> {
    try {
      const [bannerData, saleSectionData] = await Promise.all([
        this.getBannerContent(token),
        this.getSaleSectionContent(token),
      ]);

      return {
        hero: transformBannerToHero(bannerData),
        saleSection: transformSaleSectionToLocal(saleSectionData),
      };
    } catch (error) {
      console.error('Error fetching all content:', error);
      
      if (error instanceof ContentServiceError) {
        throw error;
      }
      
      throw new ContentServiceError(
        'Failed to load content. Please try again.',
        'FETCH_ALL_ERROR',
        undefined,
        true
      );
    }
  }

  /**
   * Update hero content (convenience method with transformation) with enhanced error handling
   */
  static async updateHeroContent(
    heroContent: HeroContent,
    buttonLink: string = '#',
    token?: string
  ): Promise<HeroContent> {
    try {
      const bannerData = transformHeroToBanner(heroContent, buttonLink);
      const updatedBanner = await this.updateBannerContent(bannerData, token);
      return transformBannerToHero(updatedBanner);
    } catch (error) {
      console.error('Error updating hero content:', error);
      
      if (error instanceof ContentServiceError) {
        throw error;
      }
      
      throw new ContentServiceError(
        'Failed to update hero content. Please try again.',
        'UPDATE_HERO_ERROR',
        undefined,
        true
      );
    }
  }

  /**
   * Update sale section content (convenience method with transformation) with enhanced error handling
   */
  static async updateSaleSectionContentLocal(
    saleSectionContent: SaleSectionContent,
    description: string = '',
    products: string[] = [],
    token?: string
  ): Promise<SaleSectionContent> {
    try {
      const saleSectionData = transformLocalToSaleSection(saleSectionContent, description, products);
      const updatedSaleSection = await this.updateSaleSectionContent(saleSectionData, token);
      return transformSaleSectionToLocal(updatedSaleSection);
    } catch (error) {
      console.error('Error updating sale section content:', error);
      
      if (error instanceof ContentServiceError) {
        throw error;
      }
      
      throw new ContentServiceError(
        'Failed to update sale section content. Please try again.',
        'UPDATE_SALE_SECTION_ERROR',
        undefined,
        true
      );
    }
  }
}

export default ContentService;