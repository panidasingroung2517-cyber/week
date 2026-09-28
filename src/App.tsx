import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Flame,
  Filter,
  ArrowUpDown,
  Search,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Tag,
  Star,
  SlidersHorizontal,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { BookProvider, useBooks } from './context/BookContext';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { EbookReaderModal } from './components/EbookReaderModal';
import { OrdersView } from './components/OrdersView';
import { WishlistView } from './components/WishlistView';
import { MyEbooksView } from './components/MyEbooksView';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Book } from './types';

function MainStoreContent() {
  const { profile } = useAuth();
  const {
    books,
    categories,
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
    loadUserReadingProgress,
  } = useBooks();

  const { isCartOpen, setIsCartOpen, addToCart } = useCart();
  const { showToast } = useToast();

  // Load Firestore reading progress for user on start / account change
  React.useEffect(() => {
    if (profile?.id) {
      loadUserReadingProgress(profile.id);
    }
  }, [profile?.id]);

  // Navigation Views
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [selectedBookForReader, setSelectedBookForReader] = useState<Book | null>(null);
  const [isSampleReader, setIsSampleReader] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = b.title.toLowerCase().includes(q);
        const matchesAuthor = b.author.toLowerCase().includes(q);
        const matchesCat = b.categoryName.toLowerCase().includes(q);
        const matchesIsbn = b.isbn.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesCat && !matchesIsbn) return false;
      }

      // Category
      if (selectedCategory && b.categoryId !== selectedCategory) return false;

      // Genre
      if (selectedGenre && b.genre !== selectedGenre) return false;

      // Format
      if (selectedFormat === 'physical' && b.format !== 'physical' && b.format !== 'both') return false;
      if (selectedFormat === 'ebook' && b.format !== 'ebook' && b.format !== 'both') return false;

      // Price
      if (b.price < priceRange[0] || b.price > priceRange[1]) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.publishedYear || 0) - (a.publishedYear || 0);
      if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
      // Default: featured first
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [books, searchQuery, selectedCategory, selectedGenre, selectedFormat, priceRange, sortBy]);

  // Featured books (top 4)
  const featuredBooks = useMemo(() => books.filter((b) => b.isFeatured).slice(0, 4), [books]);

  // New arrivals (top 4)
  const newArrivalBooks = useMemo(() => books.filter((b) => b.isNewArrival).slice(0, 4), [books]);

  // Bestsellers (top 4)
  const bestSellerBooks = useMemo(() => books.filter((b) => b.isBestSeller).slice(0, 4), [books]);

  const handleSelectBook = (book: Book) => {
    setSelectedBookForDetail(book);
  };

  const handleSelectBookById = (bookId: string) => {
    const found = books.find((b) => b.id === bookId);
    if (found) setSelectedBookForDetail(found);
  };

  const handleOpenReader = (book: Book, isSampleOnly = false) => {
    setSelectedBookForReader(book);
    setIsSampleReader(isSampleOnly);
  };

  const handleOpenReaderById = (bookId: string) => {
    const found = books.find((b) => b.id === bookId);
    if (found) {
      setSelectedBookForReader(found);
      setIsSampleReader(false);
    }
  };

  const handleBuyNow = (book: Book, format: 'physical' | 'ebook', quantity: number) => {
    addToCart(book, format, quantity);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] pb-20 md:pb-0">
      {/* Top Navigation */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setActiveView('wishlist')}
        onOpenMyEbooks={() => setActiveView('my-ebooks')}
        onOpenOrders={() => setActiveView('orders')}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        onSelectBook={handleSelectBookById}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminDashboard
            onBackToStore={() => setActiveView('home')}
            onOpenBookDetail={handleSelectBook}
          />
        ) : activeView === 'orders' ? (
          <OrdersView
            onBackToStore={() => setActiveView('home')}
            onOpenReader={handleOpenReaderById}
            selectedOrderId={activeTrackingOrderId}
          />
        ) : activeView === 'wishlist' ? (
          <WishlistView
            onBackToStore={() => setActiveView('home')}
            onSelectBook={handleSelectBook}
          />
        ) : activeView === 'my-ebooks' ? (
          <MyEbooksView
            onBackToStore={() => setActiveView('home')}
            onOpenReader={(b) => handleOpenReader(b, false)}
          />
        ) : (
          /* HOME & BROWSE STOREFRONT */
          <div>
            {/* Hero & Promotion Banner */}
            {!selectedCategory && !searchQuery && (
              <HeroBanner
                onGenreSelect={(genre) => {
                  setSelectedGenre(genre);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                selectedGenre={selectedGenre}
              />
            )}

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 sm:space-y-12">
              {/* FEATURED BOOKS SECTION (If on root browse) */}
              {!selectedCategory && !searchQuery && !selectedGenre && (
                <section className="space-y-4 sm:space-y-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        <Flame className="w-4 h-4 text-amber-600" />
                        <span>คัดสรรพิเศษสำหรับคุณ</span>
                      </div>
                      <h2 className="font-serif-thai text-xl sm:text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                        หนังสือแนะนำประจำสัปดาห์
                      </h2>
                    </div>

                    <button
                      onClick={() => {
                        const el = document.getElementById('catalog-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-semibold text-amber-900 hover:text-amber-700 flex items-center gap-1 transition"
                    >
                      <span>ดูทั้งหมด</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                    {featuredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onSelect={handleSelectBook}
                        onOpenReader={(b) => handleOpenReader(b, true)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* NEW ARRIVALS & BESTSELLERS CAROUSEL / HIGHLIGHT (If on root browse) */}
              {!selectedCategory && !searchQuery && !selectedGenre && (
                <section className="space-y-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>อัปเดตสดใหม่</span>
                      </div>
                      <h2 className="font-serif-thai text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                        หนังสือใหม่มาแรง (New Arrivals)
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                    {newArrivalBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onSelect={handleSelectBook}
                        onOpenReader={(b) => handleOpenReader(b, true)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ALL BOOKS CATALOG SECTION */}
              <section id="catalog-section" className="space-y-6 pt-4">
                {/* Catalog Header with Filters & Sort */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div>
                    <h2 className="font-serif-thai text-2xl font-bold text-stone-900 flex items-center gap-2">
                      <span>
                        {selectedCategory
                          ? categories.find((c) => c.id === selectedCategory)?.name || 'หมวดหมู่หนังสือ'
                          : selectedGenre
                          ? `หมวด: ${selectedGenre}`
                          : 'แคตตาล็อกหนังสือทั้งหมด'}
                      </span>
                      <span className="text-xs font-sans font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                        {filteredBooks.length} เล่ม
                      </span>
                    </h2>
                    {searchQuery && (
                      <p className="text-xs text-stone-500 mt-1">
                        ผลการค้นหาสำหรับ "{searchQuery}" ·{' '}
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-amber-800 underline font-semibold"
                        >
                          ล้างคำค้นหา
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Filter Controls Bar */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Format filter: All, Physical, E-Book */}
                    <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
                      <button
                        onClick={() => setSelectedFormat('all')}
                        className={`px-3 py-1 rounded-lg font-medium transition ${
                          selectedFormat === 'all'
                            ? 'bg-amber-800 text-white font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        ทุกรูปแบบ
                      </button>
                      <button
                        onClick={() => setSelectedFormat('physical')}
                        className={`px-3 py-1 rounded-lg font-medium transition ${
                          selectedFormat === 'physical'
                            ? 'bg-amber-800 text-white font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        หนังสือเล่ม
                      </button>
                      <button
                        onClick={() => setSelectedFormat('ebook')}
                        className={`px-3 py-1 rounded-lg font-medium transition ${
                          selectedFormat === 'ebook'
                            ? 'bg-amber-800 text-white font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        E-Book
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                      <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 mr-1.5" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                      >
                        <option value="featured">แนะนำ (Featured)</option>
                        <option value="popular">คะแนนรีวิวสูงสุด</option>
                        <option value="newest">ปีที่ตีพิมพ์ล่าสุด</option>
                        <option value="price-asc">ราคา: ต่ำไปสูง</option>
                        <option value="price-desc">ราคา: สูงไปต่ำ</option>
                      </select>
                    </div>

                    {/* Reset Filters button if any active */}
                    {(selectedCategory || selectedGenre || selectedFormat !== 'all' || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setSelectedGenre(null);
                          setSelectedFormat('all');
                          setSearchQuery('');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 font-semibold transition"
                      >
                        รีเซ็ตตัวกรอง
                      </button>
                    )}
                  </div>
                </div>

                {/* Books Grid */}
                {filteredBooks.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
                    <Search className="w-12 h-12 text-stone-300 mx-auto" />
                    <h3 className="font-serif-thai text-lg font-bold text-stone-800">
                      ไม่พบหนังสือที่ตรงกับเงื่อนไขการค้นหา
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      ลองเปลี่ยนคำค้นหา ปรับช่วงราคา หรือรีเซ็ตตัวกรองหมวดหมู่ใหม่
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedGenre(null);
                        setSelectedFormat('all');
                        setSearchQuery('');
                      }}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-amber-800 text-white font-semibold text-xs hover:bg-amber-900 transition"
                    >
                      แสดงหนังสือทั้งหมด
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                    {filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onSelect={handleSelectBook}
                        onOpenReader={(b) => handleOpenReader(b, true)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      {selectedBookForDetail && (
        <BookDetailModal
          book={selectedBookForDetail}
          onClose={() => setSelectedBookForDetail(null)}
          onOpenReader={(b, isSample) => {
            setSelectedBookForDetail(null);
            handleOpenReader(b, isSample);
          }}
          onBuyNow={handleBuyNow}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onViewOrder={(orderId) => {
            setActiveTrackingOrderId(orderId);
            setActiveView('orders');
          }}
          onOpenMyEbooks={() => setActiveView('my-ebooks')}
        />
      )}

      {selectedBookForReader && (
        <EbookReaderModal
          book={selectedBookForReader}
          isOpen={selectedBookForReader !== null}
          onClose={() => setSelectedBookForReader(null)}
          isSampleOnly={isSampleReader}
        />
      )}

      {isProfileOpen && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      <AuthModal
        onSuccessAdmin={() => setActiveView('admin')}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenMyEbooks={() => setActiveView('my-ebooks')}
        onFocusSearch={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Footer */}
      <Footer
        onCategoryClick={(catId) => {
          setActiveView('home');
          setSelectedCategory(catId);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        categories={categories}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BookProvider>
          <CartProvider>
            <MainStoreContent />
          </CartProvider>
        </BookProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
