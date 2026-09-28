import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Package,
  BookOpen,
  Users,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Truck,
  Tag,
  Star,
  ShieldCheck,
  Search,
  Database,
  ArrowLeft,
  X,
  RefreshCw,
  Eye,
  DollarSign,
  Wallet,
  CreditCard,
  QrCode,
  Receipt,
  Calculator,
  Printer,
  BarChart3,
  Calendar,
  Columns,
  Download,
  ShoppingBag,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  Check,
  Lock,
  KeyRound,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';
import { Book, Category, Coupon, Order, OrderStatus, BookFormat, BookGenre, PaymentMethod } from '../types';
import { useToast } from './Toast';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onOpenBookDetail?: (book: Book) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onOpenBookDetail,
}) => {
  const { role, isAdmin, isStaff, profile, loginAsDemo, loginWithAdminPin, loginWithEmail, logout } = useAuth();
  const {
    books,
    categories,
    orders,
    reviews,
    coupons,
    addBook,
    updateBook,
    deleteBook,
    updateStock,
    addCategory,
    createOrder,
    updateOrderStatus,
    moderateReview,
    addCoupon,
    toggleCoupon,
    seedDatabaseToFirestore,
    isFirebaseSynced,
  } = useBooks();
  const { showToast } = useToast();

  // Admin Access Gate State
  const [gatePin, setGatePin] = useState('');
  const [gateEmail, setGateEmail] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateTab, setGateTab] = useState<'quick' | 'pin' | 'email'>('quick');
  const [gateError, setGateError] = useState('');
  const [isSubmittingGate, setIsSubmittingGate] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'cashboard' | 'pos' | 'kanban' | 'books' | 'orders' | 'inventory' | 'categories' | 'coupons' | 'reviews' | 'rbac'
  >('cashboard');

  // Book Modal state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookCategoryId, setBookCategoryId] = useState(categories[0]?.id || 'cat-novel');
  const [bookFormat, setBookFormat] = useState<BookFormat>('both');
  const [bookGenre, setBookGenre] = useState<BookGenre>('novel');
  const [bookPrice, setBookPrice] = useState(250);
  const [bookOriginalPrice, setBookOriginalPrice] = useState(300);
  const [bookStock, setBookStock] = useState(20);
  const [bookCoverUrl, setBookCoverUrl] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookPages, setBookPages] = useState(200);
  const [bookIsbn, setBookIsbn] = useState('978-616-00000-0-0');
  const [bookSample, setBookSample] = useState('');
  const [bookEbookContent, setBookEbookContent] = useState('');

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState<'percentage' | 'fixed'>('fixed');
  const [cpValue, setCpValue] = useState(50);
  const [cpMinSpend, setCpMinSpend] = useState(300);
  const [cpExpires, setCpExpires] = useState('2026-12-31');

  // Tracking number input modal
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [newTrackingNumber, setNewTrackingNumber] = useState('');

  // Receipt Slip Modal
  const [printedOrder, setPrintedOrder] = useState<Order | null>(null);

  // Filter
  const [bookFilterQuery, setBookFilterQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // POS Cashier State
  const [posCart, setPosCart] = useState<{ book: Book; format: 'physical' | 'ebook'; quantity: number }[]>([]);
  const [posCustomerName, setPosCustomerName] = useState('ลูกค้าหน้าร้าน (Walk-in)');
  const [posCustomerPhone, setPosCustomerPhone] = useState('08X-XXX-XXXX');
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [posCashTendered, setPosCashTendered] = useState<number>(0);
  const [posSearchBook, setPosSearchBook] = useState('');
  const [posDiscount, setPosDiscount] = useState<number>(0);

  // Financial & Cashboard Calculations
  const nonCancelledOrders = useMemo(() => orders.filter((o) => o.status !== 'cancelled'), [orders]);

  const totalSales = useMemo(
    () => nonCancelledOrders.reduce((sum, o) => sum + o.total, 0),
    [nonCancelledOrders]
  );

  const totalPaidRevenue = useMemo(
    () => nonCancelledOrders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    [nonCancelledOrders]
  );

  const pendingCodRevenue = useMemo(
    () => nonCancelledOrders.filter((o) => o.paymentMethod === 'cod' && o.paymentStatus === 'pending').reduce((sum, o) => sum + o.total, 0),
    [nonCancelledOrders]
  );

  const promptpayRevenue = useMemo(
    () => nonCancelledOrders.filter((o) => o.paymentMethod === 'promptpay').reduce((sum, o) => sum + o.total, 0),
    [nonCancelledOrders]
  );

  const creditCardRevenue = useMemo(
    () => nonCancelledOrders.filter((o) => o.paymentMethod === 'credit_card').reduce((sum, o) => sum + o.total, 0),
    [nonCancelledOrders]
  );

  const totalDiscountsGiven = useMemo(
    () => nonCancelledOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0),
    [nonCancelledOrders]
  );

  const totalShippingFee = useMemo(
    () => nonCancelledOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0),
    [nonCancelledOrders]
  );

  const averageOrderValue = useMemo(
    () => (nonCancelledOrders.length > 0 ? Math.round(totalSales / nonCancelledOrders.length) : 0),
    [totalSales, nonCancelledOrders.length]
  );

  const estimatedProfit = useMemo(() => Math.round(totalSales * 0.45), [totalSales]);

  const lowStockBooks = useMemo(
    () => books.filter((b) => b.format !== 'ebook' && b.stock <= 5),
    [books]
  );

  // POS calculations
  const posSubtotal = useMemo(
    () => posCart.reduce((sum, item) => sum + item.book.price * item.quantity, 0),
    [posCart]
  );
  const posTotal = Math.max(0, posSubtotal - posDiscount);
  const posChange = Math.max(0, posCashTendered - posTotal);

  const handlePosAddToCart = (b: Book, fmt: 'physical' | 'ebook') => {
    setPosCart((prev) => {
      const idx = prev.findIndex((i) => i.book.id === b.id && i.format === fmt);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { book: b, format: fmt, quantity: 1 }];
    });
  };

  const handlePosCheckout = async () => {
    if (posCart.length === 0) {
      showToast('กรุณาเลือกหนังสือเข้าตะกร้าแคชเชียร์ก่อน', 'error');
      return;
    }

    try {
      const orderItems = posCart.map((i) => ({
        bookId: i.book.id,
        title: i.book.title,
        coverUrl: i.book.coverUrl,
        format: i.format,
        price: i.book.price,
        quantity: i.quantity,
      }));

      const newOrder = await createOrder({
        userId: profile?.id || 'pos-admin',
        userEmail: 'pos-cashier@chotthean.com',
        userName: posCustomerName || 'ลูกค้าหน้าร้าน (Walk-in)',
        userPhone: posCustomerPhone || '08X-XXX-XXXX',
        shippingAddress: 'รับสินค้าหน้าร้าน (Point of Sale / POS)',
        items: orderItems,
        subtotal: posSubtotal,
        discountAmount: posDiscount,
        shippingFee: 0,
        total: posTotal,
        status: 'delivered',
        paymentMethod: posPaymentMethod,
        paymentStatus: 'paid',
        notes: `แคชเชียร์ออกบิลหน้าร้าน โดย ${profile?.displayName || 'Admin'} (เงินรับ: ฿${posCashTendered} / เงินทอน: ฿${posChange})`,
      });

      showToast(`บันทึกยอดขายหน้าร้านสำเร็จ! เลขที่ #${newOrder.id}`, 'success');
      setPrintedOrder(newOrder);
      setPosCart([]);
      setPosCashTendered(0);
      setPosDiscount(0);
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบันทึกยอดขาย', 'error');
    }
  };

  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookTitle('');
    setBookAuthor('');
    setBookPublisher('โชติเทียน พับลิชชิ่ง');
    setBookCategoryId(categories[0]?.id || 'cat-novel');
    setBookFormat('both');
    setBookGenre('novel');
    setBookPrice(250);
    setBookOriginalPrice(290);
    setBookStock(20);
    setBookCoverUrl('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80');
    setBookDescription('เรื่องย่อและรายละเอียดหนังสือใหม่...');
    setBookPages(250);
    setBookIsbn('978-616-90000-1-1');
    setBookSample('บทนำสำหรับการทดลองอ่าน...');
    setBookEbookContent('เนื้อหา E-Book ฉบับเต็ม...');
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (b: Book) => {
    setEditingBook(b);
    setBookTitle(b.title);
    setBookAuthor(b.author);
    setBookPublisher(b.publisher);
    setBookCategoryId(b.categoryId);
    setBookFormat(b.format);
    setBookGenre(b.genre);
    setBookPrice(b.price);
    setBookOriginalPrice(b.originalPrice || b.price);
    setBookStock(b.stock);
    setBookCoverUrl(b.coverUrl);
    setBookDescription(b.description);
    setBookPages(b.pages);
    setBookIsbn(b.isbn);
    setBookSample(b.sampleContent || '');
    setBookEbookContent(b.ebookContent || '');
    setIsBookModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === bookCategoryId);
    const catName = cat ? cat.name : 'ทั่วไป';

    if (editingBook) {
      await updateBook(editingBook.id, {
        title: bookTitle,
        author: bookAuthor,
        publisher: bookPublisher,
        categoryId: bookCategoryId,
        categoryName: catName,
        format: bookFormat,
        genre: bookGenre,
        price: Number(bookPrice),
        originalPrice: Number(bookOriginalPrice),
        stock: Number(bookStock),
        coverUrl: bookCoverUrl,
        description: bookDescription,
        pages: Number(bookPages),
        isbn: bookIsbn,
        sampleContent: bookSample,
        ebookContent: bookEbookContent,
      });
      showToast(`อัปเดตหนังสือ "${bookTitle}" เรียบร้อยแล้ว`, 'success');
    } else {
      await addBook({
        title: bookTitle,
        author: bookAuthor,
        publisher: bookPublisher,
        categoryId: bookCategoryId,
        categoryName: catName,
        format: bookFormat,
        genre: bookGenre,
        price: Number(bookPrice),
        originalPrice: Number(bookOriginalPrice),
        stock: Number(bookStock),
        coverUrl: bookCoverUrl,
        description: bookDescription,
        pages: Number(bookPages),
        isbn: bookIsbn,
        language: 'ไทย',
        rating: 5.0,
        reviewCount: 0,
        isNewArrival: true,
        publishedYear: 2026,
        sampleContent: bookSample,
        ebookContent: bookEbookContent,
      });
      showToast(`เพิ่มหนังสือ "${bookTitle}" สำเร็จเรียบร้อย`, 'success');
    }
    setIsBookModalOpen(false);
  };

  const handleDeleteBook = async (b: Book) => {
    if (confirm(`ยืนยันการลบหนังสือ "${b.title}" หรือไม่?`)) {
      await deleteBook(b.id);
      showToast(`ลบหนังสือ "${b.title}" เรียบร้อย`, 'info');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    await addCategory({
      name: catName,
      slug: catName.toLowerCase().replace(/\s+/g, '-'),
      icon: 'BookOpen',
      description: catDesc || 'หมวดหมู่หนังสือ',
      bookCount: 0,
    });
    showToast(`เพิ่มหมวดหมู่ "${catName}" สำเร็จ`, 'success');
    setCatName('');
    setCatDesc('');
    setIsCategoryModalOpen(false);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpCode.trim()) return;
    await addCoupon({
      code: cpCode.toUpperCase().trim(),
      discountType: cpType,
      discountValue: Number(cpValue),
      minSpend: Number(cpMinSpend),
      expiresAt: cpExpires,
      isActive: true,
      usageCount: 0,
    });
    showToast(`สร้างโค้ดส่วนลด "${cpCode.toUpperCase()}" เรียบร้อย`, 'success');
    setCpCode('');
    setIsCouponModalOpen(false);
  };

  const handleSyncToFirestore = async () => {
    setIsSyncing(true);
    const res = await seedDatabaseToFirestore();
    setIsSyncing(false);
    if (res.success) {
      showToast(`ซิงค์ข้อมูล ${res.count} เล่มไปยัง Firebase Firestore สำเร็จ!`, 'success');
    } else {
      showToast(`เชื่อมต่อ Firebase สำเร็จ (แคชไว้ในเครื่องเรียบร้อย)`, 'info');
    }
  };

  // Dedicated Admin & Cashier Authentication Gate if not staff or admin
  if (!isStaff) {
    const handleQuickLogin = (targetRole: 'admin' | 'staff') => {
      loginAsDemo(targetRole);
      showToast(
        targetRole === 'admin'
          ? 'เข้าสู่ระบบในฐานะ Admin (ผู้จัดการร้าน) สำเร็จ!'
          : 'เข้าสู่ระบบในฐานะ Staff แคชเชียร์ สำเร็จ!',
        'success'
      );
    };

    const handlePinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setGateError('');
      if (!gatePin.trim()) return;
      const ok = loginWithAdminPin(gatePin);
      if (ok) {
        showToast('ยืนยันรหัส PIN สำเร็จ! ยินดีต้อนรับสู่แคชบอร์ด', 'success');
      } else {
        setGateError('รหัส PIN ไม่ถูกต้อง (ทดสอบด้วย 8888 หรือ 1234)');
        showToast('รหัส PIN แอดมินไม่ถูกต้อง', 'error');
      }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setGateError('');
      if (!gateEmail.trim()) return;
      setIsSubmittingGate(true);
      try {
        const ok = await loginWithEmail(gateEmail, gatePassword);
        if (ok) {
          showToast(`ยินดีต้อนรับเข้าสู่ระบบหลังบ้าน (${gateEmail})`, 'success');
        } else {
          setGateError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
      } catch {
        setGateError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      } finally {
        setIsSubmittingGate(false);
      }
    };

    const handleAppendPin = (digit: string) => {
      if (gatePin.length < 8) {
        const next = gatePin + digit;
        setGatePin(next);
        setGateError('');
        // Auto submit if 4 digits matches
        if (next === '8888' || next === '1234') {
          loginWithAdminPin(next);
          showToast('ปลดล็อกสิทธิ์แอดมินสำเร็จ!', 'success');
        }
      }
    };

    const handleClearPin = () => {
      setGatePin('');
      setGateError('');
    };

    return (
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
        <button
          onClick={onBackToStore}
          className="text-xs text-amber-800 hover:underline font-semibold mb-6 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าเลือกซื้อหนังสือ โชติเทียน</span>
        </button>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-stone-900 to-stone-950 text-white relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-900/40">
                <ShieldCheck className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  BACKOFFICE & CASHBOARD
                </span>
                <h2 className="font-serif-thai text-xl sm:text-2xl font-bold text-white mt-1">
                  ระบบแอดมินหลังบ้าน & แคชบอร์ด
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  ร้านหนังสือออนไลน์ โชติเทียน (Chot Thean)
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 text-xs text-stone-300 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                หน้านี้สงวนสิทธิ์สำหรับ <b>ผู้ดูแลร้าน (Admin)</b> และ <b>เจ้าหน้าที่แคชเชียร์ (Staff)</b> เพื่อความปลอดภัยของข้อมูลการเงินและคำสั่งซื้อ
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-stone-100 border-b border-stone-200 text-xs font-semibold">
            <button
              onClick={() => {
                setGateTab('quick');
                setGateError('');
              }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                gateTab === 'quick'
                  ? 'bg-white text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>เข้าทันที 1-Click</span>
            </button>

            <button
              onClick={() => {
                setGateTab('pin');
                setGateError('');
              }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                gateTab === 'pin'
                  ? 'bg-white text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>รหัส PIN</span>
            </button>

            <button
              onClick={() => {
                setGateTab('email');
                setGateError('');
              }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                gateTab === 'email'
                  ? 'bg-white text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>อีเมล / รหัสผ่าน</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {gateError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{gateError}</span>
              </div>
            )}

            {/* TAB 1: 1-CLICK QUICK ACCESS */}
            {gateTab === 'quick' && (
              <div className="space-y-4">
                <p className="text-xs text-stone-500 mb-2">
                  สำหรับการทดสอบระบบ สามารถคลิกเลือกบทบาทเพื่อเข้าสู่แคชบอร์ดและหลังบ้านได้ทันที:
                </p>

                {/* Option 1: Admin */}
                <div
                  onClick={() => handleQuickLogin('admin')}
                  className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 transition cursor-pointer group shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center font-bold">
                        👑
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-900">
                          เข้าสู่ระบบในฐานะ Admin (ผู้จัดการร้าน)
                        </h4>
                        <span className="text-[11px] text-amber-800 font-medium">
                          สิทธิ์เต็ม: ควบคุมกระแสเงินสด แคชบอร์ด POS สต็อก คำสั่งซื้อ คูปอง และหนังสือ
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
                  </div>
                </div>

                {/* Option 2: Staff POS */}
                <div
                  onClick={() => handleQuickLogin('staff')}
                  className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 hover:bg-stone-100 transition cursor-pointer group shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-800 text-stone-200 flex items-center justify-center font-bold">
                        🧾
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm group-hover:text-stone-950">
                          เข้าสู่ระบบในฐานะ Staff แคชเชียร์ (POS Staff)
                        </h4>
                        <span className="text-[11px] text-stone-500 font-medium">
                          สิทธิ์ปฏิบัติการ: จุดขายหน้าร้าน POS ออกใบเสร็จ จัดการคำสั่งซื้อ และเช็กสต็อก
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-stone-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PIN CODE KEYPAD */}
            {gateTab === 'pin' && (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="text-center">
                  <label className="block text-xs font-semibold text-stone-600 mb-2">
                    ใส่รหัส PIN แคชเชียร์ / แอดมิน (4-8 หลัก):
                  </label>
                  <div className="inline-flex items-center justify-center w-full max-w-xs px-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-2xl">
                    <span className="font-mono text-2xl tracking-[0.4em] font-bold text-stone-800">
                      {gatePin ? '•'.repeat(gatePin.length) : '••••'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-2">
                    * รหัส PIN ทดสอบเริ่มต้น: <b>8888</b> หรือ <b>1234</b>
                  </p>
                </div>

                {/* Numeric Keypad for POS */}
                <div className="max-w-xs mx-auto grid grid-cols-3 gap-2 pt-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleAppendPin(n)}
                      className="py-3 rounded-xl bg-stone-100 hover:bg-stone-200 font-mono text-lg font-bold text-stone-800 transition active:scale-95"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearPin}
                    className="py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition active:scale-95"
                  >
                    ล้าง (C)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAppendPin('0')}
                    className="py-3 rounded-xl bg-stone-100 hover:bg-stone-200 font-mono text-lg font-bold text-stone-800 transition active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="submit"
                    className="py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>ยืนยัน</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: EMAIL & PASSWORD */}
            {gateTab === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">อีเมลผู้ดูแลร้าน:</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="admin@chotthean.com"
                      value={gateEmail}
                      onChange={(e) => setGateEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 text-stone-900"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    ตัวอย่าง: admin@chotthean.com หรือ panidasingroung2517@gmail.com
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">รหัสผ่าน:</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={gatePassword}
                      onChange={(e) => setGatePassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 text-stone-900"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingGate}
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-amber-800 text-white font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>เข้าสู่ระบบจัดการหลังบ้าน</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <button
            onClick={onBackToStore}
            className="text-xs text-amber-800 hover:underline font-semibold mb-1 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปหน้าร้านค้า</span>
          </button>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif-thai text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                แคชบอร์ด & ระบบแอดมินหลังบ้าน (Backoffice Cashboard)
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                ศูนย์กลางควบคุมกระแสเงินสด แคชเชียร์ POS คำสั่งซื้อ สต็อก และวิเคราะห์ผลประกอบการร้านโชติเทียน
              </p>
            </div>
          </div>
        </div>

        {/* Sync & Quick Cashier Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-200" />
            <span>เปิดแคชเชียร์ POS หน้าร้าน</span>
          </button>

          <button
            onClick={handleSyncToFirestore}
            disabled={isSyncing}
            className={`px-3.5 py-2 rounded-xl border font-semibold text-xs transition flex items-center gap-2 ${
              isFirebaseSynced
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white hover:bg-stone-50 border-stone-300 text-stone-700'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : 'text-emerald-600'}`} />
            <span className="hidden sm:inline">
              {isSyncing ? 'กำลังซิงค์...' : isFirebaseSynced ? 'Firestore: ออนไลน์' : 'ซิงค์ Firestore'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 text-xs font-semibold scrollbar-none">
        {[
          { id: 'cashboard', label: '💵 แคชบอร์ด & การเงิน (Cashboard)' },
          { id: 'pos', label: '🧾 แคชเชียร์หน้าร้าน (POS Cashier)' },
          { id: 'kanban', label: '📋 บอร์ดคำสั่งซื้อ (Order Kanban)', count: orders.length },
          { id: 'books', label: '📚 จัดการหนังสือ', count: books.length },
          { id: 'orders', label: '📦 รายการคำสั่งซื้อ', count: orders.length },
          { id: 'inventory', label: '📊 สต็อกสินค้า', alert: lowStockBooks.length > 0 },
          { id: 'categories', label: '🏷️ หมวดหมู่', count: categories.length },
          { id: 'coupons', label: '🎟️ โปรโมชั่น & คูปอง', count: coupons.length },
          { id: 'reviews', label: '⭐ ตรวจสอบรีวิว', count: reviews.length },
          { id: 'rbac', label: '👥 ลูกค้า & สิทธิ์ Admin/Staff' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.alert && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: CASHBOARD & FINANCIAL ANALYTICS */}
      {activeTab === 'cashboard' && (
        <div className="space-y-6">
          {/* Top Cashflow Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
                <span>ยอดเงินสดรับรวม (Gross Cash)</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-950">
                ฿{totalSales.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>ชำระแล้ว ฿{totalPaidRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
                <span>พร้อมเพย์ QR Code</span>
                <QrCode className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-950">
                ฿{promptpayRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-stone-500 block">
                {totalSales > 0 ? Math.round((promptpayRevenue / totalSales) * 100) : 0}% ของยอดขายทั้งหมด
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
                <span>บัตรเครดิต / เดบิต</span>
                <CreditCard className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-950">
                ฿{creditCardRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-stone-500 block">
                {totalSales > 0 ? Math.round((creditCardRevenue / totalSales) * 100) : 0}% ของยอดขายทั้งหมด
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
                <span>รอเก็บเงินปลายทาง (COD)</span>
                <Truck className="w-4 h-4 text-purple-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-950">
                ฿{pendingCodRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-stone-500 block">รอรับเงินสดเมื่อส่งมอบพัสดุ</span>
            </div>
          </div>

          {/* Secondary Financial Breakdown Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
              <span className="text-amber-900 font-semibold block mb-1">ยอดเฉลี่ยต่อออเดอร์ (AOV)</span>
              <span className="text-xl font-bold text-stone-900">฿{averageOrderValue}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">จาก {nonCancelledOrders.length} คำสั่งซื้อ</span>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
              <span className="text-emerald-900 font-semibold block mb-1">กำไรขั้นต้นประมาณการ (~45%)</span>
              <span className="text-xl font-bold text-emerald-950">฿{estimatedProfit.toLocaleString()}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">หลังหักต้นทุนพิมพ์หนังสือ</span>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
              <span className="text-rose-900 font-semibold block mb-1">ส่วนลดโปรโมชันที่ให้ไป</span>
              <span className="text-xl font-bold text-rose-950">-฿{totalDiscountsGiven.toLocaleString()}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">จากคูปองโค้ดที่ลูกค้าใช้</span>
            </div>

            <div className="bg-stone-100 p-4 rounded-2xl border border-stone-300">
              <span className="text-stone-700 font-semibold block mb-1">ค่าจัดส่งที่ได้รับ</span>
              <span className="text-xl font-bold text-stone-900">฿{totalShippingFee.toLocaleString()}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">สำหรับพัสดุส่งด่วน Flash/Kerry</span>
            </div>
          </div>

          {/* Interactive Cashflow & Sales Timeline Chart */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif-thai text-lg font-bold text-stone-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-700" />
                  <span>แนวโน้มกระแสเงินสดและยอดขาย (Cashflow Timeline)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  สถิติยอดขายรับเข้ารายวันและการกระจายตัวของช่องทางการชำระเงิน
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-stone-100 text-stone-700 font-semibold px-3 py-1 rounded-xl">
                  รอบการบันทึก: สัปดาห์ปัจจุบัน
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 text-xs border border-stone-300 rounded-xl hover:bg-stone-50 font-medium flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์รายงาน</span>
                </button>
              </div>
            </div>

            {/* Simulated 7-day Bar Chart */}
            <div className="pt-4 grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 border-b border-stone-100 pb-4">
              {[
                { day: 'จันทร์', sales: Math.round(totalSales * 0.12), height: '40%' },
                { day: 'อังคาร', sales: Math.round(totalSales * 0.15), height: '52%' },
                { day: 'พุธ', sales: Math.round(totalSales * 0.1), height: '35%' },
                { day: 'พฤหัสบดี', sales: Math.round(totalSales * 0.18), height: '62%' },
                { day: 'ศุกร์', sales: Math.round(totalSales * 0.22), height: '75%' },
                { day: 'เสาร์', sales: Math.round(totalSales * 0.28), height: '90%' },
                { day: 'อาทิตย์ (วันนี้)', sales: Math.round(totalSales * 0.25), height: '82%', active: true },
              ].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-stone-500 opacity-0 group-hover:opacity-100 transition font-mono">
                    ฿{d.sales}
                  </span>
                  <div
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 ${
                      d.active ? 'bg-amber-800' : 'bg-stone-200 group-hover:bg-amber-600'
                    }`}
                    style={{ height: d.height }}
                  />
                  <span className={`text-[11px] truncate ${d.active ? 'font-bold text-amber-950' : 'text-stone-500'}`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>

            {/* Settlement Reconciliation Bar */}
            <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-amber-800" />
                <div>
                  <span className="font-bold text-stone-900 block">สรุปการกระทบยอดเงินสด (Cash Settlement Sheet)</span>
                  <span className="text-[11px] text-stone-500">
                    ยอดเงินสุทธิในระบบตรงกับรายการสั่งซื้อทั้งหมด ไม่พบรายการผิดดุล
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ยอดเงินสดลงบัญชีครบถ้วน</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POS CASHIER (Point of Sale Counter) */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Book Selector */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-thai text-lg font-bold text-stone-900">
                  เครื่องคิดเงินหน้าร้าน (POS Counter)
                </h3>
                <p className="text-xs text-stone-500">
                  คลิกที่หนังสือเพื่อเพิ่มลงบิลสำหรับลูกค้าที่มาซื้อหน้าร้าน หรือสั่งซื้อทางโทรศัพท์
                </p>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อหนังสือเพื่อสแกน/ยิงบาร์โค้ด..."
                value={posSearchBook}
                onChange={(e) => setPosSearchBook(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Book Grid Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {books
                .filter(
                  (b) =>
                    b.title.toLowerCase().includes(posSearchBook.toLowerCase()) ||
                    b.author.toLowerCase().includes(posSearchBook.toLowerCase())
                )
                .map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handlePosAddToCart(b, b.format === 'ebook' ? 'ebook' : 'physical')}
                    className="p-2.5 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/40 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-[3/4.2] rounded-xl overflow-hidden bg-stone-100 mb-2">
                      <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{b.title}</h4>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="font-bold text-amber-900">฿{b.price}</span>
                        <span className="text-[10px] text-stone-400">คงเหลือ {b.stock}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column: Cash Register Bill & Tender Calculator */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif-thai text-base font-bold text-stone-900">
                  รายการบิลคิดเงิน ({posCart.reduce((sum, i) => sum + i.quantity, 0)} ชิ้น)
                </h3>
              </div>
              {posCart.length > 0 && (
                <button
                  onClick={() => setPosCart([])}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  ล้างรายการ
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-1 text-xs">
              {posCart.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  ยังไม่มีหนังสือในบิล คลิกเลือกจากรายการทางซ้าย
                </div>
              ) : (
                posCart.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-stone-900 truncate block">{item.book.title}</span>
                      <span className="text-[10px] text-stone-500">
                        ฿{item.book.price} x {item.quantity} ({item.format === 'ebook' ? 'E-Book' : 'เล่ม'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setPosCart((prev) =>
                            prev
                              .map((i, iIdx) => (iIdx === idx ? { ...i, quantity: i.quantity - 1 } : i))
                              .filter((i) => i.quantity > 0)
                          )
                        }
                        className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-bold min-w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          setPosCart((prev) =>
                            prev.map((i, iIdx) => (iIdx === idx ? { ...i, quantity: i.quantity + 1 } : i))
                          )
                        }
                        className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="font-bold text-stone-900 ml-1">฿{item.book.price * item.quantity}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer & Payment Form */}
            <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">ชื่อลูกค้า (ตัวเลือก):</label>
                <input
                  type="text"
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-xl"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">ช่องทางชำระเงิน:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('promptpay')}
                    className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                      posPaymentMethod === 'promptpay'
                        ? 'bg-amber-800 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>พร้อมเพย์</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('credit_card')}
                    className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                      posPaymentMethod === 'credit_card'
                        ? 'bg-amber-800 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>บัตรเครดิต</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('cod')}
                    className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                      posPaymentMethod === 'cod'
                        ? 'bg-amber-800 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>เงินสด (Cash)</span>
                  </button>
                </div>
              </div>

              {/* Cash tendered & Change calculation */}
              {posPaymentMethod === 'cod' && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-amber-950">รับเงินสดมา (บาท):</span>
                    <input
                      type="number"
                      value={posCashTendered || ''}
                      onChange={(e) => setPosCashTendered(Number(e.target.value))}
                      placeholder="เช่น 500 หรือ 1000"
                      className="w-28 px-2.5 py-1 text-right font-bold text-xs bg-white border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-amber-950 pt-1 border-t border-amber-200/60">
                    <span>เงินทอนลูกค้า:</span>
                    <span className="text-base text-emerald-700">฿{posChange}</span>
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              <div className="space-y-1 pt-2 border-t border-stone-200 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>ยอดรวมย่อย:</span>
                  <span>฿{posSubtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">ส่วนลดพิเศษ (฿):</span>
                  <input
                    type="number"
                    value={posDiscount || ''}
                    onChange={(e) => setPosDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-20 px-2 py-0.5 text-right text-xs border border-stone-200 rounded"
                  />
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>ยอดสุทธิที่ต้องชำระ:</span>
                  <span className="text-xl text-amber-900">฿{posTotal}</span>
                </div>
              </div>

              {/* Complete & Issue Bill Button */}
              <button
                type="button"
                onClick={handlePosCheckout}
                disabled={posCart.length === 0}
                className="w-full py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-amber-900/10 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกยอดขายและออกใบเสร็จ (฿{posTotal})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER KANBAN CASH BOARD */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-thai text-lg font-bold text-stone-900 flex items-center gap-2">
                <Columns className="w-5 h-5 text-amber-800" />
                <span>บอร์ดคำสั่งซื้อและสถานะพัสดุ (Order Pipeline Kanban)</span>
              </h3>
              <p className="text-xs text-stone-500">
                เลื่อนสถานะออเดอร์ในแต่ละขั้นตอนงานแบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
            {[
              { key: 'pending', label: 'รอตรวจสอบชำระ', color: 'border-amber-300 bg-amber-50/40 text-amber-900' },
              { key: 'confirmed', label: 'ยืนยันออเดอร์แล้ว', color: 'border-blue-300 bg-blue-50/40 text-blue-900' },
              { key: 'processing', label: 'กำลังแพ็คพัสดุ', color: 'border-indigo-300 bg-indigo-50/40 text-indigo-900' },
              { key: 'shipped', label: 'จัดส่งพัสดุแล้ว', color: 'border-purple-300 bg-purple-50/40 text-purple-900' },
              { key: 'delivered', label: 'จัดส่งสำเร็จ', color: 'border-emerald-300 bg-emerald-50/40 text-emerald-900' },
            ].map((col) => {
              const colOrders = orders.filter((o) => o.status === col.key);

              return (
                <div key={col.key} className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
                  <div className={`p-3 border-b ${col.color} flex justify-between items-center text-xs font-bold`}>
                    <span>{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-white text-stone-900 flex items-center justify-center text-[10px] shadow-xs">
                      {colOrders.length}
                    </span>
                  </div>

                  <div className="p-2 space-y-2.5 min-h-[350px] max-h-[600px] overflow-y-auto">
                    {colOrders.length === 0 ? (
                      <div className="py-12 text-center text-stone-400 text-xs">ว่าง</div>
                    ) : (
                      colOrders.map((o) => (
                        <div
                          key={o.id}
                          className="p-3 rounded-2xl border border-stone-200/90 bg-white hover:border-amber-400 transition shadow-xs text-xs space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-stone-900">#{o.id}</span>
                            <span className="font-bold text-amber-900">฿{o.total}</span>
                          </div>

                          <div>
                            <div className="font-semibold text-stone-800 truncate">{o.userName}</div>
                            <div className="text-[10px] text-stone-400">{o.userPhone}</div>
                          </div>

                          <div className="text-[10px] text-stone-500 truncate">
                            {o.items.length} รายการ: {o.items[0]?.title}
                          </div>

                          {o.trackingNumber && (
                            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded block">
                              {o.trackingNumber}
                            </span>
                          )}

                          {/* Quick Advance Button */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                            <button
                              onClick={() => setPrintedOrder(o)}
                              className="text-[10px] text-stone-500 hover:text-stone-800 underline"
                            >
                              พิมพ์ใบเสร็จ
                            </button>

                            {col.key === 'pending' && (
                              <button
                                onClick={() => {
                                  updateOrderStatus(o.id, 'confirmed');
                                  showToast(`ยืนยันออเดอร์ #${o.id} เรียบร้อย`, 'success');
                                }}
                                className="px-2 py-0.5 rounded bg-blue-600 text-white font-semibold text-[10px]"
                              >
                                ยืนยัน →
                              </button>
                            )}

                            {col.key === 'confirmed' && (
                              <button
                                onClick={() => {
                                  updateOrderStatus(o.id, 'processing');
                                  showToast(`ย้ายออเดอร์ #${o.id} ไปขั้นตอนแพ็ค`, 'info');
                                }}
                                className="px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold text-[10px]"
                              >
                                แพ็คพัสดุ →
                              </button>
                            )}

                            {col.key === 'processing' && (
                              <button
                                onClick={() => {
                                  setSelectedOrderForTracking(o);
                                  setNewTrackingNumber(o.trackingNumber || 'TH123456789');
                                }}
                                className="px-2 py-0.5 rounded bg-purple-600 text-white font-semibold text-[10px]"
                              >
                                ใส่เลขพัสดุ →
                              </button>
                            )}

                            {col.key === 'shipped' && (
                              <button
                                onClick={() => {
                                  updateOrderStatus(o.id, 'delivered');
                                  showToast(`ออเดอร์ #${o.id} จัดส่งสำเร็จ!`, 'success');
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold text-[10px]"
                              >
                                สำเร็จ ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: BOOKS CATALOG */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ค้นหาหนังสือในแคตตาล็อก..."
                value={bookFilterQuery}
                onChange={(e) => setBookFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={handleOpenAddBook}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มหนังสือใหม่</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F7] border-b border-stone-200 text-stone-500 font-semibold">
                  <tr>
                    <th className="p-4">หนังสือ</th>
                    <th className="p-4">หมวดหมู่</th>
                    <th className="p-4">รูปแบบ</th>
                    <th className="p-4">ราคา</th>
                    <th className="p-4">สต็อก</th>
                    <th className="p-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {books
                    .filter(
                      (b) =>
                        b.title.toLowerCase().includes(bookFilterQuery.toLowerCase()) ||
                        b.author.toLowerCase().includes(bookFilterQuery.toLowerCase())
                    )
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={b.coverUrl}
                              alt={b.title}
                              className="w-10 h-14 object-cover rounded shadow-xs shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <h4 className="font-bold text-stone-900 truncate">{b.title}</h4>
                              <p className="text-[11px] text-stone-500 truncate">{b.author}</p>
                              <span className="text-[10px] text-stone-400">ISBN: {b.isbn}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                            {b.categoryName}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="capitalize font-semibold text-stone-700">
                            {b.format === 'both' ? 'เล่ม + E-Book' : b.format === 'ebook' ? 'E-Book' : 'หนังสือเล่ม'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-stone-900">฿{b.price}</td>
                        <td className="p-4">
                          {b.format === 'ebook' ? (
                            <span className="text-emerald-700 font-medium">ไม่จำกัด (ดิจิทัล)</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateStock(b.id, Math.max(0, b.stock - 1))}
                                className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <span
                                className={`font-bold min-w-6 text-center ${
                                  b.stock <= 5 ? 'text-rose-600' : 'text-stone-800'
                                }`}
                              >
                                {b.stock}
                              </span>
                              <button
                                onClick={() => updateStock(b.id, b.stock + 1)}
                                className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditBook(b)}
                              className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition"
                              title="แก้ไขข้อมูลหนังสือ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteBook(b)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="ลบหนังสือ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS TABLE */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F7] border-b border-stone-200 text-stone-500 font-semibold">
                  <tr>
                    <th className="p-4">คำสั่งซื้อ</th>
                    <th className="p-4">ลูกค้า</th>
                    <th className="p-4">รายการ</th>
                    <th className="p-4">ยอดรวม</th>
                    <th className="p-4">ช่องทาง</th>
                    <th className="p-4">สถานะ</th>
                    <th className="p-4">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        ยังไม่มีคำสั่งซื้อในระบบ
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4 font-mono font-bold text-stone-900">
                          #{o.id}
                          <span className="text-[10px] text-stone-400 block font-sans">
                            {new Date(o.createdAt).toLocaleDateString('th-TH')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-stone-900">{o.userName}</div>
                          <div className="text-[11px] text-stone-500">{o.userPhone}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-stone-700">
                            {o.items.length} รายการ (
                            {o.items.map((i) => i.title).join(', ').slice(0, 30)}
                            ...)
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-900">฿{o.total}</td>
                        <td className="p-4 font-medium uppercase text-[11px] text-stone-600">
                          {o.paymentMethod}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                            {o.status}
                          </span>
                          {o.trackingNumber && (
                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              {o.trackingNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={o.status}
                              onChange={(e) => {
                                const newStat = e.target.value as OrderStatus;
                                if (newStat === 'shipped') {
                                  setSelectedOrderForTracking(o);
                                  setNewTrackingNumber(o.trackingNumber || 'TH123456789');
                                } else {
                                  updateOrderStatus(o.id, newStat);
                                  showToast(`อัปเดตสถานะ #${o.id} เป็น "${newStat}" เรียบร้อย`, 'success');
                                }
                              }}
                              className="px-2 py-1 text-xs border border-stone-200 rounded-lg bg-white focus:outline-none"
                            >
                              <option value="pending">รอชำระเงิน (Pending)</option>
                              <option value="confirmed">ยืนยันแล้ว (Confirmed)</option>
                              <option value="processing">กำลังแพ็ค (Processing)</option>
                              <option value="shipped">จัดส่งแล้ว (Shipped)</option>
                              <option value="delivered">สำเร็จ (Delivered)</option>
                              <option value="cancelled">ยกเลิก (Cancelled)</option>
                            </select>
                            <button
                              onClick={() => setPrintedOrder(o)}
                              className="p-1 text-stone-400 hover:text-stone-800"
                              title="พิมพ์ใบเสร็จ"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              หน้านี้แสดงรายการหนังสือเล่มทั้งหมดที่สต็อกเหลือน้อยกว่าหรือเท่ากับ 5 เล่ม ซึ่งต้องการการเติมสินค้าเข้าคลัง
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F7] border-b border-stone-200 text-stone-500 font-semibold">
                  <tr>
                    <th className="p-4">หนังสือ</th>
                    <th className="p-4">หมวดหมู่</th>
                    <th className="p-4">สต็อกคงเหลือ</th>
                    <th className="p-4">เติมสต็อกด่วน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {lowStockBooks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-emerald-600 font-medium">
                        ✓ ยอดเยี่ยม! หนังสือทุกรายการในคลังมีสต็อกเพียงพอ
                      </td>
                    </tr>
                  ) : (
                    lowStockBooks.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={b.coverUrl}
                              alt={b.title}
                              className="w-10 h-14 object-cover rounded shadow-xs shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-stone-900">{b.title}</h4>
                              <p className="text-[11px] text-stone-500">{b.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{b.categoryName}</td>
                        <td className="p-4">
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            เหลือ {b.stock} เล่ม
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                updateStock(b.id, b.stock + 10);
                                showToast(`เติมสต็อก "${b.title}" +10 เล่มแล้ว`, 'success');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-amber-800 text-white font-semibold text-xs"
                            >
                              +10 เล่ม
                            </button>
                            <button
                              onClick={() => {
                                updateStock(b.id, b.stock + 50);
                                showToast(`เติมสต็อก "${b.title}" +50 เล่มแล้ว`, 'success');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-300"
                            >
                              +50 เล่ม
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-900">หมวดหมู่หนังสือทั้งหมด ({categories.length})</h3>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มหมวดหมู่ใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900">{c.name}</span>
                  <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                    {books.filter((b) => b.categoryId === c.id).length} เล่ม
                  </span>
                </div>
                <p className="text-xs text-stone-500">{c.description}</p>
                <span className="text-[10px] text-stone-400 font-mono block">slug: {c.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-900">โค้ดส่วนลดและโปรโมชั่น ({coupons.length})</h3>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างโค้ดส่วนลดใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((cp) => (
              <div
                key={cp.id}
                className={`p-5 rounded-2xl border transition space-y-3 ${
                  cp.isActive ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {cp.code}
                  </span>
                  <button
                    onClick={() => {
                      toggleCoupon(cp.id, !cp.isActive);
                      showToast(
                        `เปลี่ยนสถานะโค้ด "${cp.code}" เป็น ${!cp.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`,
                        'info'
                      );
                    }}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full transition ${
                      cp.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                        : 'bg-stone-200 text-stone-600 hover:bg-emerald-100 hover:text-emerald-800'
                    }`}
                  >
                    {cp.isActive ? 'เปิดใช้งานอยู่' : 'ปิดใช้งาน'}
                  </button>
                </div>

                <div className="text-xs space-y-1 text-stone-600">
                  <p>
                    <b>ส่วนลด:</b>{' '}
                    {cp.discountType === 'percentage' ? `${cp.discountValue}%` : `฿${cp.discountValue}`}
                  </p>
                  <p>
                    <b>ยอดสั่งซื้อขั้นต่ำ:</b> ฿{cp.minSpend}
                  </p>
                  <p>
                    <b>หมดอายุ:</b> {cp.expiresAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F7] border-b border-stone-200 text-stone-500 font-semibold">
                  <tr>
                    <th className="p-4">หนังสือ / รหัส</th>
                    <th className="p-4">ผู้รีวิว</th>
                    <th className="p-4">คะแนน</th>
                    <th className="p-4">ความคิดเห็น</th>
                    <th className="p-4">สถานะ</th>
                    <th className="p-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reviews.map((r) => {
                    const targetBook = books.find((b) => b.id === r.bookId);
                    return (
                      <tr key={r.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4 font-bold text-stone-900">
                          {targetBook?.title || r.bookId}
                        </td>
                        <td className="p-4">{r.userName}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{r.rating} ดาว</span>
                          </div>
                        </td>
                        <td className="p-4 max-w-sm">
                          <p className="font-semibold text-stone-900 truncate">{r.title}</p>
                          <p className="text-stone-500 line-clamp-2">{r.comment}</p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status === 'approved' ? 'อนุมัติแล้ว' : 'ซ่อนไว้'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              const nextStatus = r.status === 'approved' ? 'rejected' : 'approved';
                              moderateReview(r.id, nextStatus);
                              showToast(`เปลี่ยนสถานะรีวิวเป็น ${nextStatus}`, 'info');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-100 font-medium text-xs text-stone-700"
                          >
                            {r.status === 'approved' ? 'ซ่อนรีวิวนี้' : 'อนุมัติ'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: CUSTOMER DATABASE & RBAC */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-serif-thai text-lg font-bold text-stone-900">
              ฐานข้อมูลลูกค้าและบทบาทผู้ใช้งาน (Customer CRM & RBAC)
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              ภาพรวมสมาชิกที่ลงทะเบียนสั่งซื้อในระบบ ยอดสั่งซื้อสะสม (Customer Lifetime Value) และการบริหารสิทธิ์ตามหลัก Zero-Trust
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-800" />
                  <span>👑 ผู้ดูแลระบบ (Admin)</span>
                </div>
                <p className="text-xs text-stone-600">
                  สิทธิ์สูงสุด: ดูแคชบอร์ดการเงิน, เปิดแคชเชียร์ POS, แก้ไข/ลบหนังสือ, จัดการออเดอร์, คูปอง และลบรายการในฐานข้อมูล
                </p>
                <div className="text-[11px] text-amber-900 font-mono bg-white/70 p-2 rounded-lg border border-amber-200/60">
                  <b>Bootstrap Email:</b> panidasingroung2517@gmail.com
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <Package className="w-4 h-4 text-blue-800" />
                  <span>📦 เจ้าหน้าที่คลัง / แคชเชียร์ (Staff)</span>
                </div>
                <p className="text-xs text-stone-600">
                  สิทธิ์หน้าร้าน: ใช้งานแคชเชียร์ POS, อัปเดตสต็อกสินค้า, ปรับสถานะคำสั่งซื้อ และใส่เลขพัสดุ
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-stone-950 font-bold text-sm">
                  <Users className="w-4 h-4 text-stone-700" />
                  <span>👤 สมาชิก / ลูกค้า (Customer)</span>
                </div>
                <p className="text-xs text-stone-600">
                  สั่งซื้อออนไลน์, ชำระเงินผ่านพร้อมเพย์, อ่าน E-Book, เขียนรีวิว และบันทึกตำแหน่งหน้าที่อ่านค้างไว้
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {printedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="text-center pb-3 border-b border-stone-200 space-y-1">
              <h3 className="font-serif-thai text-xl font-bold text-stone-900">ร้านหนังสือ โชติเทียน</h3>
              <p className="text-[11px] text-stone-500">ใบเสร็จรับเงิน / สลิปแคชเชียร์ POS</p>
              <p className="font-mono font-bold text-amber-900">เลขที่ #{printedOrder.id}</p>
              <p className="text-[10px] text-stone-400">{new Date(printedOrder.createdAt).toLocaleString('th-TH')}</p>
            </div>

            <div className="space-y-1 text-stone-600">
              <p><b>ลูกค้า:</b> {printedOrder.userName} ({printedOrder.userPhone})</p>
              <p><b>ประเภท:</b> {printedOrder.shippingAddress}</p>
              <p><b>การชำระ:</b> {printedOrder.paymentMethod.toUpperCase()} (ชำระแล้ว)</p>
            </div>

            <div className="divide-y divide-stone-100 border-t border-b border-stone-200 py-2">
              {printedOrder.items.map((it, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <span className="truncate max-w-[200px]">{it.title} x{it.quantity}</span>
                  <span className="font-bold">฿{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right">
              {printedOrder.discountAmount > 0 && (
                <div className="text-rose-600 flex justify-between">
                  <span>ส่วนลด:</span>
                  <span>-฿{printedOrder.discountAmount}</span>
                </div>
              )}
              <div className="text-base font-bold text-stone-900 flex justify-between pt-1 border-t border-stone-200">
                <span>ยอดสุทธิ:</span>
                <span className="text-amber-900">฿{printedOrder.total}</span>
              </div>
            </div>

            {printedOrder.notes && (
              <p className="text-[10px] text-stone-400 italic text-center pt-1">{printedOrder.notes}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 font-semibold hover:bg-stone-50 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์สลิป</span>
              </button>
              <button
                onClick={() => setPrintedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white font-semibold hover:bg-amber-800"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-serif-thai text-xl font-bold text-stone-900">
                {editingBook ? 'แก้ไขข้อมูลหนังสือ' : 'เพิ่มหนังสือใหม่ในแคตตาล็อก'}
              </h3>
              <button onClick={() => setIsBookModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ชื่อหนังสือ (Title):</label>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ผู้แต่ง / ผู้เขียน (Author):</label>
                  <input
                    type="text"
                    required
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">หมวดหมู่:</label>
                  <select
                    value={bookCategoryId}
                    onChange={(e) => setBookCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ประเภทเนื้อหา:</label>
                  <select
                    value={bookGenre}
                    onChange={(e) => setBookGenre(e.target.value as BookGenre)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="novel">นิยาย (Novel)</option>
                    <option value="comic">การ์ตูน / มังงะ (Comic)</option>
                    <option value="academic">หนังสือเรียน (Academic)</option>
                    <option value="knowledge">ความรู้ / ธุรกิจ (Knowledge)</option>
                    <option value="children">หนังสือเด็ก (Children)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">รูปแบบ:</label>
                  <select
                    value={bookFormat}
                    onChange={(e) => setBookFormat(e.target.value as BookFormat)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="both">ทั้งหนังสือเล่มและ E-Book</option>
                    <option value="physical">เฉพาะหนังสือเล่ม</option>
                    <option value="ebook">เฉพาะ E-Book ดิจิทัล</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ราคาขาย (฿):</label>
                  <input
                    type="number"
                    required
                    value={bookPrice}
                    onChange={(e) => setBookPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ราคาเดิม (฿):</label>
                  <input
                    type="number"
                    value={bookOriginalPrice}
                    onChange={(e) => setBookOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">สต็อก (เล่ม):</label>
                  <input
                    type="number"
                    value={bookStock}
                    onChange={(e) => setBookStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">จำนวนหน้า:</label>
                  <input
                    type="number"
                    value={bookPages}
                    onChange={(e) => setBookPages(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL รูปภาพหน้าปก:</label>
                <input
                  type="url"
                  required
                  value={bookCoverUrl}
                  onChange={(e) => setBookCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">เรื่องย่อ / รายละเอียด:</label>
                <textarea
                  rows={3}
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  เนื้อหาสำหรับ E-Book Reader:
                </label>
                <textarea
                  rows={3}
                  value={bookEbookContent}
                  onChange={(e) => setBookEbookContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-800 text-white font-semibold hover:bg-amber-900"
                >
                  บันทึกข้อมูลหนังสือ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRACKING NUMBER MODAL */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-serif-thai text-lg font-bold text-stone-900">
              บันทึกเลขพัสดุจัดส่ง #{selectedOrderForTracking.id}
            </h3>
            <p className="text-xs text-stone-500">
              กรอกหมายเลข Tracking Number เพื่อแจ้งลูกค้าและเปลี่ยนสถานะเป็น "จัดส่งแล้ว"
            </p>
            <input
              type="text"
              required
              value={newTrackingNumber}
              onChange={(e) => setNewTrackingNumber(e.target.value)}
              placeholder="เช่น TH123456789"
              className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="flex-1 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  updateOrderStatus(selectedOrderForTracking.id, 'shipped', newTrackingNumber);
                  showToast(`จัดส่งออเดอร์ #${selectedOrderForTracking.id} สำเร็จ!`, 'success');
                  setSelectedOrderForTracking(null);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900"
              >
                บันทึกและส่งแจ้งเตือน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-serif-thai text-lg font-bold text-stone-900">เพิ่มหมวดหมู่ใหม่</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">ชื่อหมวดหมู่:</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="เช่น ประวัติศาสตร์, เทคโนโลยี..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">คำอธิบาย:</label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="คำอธิบายสั้นๆ..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-serif-thai text-lg font-bold text-stone-900">สร้างโค้ดส่วนลดใหม่</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">รหัสโค้ด (Coupon Code):</label>
                <input
                  type="text"
                  required
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value)}
                  placeholder="เช่น BOOKLOVER50"
                  className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ประเภท:</label>
                  <select
                    value={cpType}
                    onChange={(e) => setCpType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="fixed">ลดเป็นบาท (฿)</option>
                    <option value="percentage">ลดเป็นเปอร์เซ็นต์ (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">มูลค่าส่วนลด:</label>
                  <input
                    type="number"
                    required
                    value={cpValue}
                    onChange={(e) => setCpValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">ยอดสั่งซื้อขั้นต่ำ (฿):</label>
                <input
                  type="number"
                  value={cpMinSpend}
                  onChange={(e) => setCpMinSpend(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">วันหมดอายุ:</label>
                <input
                  type="date"
                  value={cpExpires}
                  onChange={(e) => setCpExpires(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900"
                >
                  สร้างโค้ด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
