export interface GurPackage {
  id: string;
  name: string;
  subTitle: string;
  weight: string;
  originalPrice: number;
  discountPrice: number;
  isPopular?: boolean;
  isFreeDelivery?: boolean;
  features: string[];
  image: string;
  badge?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  selectedPackage: GurPackage;
  quantity: number;
  deliveryArea: 'inside_dhaka' | 'outside_dhaka';
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  note?: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  avatarText: string;
  packageBought: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
