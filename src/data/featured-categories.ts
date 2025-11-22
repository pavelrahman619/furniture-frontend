/**
 * Featured Categories Data
 * Shared category data used across the application for homepage and mega menu
 */

export interface FeaturedCategory {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  slug?: string;
  subcategories?: FeaturedSubcategory[];
}

export interface FeaturedSubcategory {
  id: string;
  name: string;
  slug?: string;
}

/**
 * Main featured categories with images and descriptions
 */
export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: "bedroom",
    name: "Bedroom",
    title: "BEDROOM",
    description:
      "Transform your bedroom into an oasis of your own with our thoughtfully curated collections.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "bedroom",
    subcategories: [
      { id: "beds", name: "Beds", slug: "beds" },
      { id: "nightstands", name: "Nightstands", slug: "nightstands" },
      { id: "dressers", name: "Dressers", slug: "dressers" },
      {
        id: "bedroom-benches",
        name: "Bedroom Benches",
        slug: "bedroom-benches",
      },
      { id: "mirrors", name: "Mirrors", slug: "mirrors" },
    ],
  },
  {
    id: "dining-room",
    name: "Dining Room",
    title: "DINING ROOM",
    description:
      "Inspired by the people and places that form the heart of our brand, each piece invites you to relax in style and comfort.",
    image:
      "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "dining-room",
    subcategories: [
      { id: "dining-tables", name: "Dining Tables", slug: "dining-tables" },
      { id: "dining-chairs", name: "Dining Chairs", slug: "dining-chairs" },
      { id: "benches", name: "Benches", slug: "benches" },
      { id: "bar-stools", name: "Bar Stools", slug: "bar-stools" },
      { id: "buffets", name: "Buffets & Sideboards", slug: "buffets" },
    ],
  },
  {
    id: "entry-decor",
    name: "Entry & Decor",
    title: "ENTRY & DECOR",
    description:
      "Where craftsmanship meets timeless beauty. Each curated piece is an heirloom of artisanal design, meticulously hand-carved from reclaimed wood to reveal layers of character and history.",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "entry-decor",
    subcategories: [
      { id: "console-tables", name: "Console Tables", slug: "console-tables" },
      { id: "mirrors", name: "Mirrors", slug: "mirrors" },
      { id: "accent-decor", name: "Accent Decor", slug: "accent-decor" },
      { id: "lighting", name: "Lighting", slug: "lighting" },
      { id: "wall-art", name: "Wall Art", slug: "wall-art" },
    ],
  },
  {
    id: "living-room",
    name: "Living Room",
    title: "LIVING ROOM",
    description:
      "Discover our living room collections - a selection of beautifully handcrafted items, designed to last a lifetime.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "living-room",
    subcategories: [
      { id: "sofas", name: "Sofas & Sectionals", slug: "sofas" },
      { id: "coffee-tables", name: "Coffee Tables", slug: "coffee-tables" },
      { id: "armchairs", name: "Armchairs", slug: "armchairs" },
      { id: "media-consoles", name: "Media Consoles", slug: "media-consoles" },
      { id: "bookcases", name: "Bookcases", slug: "bookcases" },
    ],
  },
  {
    id: "office",
    name: "Office",
    title: "OFFICE",
    description:
      "Functional and beautiful furniture for work and productivity, designed to inspire creativity and focus.",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "office",
    subcategories: [
      { id: "desks", name: "Desks", slug: "desks" },
      { id: "office-chairs", name: "Office Chairs", slug: "office-chairs" },
      { id: "bookcases", name: "Bookcases", slug: "bookcases" },
      { id: "file-cabinets", name: "File Cabinets", slug: "file-cabinets" },
      { id: "desk-lamps", name: "Desk Lamps", slug: "desk-lamps" },
    ],
  },
  {
    id: "outdoor",
    name: "Outdoor",
    title: "OUTDOOR",
    description:
      "Durable and stylish outdoor furniture designed to withstand the elements while creating a beautiful outdoor living space.",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "outdoor",
    subcategories: [
      { id: "patio-sets", name: "Patio Sets", slug: "patio-sets" },
      {
        id: "outdoor-seating",
        name: "Outdoor Seating",
        slug: "outdoor-seating",
      },
      { id: "outdoor-tables", name: "Outdoor Tables", slug: "outdoor-tables" },
      {
        id: "outdoor-lighting",
        name: "Outdoor Lighting",
        slug: "outdoor-lighting",
      },
      {
        id: "outdoor-storage",
        name: "Outdoor Storage",
        slug: "outdoor-storage",
      },
    ],
  },
];

/**
 * Get a category by ID
 */
export const getCategoryById = (id: string): FeaturedCategory | undefined => {
  return FEATURED_CATEGORIES.find((cat) => cat.id === id);
};

/**
 * Get a category by slug
 */
export const getCategoryBySlug = (
  slug: string
): FeaturedCategory | undefined => {
  return FEATURED_CATEGORIES.find((cat) => cat.slug === slug);
};

/**
 * Transform featured categories to CategoryResponse format for mega menu
 */
export const transformToMegaMenuFormat = () => {
  return FEATURED_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug || cat.id,
    image_url: cat.image,
    parent_id: undefined,
    subcategories: cat.subcategories?.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug || sub.id,
      image_url: undefined,
      parent_id: cat.id,
    })),
  }));
};

/**
 * Get all category IDs
 */
export const getAllCategoryIds = (): string[] => {
  return FEATURED_CATEGORIES.map((cat) => cat.id);
};

/**
 * Get all category slugs
 */
export const getAllCategorySlugs = (): string[] => {
  return FEATURED_CATEGORIES.map((cat) => cat.slug || cat.id);
};
