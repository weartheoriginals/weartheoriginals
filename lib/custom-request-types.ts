export const PRODUCT_OPTIONS = [
  { value: 'mens-jackets', label: "Men's Jackets" },
  { value: 'womens-jackets', label: "Women's Jackets" },
  { value: 'bags-and-clutches', label: 'Bags & Clutches' },
  { value: 'vintage-leather', label: 'Vintage Leather' },
  { value: 'leather-accessories', label: 'Leather Accessories' },
  { value: 'other', label: 'Other' },
];

export const isCustomType = (v: unknown): v is string => typeof v === 'string' && PRODUCT_OPTIONS.some(o => o.value === v);

export const CUSTOM_STATUSES = [
  { value: 'awaiting_files', label: 'Incomplete' },
  { value: 'submitted', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_production', label: 'In production' },
  { value: 'quality_check', label: 'Quality check' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const statusLabel = (v: string | null) => CUSTOM_STATUSES.find(s => s.value === v)?.label ?? v ?? '—';

export const typeLabel = (type: string | null, other?: string | null) =>
  type === 'other' ? other || 'Other' : (PRODUCT_OPTIONS.find(o => o.value === type)?.label ?? type ?? '—');
