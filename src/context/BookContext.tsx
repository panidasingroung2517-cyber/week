import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Book, Category, Order, Review, Coupon, NotificationItem, ReadingProgress } from '../types';
import { INITIAL_BOOKS, INITIAL_CATEGORIES, INITIAL_COUPONS } from '../data/initialBooks';

interface BookContextType {
  books: Book[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  notifications: NotificationItem[];
  readingProgress: Record<string, ReadingProgress>;
  loading: boolean;
  isFirebaseSynced: boolean;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedGenre: string | null;
  setSelectedGenre: (genre: string | null) => void;
  selectedFormat: 'all' | 'physical' | 'ebook';
  setSelectedFormat: (format: 'all' | 'physical' | 'ebook') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'popular';
  setSortBy: (sort: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'popular') => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  
  // Book operations
  addBook: (book: Omit<Book, 'id'>) => Promise<string>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;

  // Category operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;

  // Order operations
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => Promise<void>;

  // Review operations
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  moderateReview: (reviewId: string, status: 'approved' | 'rejected') => Promise<void>;

  // Coupon operations
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
  toggleCoupon: (couponId: string, isActive: boolean) => Promise<void>;

  // Notification operations
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt'>) => void;

  // Reading Progress operations
  saveReadingProgress: (
    userId: string,
    bookId: string,
    currentChapter: number,
    currentPage: number,
    totalChapters: number,
    totalPages: number,
    bookTitle?: string
  ) => Promise<void>;
  getReadingProgress: (bookId: string) => ReadingProgress | null;
  loadUserReadingProgress: (userId: string) => Promise<void>;

  // DB Sync
  seedDatabaseToFirestore: () => Promise<{ success: boolean; count: number }>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('chotthean_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('chotthean_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('chotthean_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('chotthean_reviews');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'rev-01',
        bookId: 'book-01',
        userId: 'user-01',
        userName: 'คุณนภสร',
        rating: 5,
        title: 'วรรณกรรมที่อบอุ่นและชวนคิดถึงอดีต',
        comment: 'อ่านจบแล้วน้ำตาซึม ภาษาเขียนสวยงามมาก พล็อตเรื่องเชื่อมโยงกันอย่างชาญฉลาด ร้านหนังสือโชติเทียนแพ็คหนังสือมาอย่างดีเยี่ยม',
        isVerifiedPurchase: true,
        status: 'approved',
        createdAt: '2026-09-20T10:30:00Z',
      },
      {
        id: 'rev-02',
        bookId: 'book-02',
        userId: 'user-02',
        userName: 'ธนกฤต ม.',
        rating: 5,
        title: 'เปลี่ยนนิสัยการอ่านและชีวิตได้จริงๆ',
        comment: 'อ่านง่าย นำไปปฏิบัติได้จริง ชอบกฎ 2 นาทีมาก ช่วยให้เริ่มต้นสิ่งใหม่ๆ ได้ง่ายขึ้น แนะนำให้อ่านเลยครับ',
        isVerifiedPurchase: true,
        status: 'approved',
        createdAt: '2026-09-22T14:15:00Z',
      },
      {
        id: 'rev-03',
        bookId: 'book-10',
        userId: 'user-03',
        userName: 'แพรวา ก.',
        rating: 5,
        title: 'ปาฏิหาริย์ที่ประทับใจที่สุดแห่งปี',
        comment: 'เนื้อเรื่องมหัศจรรย์ ทุกจดหมายมีข้อคิดอันทรงคุณค่า เล่มนี้ขึ้นหิ้งในดวงใจไปแล้วค่ะ',
        isVerifiedPurchase: true,
        status: 'approved',
        createdAt: '2026-09-25T19:00:00Z',
      },
    ];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('chotthean_coupons_list');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'all',
      title: 'ยินดีต้อนรับสู่ร้านหนังสือ โชติเทียน',
      message: 'ใช้โค้ด WELCOME50 รับส่วนลด 50 บาท ทันทีในการสั่งซื้อครั้งแรก',
      type: 'promo',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'all',
      title: 'หนังสือใหม่ประจำสัปดาห์เข้าแล้ว!',
      message: 'พบกับหนังสือเตรียมสอบ TCAS และนิยายแปลขายดี พร้อมส่งแล้ววันนี้',
      type: 'system',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);

  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>(() => {
    const saved = localStorage.getItem('chotthean_reading_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      'book-01': {
        id: 'book-01',
        userId: 'demo-admin-chotthean',
        bookId: 'book-01',
        bookTitle: 'ความทรงจำที่โปรยปรายในฤดูใบไม้ผลิ',
        currentChapter: 2,
        currentPage: 48,
        totalChapters: 12,
        totalPages: 312,
        progressPercent: 15,
        lastReadAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    };
  });

  useEffect(() => {
    localStorage.setItem('chotthean_reading_progress', JSON.stringify(readingProgress));
  }, [readingProgress]);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'physical' | 'ebook'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'popular'>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('chotthean_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('chotthean_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('chotthean_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('chotthean_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('chotthean_coupons_list', JSON.stringify(coupons));
  }, [coupons]);

  // Fetch from Firestore on load if available
  useEffect(() => {
    async function loadFromFirestore() {
      try {
        const booksSnap = await getDocs(collection(db, 'books'));
        if (!booksSnap.empty) {
          const loadedBooks: Book[] = [];
          booksSnap.forEach((doc) => {
            loadedBooks.push(doc.data() as Book);
          });
          setBooks(loadedBooks);
          setIsFirebaseSynced(true);
        }

        const catSnap = await getDocs(collection(db, 'categories'));
        if (!catSnap.empty) {
          const loadedCats: Category[] = [];
          catSnap.forEach((doc) => {
            loadedCats.push(doc.data() as Category);
          });
          setCategories(loadedCats);
        }
      } catch (err) {
        console.warn('Initial Firestore fetch notice (using cached data):', err);
      }
    }
    loadFromFirestore();
  }, []);

  // Book operations
  const addBook = async (bookData: Omit<Book, 'id'>): Promise<string> => {
    const id = `book-${Date.now()}`;
    const newBook: Book = {
      ...bookData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBooks((prev) => [newBook, ...prev]);

    try {
      await setDoc(doc(db, 'books', id), newBook);
    } catch (err) {
      console.warn('Saved book locally. Firestore sync error:', err);
    }

    return id;
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    const updatedAt = new Date().toISOString();
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt } : b))
    );

    try {
      await updateDoc(doc(db, 'books', id), { ...updates, updatedAt });
    } catch (err) {
      console.warn('Updated book locally. Firestore sync note:', err);
    }
  };

  const deleteBook = async (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'books', id));
    } catch (err) {
      console.warn('Deleted book locally. Firestore delete note:', err);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    const stock = Math.max(0, newStock);
    await updateBook(id, { stock });
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCategory: Category = { ...categoryData, id };
    setCategories((prev) => [...prev, newCategory]);

    try {
      await setDoc(doc(db, 'categories', id), newCategory);
    } catch (err) {
      console.warn('Saved category locally. Firestore note:', err);
    }
  };

  // Orders
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: now,
      updatedAt: now,
    };

    // Deduct stock for physical items
    orderData.items.forEach((item) => {
      if (item.format === 'physical') {
        const target = books.find((b) => b.id === item.bookId);
        if (target) {
          updateStock(target.id, Math.max(0, target.stock - item.quantity));
        }
      }
    });

    setOrders((prev) => [newOrder, ...prev]);

    // Send in-app notification
    addNotification({
      userId: newOrder.userId,
      title: `สั่งซื้อสำเร็จ #${newOrder.id}`,
      message: `คำสั่งซื้อยอด ฿${newOrder.total} อยู่ในสถานะ "${newOrder.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอชำระเงิน'}"`,
      type: 'order',
      link: `/orders/${newOrder.id}`,
      isRead: false,
    });

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (err) {
      console.warn('Order saved locally. Firestore sync note:', err);
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNumber?: string) => {
    const updatedAt = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              ...(trackingNumber ? { trackingNumber } : {}),
              updatedAt,
            }
          : o
      )
    );

    // Notification for user
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const statusMap: Record<Order['status'], string> = {
        pending: 'รอตรวจสอบการชำระเงิน',
        confirmed: 'ยืนยันคำสั่งซื้อแล้ว',
        processing: 'กำลังแพ็คสินค้า',
        shipped: `จัดส่งแล้ว ${trackingNumber ? `(เลขพัสดุ: ${trackingNumber})` : ''}`,
        delivered: 'จัดส่งสำเร็จเรียบร้อย',
        cancelled: 'ยกเลิกคำสั่งซื้อแล้ว',
      };

      addNotification({
        userId: targetOrder.userId,
        title: `อัปเดตคำสั่งซื้อ #${orderId}`,
        message: `สถานะคำสั่งซื้อของคุณเปลี่ยนเป็น "${statusMap[status]}"`,
        type: 'order',
        link: `/orders/${orderId}`,
        isRead: false,
      });
    }

    try {
      const updatePayload: Record<string, any> = { status, updatedAt };
      if (trackingNumber) updatePayload.trackingNumber = trackingNumber;
      await updateDoc(doc(db, 'orders', orderId), updatePayload);
    } catch (err) {
      console.warn('Order updated locally. Firestore update note:', err);
    }
  };

  // Reviews
  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
    const id = `rev-${Date.now()}`;
    const newReview: Review = {
      ...reviewData,
      id,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate book rating
    const bookReviews = [...reviews.filter((r) => r.bookId === reviewData.bookId), newReview];
    const avgRating = Number(
      (bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length).toFixed(1)
    );

    updateBook(reviewData.bookId, {
      rating: avgRating,
      reviewCount: bookReviews.length,
    });

    try {
      await setDoc(doc(db, 'reviews', id), newReview);
    } catch (err) {
      console.warn('Review saved locally. Firestore sync note:', err);
    }
  };

  const moderateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { status });
    } catch (err) {
      console.warn('Review updated locally. Firestore update note:', err);
    }
  };

  // Coupons
  const addCoupon = async (couponData: Omit<Coupon, 'id'>) => {
    const id = `cp-${Date.now()}`;
    const newCoupon: Coupon = { ...couponData, id };
    setCoupons((prev) => [...prev, newCoupon]);

    try {
      await setDoc(doc(db, 'coupons', id), newCoupon);
    } catch (err) {
      console.warn('Coupon saved locally. Firestore note:', err);
    }
  };

  const toggleCoupon = async (couponId: string, isActive: boolean) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive } : c))
    );
    try {
      await updateDoc(doc(db, 'coupons', couponId), { isActive });
    } catch (err) {
      console.warn('Coupon toggled locally. Firestore note:', err);
    }
  };

  // Notifications
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Reading Progress methods
  const saveReadingProgress = async (
    userId: string,
    bookId: string,
    currentChapter: number,
    currentPage: number,
    totalChapters: number,
    totalPages: number,
    bookTitle?: string
  ) => {
    const totalP = Math.max(1, totalPages || 1);
    const progressPercent = Math.min(100, Math.max(1, Math.round((currentPage / totalP) * 100)));
    const now = new Date().toISOString();

    const progressData: ReadingProgress = {
      id: bookId,
      userId: userId || 'guest',
      bookId,
      bookTitle,
      currentChapter,
      currentPage,
      totalChapters: totalChapters || 10,
      totalPages: totalP,
      progressPercent,
      lastReadAt: now,
    };

    setReadingProgress((prev) => ({
      ...prev,
      [bookId]: progressData,
    }));

    if (userId) {
      try {
        const progressDocRef = doc(db, 'users', userId, 'readingProgress', bookId);
        await setDoc(progressDocRef, progressData, { merge: true });
      } catch (err) {
        console.warn('Saved reading progress locally. Firestore note:', err);
      }
    }
  };

  const getReadingProgress = (bookId: string): ReadingProgress | null => {
    return readingProgress[bookId] || null;
  };

  const loadUserReadingProgress = async (userId: string) => {
    if (!userId) return;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'readingProgress'));
      if (!snap.empty) {
        const loaded: Record<string, ReadingProgress> = {};
        snap.forEach((d) => {
          loaded[d.id] = d.data() as ReadingProgress;
        });
        setReadingProgress((prev) => ({ ...prev, ...loaded }));
      }
    } catch (err) {
      console.warn('Firestore load reading progress notice:', err);
    }
  };

  // Seed / Sync database
  const seedDatabaseToFirestore = async (): Promise<{ success: boolean; count: number }> => {
    setLoading(true);
    let count = 0;
    try {
      // 1. Seed Books
      for (const book of INITIAL_BOOKS) {
        await setDoc(doc(db, 'books', book.id), book);
        count++;
      }
      // 2. Seed Categories
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      // 3. Seed Coupons
      for (const cp of INITIAL_COUPONS) {
        await setDoc(doc(db, 'coupons', cp.id), cp);
      }
      setIsFirebaseSynced(true);
      return { success: true, count };
    } catch (error) {
      console.error('Seed database error:', error);
      return { success: false, count };
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookContext.Provider
      value={{
        books,
        categories,
        orders,
        reviews,
        coupons,
        notifications,
        readingProgress,
        loading,
        isFirebaseSynced,
        selectedCategory,
        setSelectedCategory,
        selectedGenre,
        setSelectedGenre,
        selectedFormat,
        setSelectedFormat,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        addBook,
        updateBook,
        deleteBook,
        updateStock,
        addCategory,
        createOrder,
        updateOrderStatus,
        addReview,
        moderateReview,
        addCoupon,
        toggleCoupon,
        markNotificationAsRead,
        addNotification,
        saveReadingProgress,
        getReadingProgress,
        loadUserReadingProgress,
        seedDatabaseToFirestore,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) throw new Error('useBooks must be used within a BookProvider');
  return context;
};
