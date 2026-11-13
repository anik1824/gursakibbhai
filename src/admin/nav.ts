import {
  LayoutGrid,
  Package,
  PhoneCall,
  Clock,
  ShoppingBag,
  Gift,
  Tag,
  Image,
  Truck,
  ShieldBan,
  MapPin,
  FileText,
  Star,
  Palette,
  Facebook,
  Tags,
  Code2,
  Users,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  key: string;
  label: string;
  title: string;
  icon: LucideIcon;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'মূল',
    items: [
      { key: 'dashboard', label: 'ড্যাশবোর্ড', title: 'ড্যাশবোর্ড', icon: LayoutGrid },
      { key: 'orders', label: 'অর্ডার', title: 'সব অর্ডার', icon: Package },
      { key: 'new_order', label: 'নতুন অর্ডার (কল)', title: 'নতুন অর্ডার (কল)', icon: PhoneCall },
      { key: 'incomplete', label: 'অসম্পূর্ণ অর্ডার', title: 'অসম্পূর্ণ অর্ডার', icon: Clock },
    ],
  },
  {
    label: 'ক্যাটালগ',
    items: [
      { key: 'products', label: 'পণ্য', title: 'পণ্য', icon: ShoppingBag },
      { key: 'combos', label: 'প্রিমিয়াম কম্বো', title: 'প্রিমিয়াম কম্বো প্যাক', icon: Gift },
      { key: 'categories', label: 'ক্যাটাগরি', title: 'ক্যাটাগরি', icon: Tag },
      { key: 'banners', label: 'ব্যানার / স্লাইডার', title: 'ব্যানার / স্লাইডার', icon: Image },
    ],
  },
  {
    label: 'ডেলিভারি ও সুরক্ষা',
    items: [
      { key: 'courier', label: 'কুরিয়ার (Steadfast)', title: 'কুরিয়ার (Steadfast)', icon: Truck },
      { key: 'fraud', label: 'ফেক অর্ডার প্রোটেকশন', title: 'ফেক অর্ডার প্রোটেকশন', icon: ShieldBan },
      { key: 'delivery', label: 'ডেলিভারি চার্জ', title: 'ডেলিভারি চার্জ', icon: MapPin },
    ],
  },
  {
    label: 'মার্কেটিং ও সেটিংস',
    items: [
      { key: 'landing', label: 'ল্যান্ডিং পেজের লেখা', title: 'ল্যান্ডিং পেজের লেখা', icon: FileText },
      { key: 'reviews', label: 'কাস্টমার রিভিউ', title: 'কাস্টমার রিভিউ', icon: Star },
      { key: 'settings', label: 'সাইট সেটিংস ও রং', title: 'সাইট সেটিংস ও রং', icon: Palette },
      { key: 'pixel', label: 'Facebook Pixel', title: 'Facebook Pixel', icon: Facebook },
      { key: 'gtm', label: 'Google Tag Manager', title: 'Google Tag Manager', icon: Tags },
      { key: 'css', label: 'কাস্টম CSS', title: 'কাস্টম CSS', icon: Code2 },
      { key: 'users', label: 'ইউজার ও অনুমতি', title: 'ইউজার ও অনুমতি', icon: Users },
    ],
  },
];

export const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
