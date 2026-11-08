export type GalleryImage = { id: string; url: string; variantId: string | null };

export type ColorOption = {
  id: string;
  name: string;
  swatch: string; // small label image
  hero: string; // big image for the Color Variant View
};

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  freeDelivery: boolean;
  isBestSeller: boolean;
  isInStock: boolean;
  fomoQuantity: number | null;
  discountPercent: number;
  processingMin: number | null;
  processingMax: number | null;
};

export const isColorAttribute = (name: string) => /^colou?r$/i.test(name);

// Fake but stable rating: same slug always gives the same numbers (no hydration mismatch).
export function getFakeRating(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return {
    rating: Math.round((4.3 + (h % 7) / 10) * 10) / 10, // 4.3 to 4.9
    count: 40 + (h % 160),
  };
}

export type RelatedCard = {
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  colors: string[]; // CSS colors for the dots
  isBestSeller: boolean;
  discountPercent: number;
  rating: number;
  count: number;
};

const COLOR_OVERRIDES: Record<string, string> = {
  camel: '#c19a6b',
  burgundy: '#800020',
  cognac: '#9a463d',
  olive: '#6b6b3a',
  cream: '#f3ead8',
  tan: '#c8a27a',
};

// "Red" -> "red", which CSS understands. Names CSS doesn't know go in the map above.
export const colorToCss = (name: string) => COLOR_OVERRIDES[name.trim().toLowerCase()] ?? name.trim().toLowerCase();

// Price after discount, rounded to 2 decimals. discountPercent 0 returns the same price.
export function getFinalPrice(price: number, discountPercent: number) {
  if (!discountPercent || discountPercent <= 0) return price;
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}
