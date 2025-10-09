/**
 * Mock data for development and testing
 * This provides fallback data when the backend database is empty
 */

import { DisplayProduct } from '@/types/product.types';

export const mockProducts: DisplayProduct[] = [
  {
    id: "mock-1",
    name: "Ezra Reclaimed Wood 3Dwr Console Table",
    category_id: "console",
    price: 1299,
    featured: true,
    sku: "EZR-001",
    description: "Beautiful reclaimed wood console table with 3 drawers. Handcrafted with attention to detail.",
    variants: [
      {
        _id: "variant-1",
        color: "brown",
        material: "wood",
        size: "large",
        price: 1299,
        stock: 5,
        sku: "EZR-001-BR-L"
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Ezra Console Table",
        is_primary: true
      }
    ],
    stock: 5,
    availability: "in-stock"
  },
  {
    id: "mock-2",
    name: "Mattai Reclaimed Wood 4Dwr Console",
    category_id: "console",
    price: 1599,
    featured: true,
    sku: "MAT-001",
    description: "Spacious reclaimed wood console with 4 drawers for ample storage.",
    variants: [
      {
        _id: "variant-2",
        color: "brown",
        material: "wood",
        size: "large",
        price: 1599,
        stock: 3,
        sku: "MAT-001-BR-L"
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1494947665470-20322015e3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Mattai Console",
        is_primary: true
      }
    ],
    stock: 3,
    availability: "in-stock"
  },
  {
    id: "mock-3",
    name: "Itsa Reclaimed Wood Bench",
    category_id: "bench",
    price: 799,
    featured: true,
    sku: "ITS-001",
    description: "Elegant reclaimed wood bench perfect for dining or entryway use.",
    variants: [
      {
        _id: "variant-3",
        color: "natural",
        material: "wood",
        size: "medium",
        price: 799,
        stock: 8,
        sku: "ITS-001-NAT-M"
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Itsa Bench",
        is_primary: true
      }
    ],
    stock: 8,
    availability: "in-stock"
  },
  {
    id: "mock-4",
    name: "Rustic Oak Dining Table",
    category_id: "table",
    price: 2199,
    featured: false,
    sku: "OAK-001",
    description: "Solid oak dining table that seats 6-8 people comfortably.",
    variants: [
      {
        _id: "variant-4",
        color: "brown",
        material: "wood",
        size: "large",
        price: 2199,
        stock: 2,
        sku: "OAK-001-BR-L"
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Rustic Oak Dining Table",
        is_primary: true
      }
    ],
    stock: 2,
    availability: "in-stock"
  },
  {
    id: "mock-5",
    name: "Modern Leather Armchair",
    category_id: "chair",
    price: 1299,
    featured: false,
    sku: "ARM-001",
    description: "Comfortable modern armchair upholstered in premium leather.",
    variants: [
      {
        _id: "variant-5",
        color: "black",
        material: "leather",
        size: "standard",
        price: 1299,
        stock: 0,
        sku: "ARM-001-BLK-S"
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Modern Leather Armchair",
        is_primary: true
      }
    ],
    stock: 0,
    availability: "out-of-stock"
  },
  {
    id: "mock-6",
    name: "Industrial Metal Bookshelf",
    category_id: "storage",
    price: 899,
    featured: false,
    sku: "IND-001",
    description: "Industrial-style metal bookshelf with 5 adjustable shelves.",
    variants: [
      {
        _id: "variant-6",
        color: "black",
        material: "metal",
        size: "large",
        price: 899,
        stock: 0,
        sku: "IND-001-BLK-L"
      }
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Industrial Metal Bookshelf",
        is_primary: true
      }
    ],
    stock: 0,
    availability: "out-of-stock"
  }
];

/**
 * Check if we should use mock data (when backend returns empty results)
 */
export const shouldUseMockData = (): boolean => {
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};

/**
 * Get mock products with filtering
 */
export const getMockProducts = (filters?: {
  category_id?: string;
  colors?: string[];
  materials?: string[];
  price_min?: number;
  price_max?: number;
  search?: string;
  featured?: boolean;
}): DisplayProduct[] => {
  let filtered = [...mockProducts];

  if (filters) {
    // Category filter
    if (filters.category_id) {
      filtered = filtered.filter(p => p.category_id === filters.category_id);
    }

    // Featured filter
    if (filters.featured !== undefined) {
      filtered = filtered.filter(p => p.featured === filters.featured);
    }

    // Colors filter
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(p => 
        p.variants.some(variant => filters.colors!.includes(variant.color || ''))
      );
    }

    // Materials filter
    if (filters.materials && filters.materials.length > 0) {
      filtered = filtered.filter(p => 
        p.variants.some(variant => filters.materials!.includes(variant.material || ''))
      );
    }

    // Price filter
    if (filters.price_min) {
      filtered = filtered.filter(p => p.price >= filters.price_min!);
    }
    if (filters.price_max) {
      filtered = filtered.filter(p => p.price <= filters.price_max!);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm) ||
        p.category_id.toLowerCase().includes(searchTerm)
      );
    }
  }

  return filtered;
};
