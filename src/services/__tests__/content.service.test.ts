jest.mock('@/lib/api-service');
import ContentService, { 
  BannerContent, 
  SaleSection, 
  HeroContent, 
  SaleSectionContent,
  validateCloudinaryUrl,
  transformBannerToHero,
  transformHeroToBanner,
  transformSaleSectionToLocal,
  transformLocalToSaleSection
} from '../content.service';
import * as apiModule from '@/lib/api-service';

describe('ContentService', () => {
  const mockGet = apiModule.apiService.get as jest.Mock;
  const mockPut = apiModule.apiService.put as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBannerContent', () => {
    it('returns banner content on success', async () => {
      const bannerData: BannerContent = {
        image_url: 'https://res.cloudinary.com/test/image/upload/v1/banner.jpg',
        title: 'Test Banner',
        button_text: 'Shop Now',
        button_link: '/products'
      };

      const apiResponse = {
        success: true,
        data: bannerData
      };

      mockGet.mockResolvedValue(apiResponse);

      const result = await ContentService.getBannerContent();

      expect(mockGet).toHaveBeenCalledWith('/content/banner', undefined);
      expect(result).toEqual(bannerData);
    });

    it('throws error when API call fails', async () => {
      mockGet.mockResolvedValue({ success: false });

      await expect(ContentService.getBannerContent()).rejects.toThrow('Failed to fetch banner content');
    });
  });

  describe('updateBannerContent', () => {
    it('updates banner content successfully', async () => {
      const bannerRequest = {
        image_url: 'https://res.cloudinary.com/test/image/upload/v1/banner.jpg',
        title: 'Updated Banner',
        button_text: 'Buy Now',
        button_link: '/shop'
      };

      const apiResponse = {
        success: true,
        data: bannerRequest
      };

      mockPut.mockResolvedValue(apiResponse);

      const result = await ContentService.updateBannerContent(bannerRequest);

      expect(mockPut).toHaveBeenCalledWith('/content/banner', bannerRequest, undefined);
      expect(result).toEqual(bannerRequest);
    });

    it('throws error for invalid image URL', async () => {
      const bannerRequest = {
        image_url: 'invalid-url',
        title: 'Test',
        button_text: 'Test',
        button_link: '#'
      };

      await expect(ContentService.updateBannerContent(bannerRequest)).rejects.toThrow('Invalid image URL format');
    });
  });

  describe('getSaleSectionContent', () => {
    it('returns sale section content on success', async () => {
      const saleSectionData: SaleSection = {
        title: 'Big Sale',
        description: 'Save up to 50%',
        discount_text: '50% OFF',
        products: ['product1', 'product2']
      };

      const apiResponse = {
        success: true,
        data: saleSectionData
      };

      mockGet.mockResolvedValue(apiResponse);

      const result = await ContentService.getSaleSectionContent();

      expect(mockGet).toHaveBeenCalledWith('/content/sale-section', undefined);
      expect(result).toEqual(saleSectionData);
    });
  });
});

describe('Cloudinary URL validation', () => {
  it('validates correct Cloudinary URLs', () => {
    expect(validateCloudinaryUrl('https://res.cloudinary.com/test/image/upload/v1/image.jpg')).toBe(true);
    expect(validateCloudinaryUrl('https://example.com/image.jpg')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(validateCloudinaryUrl('')).toBe(false);
    expect(validateCloudinaryUrl('invalid-url')).toBe(false);
  });
});

describe('Data transformation functions', () => {
  describe('transformBannerToHero', () => {
    it('transforms banner data to hero format', () => {
      const banner: BannerContent = {
        image_url: 'https://example.com/image.jpg',
        title: 'Test Title',
        button_text: 'Click Me',
        button_link: '/link'
      };

      const result = transformBannerToHero(banner);

      expect(result).toEqual({
        backgroundImage: 'https://example.com/image.jpg',
        title: 'Test Title',
        buttonText: 'Click Me'
      });
    });
  });

  describe('transformHeroToBanner', () => {
    it('transforms hero data to banner format', () => {
      const hero: HeroContent = {
        backgroundImage: 'https://example.com/image.jpg',
        title: 'Test Title',
        buttonText: 'Click Me'
      };

      const result = transformHeroToBanner(hero, '/custom-link');

      expect(result).toEqual({
        image_url: 'https://example.com/image.jpg',
        title: 'Test Title',
        button_text: 'Click Me',
        button_link: '/custom-link'
      });
    });
  });

  describe('transformSaleSectionToLocal', () => {
    it('transforms sale section data to local format', () => {
      const saleSection: SaleSection = {
        image_url: 'https://example.com/bg.jpg',
        title: 'Big Sale',
        description: 'Save money',
        discount_text: '50% OFF',
        products: ['product1']
      };

      const result = transformSaleSectionToLocal(saleSection);

      expect(result).toEqual({
        backgroundImage: 'https://example.com/bg.jpg',
        title: 'Big Sale',
        buttonText: '50% OFF'
      });
    });
  });

  describe('transformLocalToSaleSection', () => {
    it('transforms local data to sale section format', () => {
      const local: SaleSectionContent = {
        backgroundImage: 'https://example.com/bg.jpg',
        title: 'Local Sale',
        buttonText: '30% OFF'
      };

      const result = transformLocalToSaleSection(local, 'Description', ['prod1', 'prod2']);

      expect(result).toEqual({
        image_url: 'https://example.com/bg.jpg',
        title: 'Local Sale',
        description: 'Description',
        discount_text: '30% OFF',
        products: ['prod1', 'prod2']
      });
    });
  });
});