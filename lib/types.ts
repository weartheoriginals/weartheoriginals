export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  hero_copy: string | null;
  hero_image_alt: string | null;
}

export interface CategoryWithParent extends Category {
  parent: Pick<Category, "id" | "name" | "slug"> | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  // Structured listing content (added in migration 3)
  brand_name: string | null;
  materials: string | null;
  features: string[] | null;
  processing_days_min: number | null;
  processing_days_max: number | null;
  return_policy: string | null;
  shipping_from: string | null;
  free_delivery: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  attribute_name: string;
  attribute_value: string;
  stock_quantity: number;
  image_id: string | null;
  display_order: number;
}

export interface ProductVariantWithImage extends ProductVariant {
  image: ProductImage | null;
}

export interface ProductWithImages extends Product {
  category: Category | null;
  images: ProductImage[];
}

export interface ProductWithDetails extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export type GroupedVariants = Record<string, ProductVariant[]>;

export interface Order {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  shipping_address: ShippingAddress;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  happened_at: string;
}

export interface TrackedOrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  products: { name: string; slug: string } | null;
  order_item_variants: {
    product_variants: {
      attribute_name: string;
      attribute_value: string;
    } | null;
  }[];
}

export interface TrackedOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: ShippingAddress;
  created_at: string;
  order_items: TrackedOrderItem[];
  order_status_history: OrderStatusHistoryEntry[];
}

export interface TrackOrderInput {
  order_number: string;
  email: string;
}

export type OrderStatus =
  | "confirmed"
  | "processing"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: null;
  quantity: number;
  unit_price: number;
}

export interface OrderItemVariant {
  id: string;
  order_item_id: string;
  variant_id: string | null;
}

export interface CreateOrderInput {
  full_name: string;
  email: string;
  phone?: string;
  shipping_address: ShippingAddress;
  items: CreateOrderItemInput[];
  notes?: string;
}

export interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  variant_ids: string[];
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
