export const PRODUCT_OPTIONS = [
  { value: 'mens-jackets', label: "Men's Jackets" },
  { value: 'womens-jackets', label: "Women's Jackets" },
  { value: 'bags-and-clutches', label: 'Bags & Clutches' },
  { value: 'vintage-leather', label: 'Vintage Leather' },
  { value: 'leather-accessories', label: 'Leather Accessories' },
  { value: 'other', label: 'Other' },
];

export const isCustomType = (v: unknown): v is string => typeof v === 'string' && PRODUCT_OPTIONS.some(o => o.value === v);
