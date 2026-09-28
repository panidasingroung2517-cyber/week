export type BookFormat = 'physical' | 'ebook' | 'both';
export type BookGenre = 'novel' | 'comic' | 'academic' | 'knowledge' | 'children' | 'general';

export interface Book {
  id: string;
  title: string;
  author: string;
  translator?: string;
  publisher: string;
  categoryId: string;
  categoryName: string;
  format: BookFormat;
  genre: BookGenre;
  price: number;
  originalPrice?: number;
  stock: number;
  coverUrl: string;
  description: string;
  isbn: string;
  pages: number;
  language: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  publishedYear: number;
  ebookContent?: string;
  sampleContent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  bookCount: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'promptpay' | 'credit_card' | 'cod';
export type PaymentStatus = 'pending' | 'paid';

export interface OrderItem {
  bookId: string;
  title: string;
  coverUrl: string;
  format: 'physical' | 'ebook';
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
  description?: string;
}

export type UserRole = 'customer' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  wishlist: string[];
  purchasedEbookIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReadingProgress {
  id: string; // bookId
  userId: string;
  bookId: string;
  bookTitle?: string;
  currentChapter: number;
  currentPage: number;
  totalChapters: number;
  totalPages: number;
  progressPercent: number;
  lastReadAt: string;
}

export interface CartItem {
  book: Book;
  format: 'physical' | 'ebook';
  quantity: number;
}
