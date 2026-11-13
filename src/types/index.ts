export interface Category {
  id: string;
  name: string;
  sort: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  weight_label: string;
  weight_kg: number;
  price: number;
  original_price?: number | null;
  image_url: string;
  category_id?: string | null;
  is_default_selected: boolean;
  active: boolean;
  sort: number;
}

export interface GurPackage {
  id: string;
  name: string;
  subtitle: string;
  weight_label: string;
  weight_kg: number;
  original_price: number;
  discount_price: number;
  is_popular: boolean;
  is_free_delivery: boolean;
  features: string[];
  image_url: string;
  badge?: string | null;
  active: boolean;
  sort: number;
}

export interface Banner {
  id: string;
  image_url: string;
  title?: string | null;
  subtitle?: string | null;
  active: boolean;
  sort: number;
}

export interface Review {
  id: string;
  name: string;
  location?: string | null;
  rating: number;
  comment: string;
  package_bought?: string | null;
  approved: boolean;
  created_at: string;
}

export type ItemKind = 'product' | 'package';

export interface OrderItem {
  kind: ItemKind;
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight_kg?: number;
  image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka';

export interface CourierInfo {
  provider: 'steadfast';
  consignment_id?: number | string;
  tracking_code?: string;
  status?: string;
  sent_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: DeliveryArea;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  source: 'web' | 'call';
  note?: string | null;
  admin_note?: string | null;
  courier?: CourierInfo | null;
  created_at: string;
  updated_at: string;
}

export interface IncompleteOrder {
  id: string;
  session_id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  items: OrderItem[];
  total: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  role: 'owner' | 'admin' | 'staff';
  permissions: string[];
  created_at: string;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  address: string;
  logo_emoji: string;
  logo_url: string;
  order_prefix: string;
  colors: { primary: string; secondary: string; accent: string; background: string };
}

export interface DeliverySettings {
  inside_dhaka: number;
  outside_dhaka: number;
  free_min_kg: number;
  free_min_amount: number;
}

export interface FraudSettings {
  enabled: boolean;
  max_orders_per_day: number;
  min_address_length: number;
  blocked_phones: string[];
  block_message: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LandingContent {
  announcement: string;
  offer_label: string;
  offer_title: string;
  countdown_hours: number;
  hero_badge: string;
  hero_title: string;
  hero_highlight: string;
  hero_title_end: string;
  hero_description: string;
  hero_bullets: string[];
  hero_cta: string;
  hero_price_label: string;
  hero_price_text: string;
  hero_tag_left: string;
  hero_tag_right: string;
  packages_badge: string;
  packages_title: string;
  packages_subtitle: string;
  story_badge: string;
  story_title: string;
  story_subtitle: string;
  story_image: string;
  story_caption_title: string;
  story_caption: string;
  pitha_image: string;
  pitha_badge: string;
  pitha_title: string;
  pitha_text: string;
  pitha_points: string[];
  reviews_badge: string;
  reviews_title: string;
  reviews_subtitle: string;
  reviews_rating: string;
  reviews_count_text: string;
  reviews_stat_1: string;
  reviews_stat_2: string;
  order_form_title: string;
  order_form_subtitle: string;
  success_title: string;
  success_text: string;
  faq_title: string;
  faq_subtitle: string;
  faqs: FaqItem[];
  footer_about: string;
}
