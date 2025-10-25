/**
 * Content Service Usage Examples
 * This file demonstrates how to use the ContentService in the admin content page
 */

import ContentService, { 
  HeroContent, 
  SaleSectionContent,
  validateCloudinaryUrl 
} from './content.service';

/**
 * Example: Loading content on page initialization
 */
export const loadContentExample = async (token?: string) => {
  try {
    // Load all content at once
    const content = await ContentService.getAllContent(token);
    console.log('Loaded content:', content);
    
    // Or load individually
    const bannerContent = await ContentService.getBannerContent(token);
    const saleSectionContent = await ContentService.getSaleSectionContent(token);
    
    return { bannerContent, saleSectionContent };
  } catch (error) {
    console.error('Failed to load content:', error);
    throw error;
  }
};

/**
 * Example: Updating hero content
 */
export const updateHeroExample = async (heroData: HeroContent, token?: string) => {
  try {
    // Validate image URL before updating
    if (heroData.backgroundImage && !validateCloudinaryUrl(heroData.backgroundImage)) {
      throw new Error('Invalid image URL format');
    }

    // Update hero content with default button link
    const updatedHero = await ContentService.updateHeroContent(
      heroData,
      '/products', // button link
      token
    );
    
    console.log('Hero content updated:', updatedHero);
    return updatedHero;
  } catch (error) {
    console.error('Failed to update hero content:', error);
    throw error;
  }
};

/**
 * Example: Updating sale section content
 */
export const updateSaleSectionExample = async (
  saleSectionData: SaleSectionContent, 
  token?: string
) => {
  try {
    const updatedSaleSection = await ContentService.updateSaleSectionContentLocal(
      saleSectionData,
      'Limited time offer - save big on furniture!', // description
      ['product1', 'product2'], // featured products
      token
    );
    
    console.log('Sale section updated:', updatedSaleSection);
    return updatedSaleSection;
  } catch (error) {
    console.error('Failed to update sale section:', error);
    throw error;
  }
};

/**
 * Example: Error handling with retry logic
 */
export const updateContentWithRetry = async (
  heroData: HeroContent,
  maxRetries: number = 3,
  token?: string
) => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await ContentService.updateHeroContent(heroData, '/products', token);
      console.log(`Content updated successfully on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new Error(`Failed to update content after ${maxRetries} attempts: ${lastError.message}`);
};

/**
 * Example: Batch content update
 */
export const updateAllContentExample = async (
  heroData: HeroContent,
  saleSectionData: SaleSectionContent,
  token?: string
) => {
  try {
    // Update both sections in parallel
    const [updatedHero, updatedSaleSection] = await Promise.all([
      ContentService.updateHeroContent(heroData, '/products', token),
      ContentService.updateSaleSectionContentLocal(
        saleSectionData,
        'Special promotion',
        ['featured1', 'featured2'],
        token
      )
    ]);
    
    return {
      hero: updatedHero,
      saleSection: updatedSaleSection
    };
  } catch (error) {
    console.error('Failed to update all content:', error);
    throw error;
  }
};