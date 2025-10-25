import { apiService } from '@/lib/api-service';
import type { ApiResponse } from '@/lib/api-service';

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
    backgroundImage: '', // Sale section doesn't have background image in API
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
    title: local.title || '',
    description: description,
    discount_text: local.buttonText || '',
    products: products,
  };
};

/**
 * Content Service Class
 */
export class ContentService {
  /**
   * Get banner/hero content from API
   */
  static async getBannerContent(token?: string): Promise<BannerContent> {
    try {
      const response = await apiService.get<BannerContent>('/content/banner', token);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch banner content');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching banner content:', error);
      throw error;
    }
  }

  /**
   * Update banner/hero content via API
   */
  static async updateBannerContent(
    content: BannerApiRequest,
    token?: string
  ): Promise<BannerContent> {
    try {
      // Validate Cloudinary URL if provided
      if (content.image_url && !validateCloudinaryUrl(content.image_url)) {
        throw new Error('Invalid image URL format. Please use a valid Cloudinary URL.');
      }

      const response = await apiService.put<BannerContent>('/content/banner', content, token);

      if (!response.success || !response.data) {
        throw new Error('Failed to update banner content');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating banner content:', error);
      throw error;
    }
  }

  /**
   * Get sale section content from API
   */
  static async getSaleSectionContent(token?: string): Promise<SaleSection> {
    try {
      const response = await apiService.get<SaleSection>('/content/sale-section', token);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch sale section content');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching sale section content:', error);
      throw error;
    }
  }

  /**
   * Update sale section content via API
   */
  static async updateSaleSectionContent(
    content: SaleSectionApiRequest,
    token?: string
  ): Promise<SaleSection> {
    try {
      const response = await apiService.put<SaleSection>('/content/sale-section', content, token);

      if (!response.success || !response.data) {
        throw new Error('Failed to update sale section content');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating sale section content:', error);
      throw error;
    }
  }

  /**
   * Get all content (convenience method)
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
      throw error;
    }
  }

  /**
   * Update hero content (convenience method with transformation)
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
      throw error;
    }
  }

  /**
   * Update sale section content (convenience method with transformation)
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
      throw error;
    }
  }
}

export default ContentService;