import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User,
  ShieldCheck,
  BookOpen,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Layers,
  Flame,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBooks } from '../context/BookContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenMyEbooks: () => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onSelectBook: (bookId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenWishlist,
  onOpenMyEbooks,
  onOpenOrders,
  onOpenAdmin,
  onOpenProfile,
  activeView,
  setActiveView,
  onSelectBook,
}) => {
  const {
    user,
    profile,
    role,
    isAdmin,
    isStaff,
    loginWithGoogle,
    logout,
    loginAsDemo,
    wishlist,
    setIsAuthModalOpen,
    setAuthModalTab,
  } = useAuth();
  const { totalItems } = useCart();
  const {
    books,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationAsRead,
  } = useBooks();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Live search suggestions
  const searchResults = searchQuery.trim()
    ? books
        .filter(
          (b) =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-[#1C1917] text-stone-200 text-xs py-1 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              PROMO
            </span>
            <span className="hidden sm:inline truncate">จัดส่งฟรีเมื่อช้อปครบ ฿400 | ใส่โค้ด <b>WELCOME50</b> ลดทันที 50฿</span>
            <span className="sm:hidden text-[10px] text-stone-300 truncate">ส่งฟรีครบ ฿400 | โค้ด <b>WELCOME50</b></span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Demo Quick Role Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-1 text-stone-300 hover:text-amber-300 transition text-[10px] sm:text-[11px] font-medium bg-stone-800/80 px-2 py-0.5 rounded-full border border-stone-700"
                title="สลับสิทธิ์การทดสอบ (Demo Switcher)"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">
                  {role === 'admin' ? 'บทบาท: แอดมิน (Admin)' : role === 'staff' ? 'บทบาท: เจ้าหน้าที่ (Staff)' : 'บทบาท: สมาชิก (Customer)'}
                </span>
                <span className="sm:hidden">
                  {role === 'admin' ? 'แอดมิน' : role === 'staff' ? 'Staff' : 'สมาชิก'}
                </span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 mt-1 w-56 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl py-1 z-50 text-xs text-stone-200">
                  <div className="px-3 py-1.5 text-[10px] text-stone-400 font-semibold uppercase tracking-wider border-b border-stone-800">
                    ทดสอบสลับบทบาทผู้ใช้
                  </div>
                  {(['admin', 'staff', 'customer'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        loginAsDemo(r);
                        setShowRoleSwitcher(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-stone-800 transition"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium capitalize text-stone-100">
                          {r === 'admin' ? '👑 Admin (ผู้ดูแลร้าน)' : r === 'staff' ? '📦 Staff (พนักงานคลัง)' : '👤 Customer (ลูกค้าทั่วไป)'}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {r === 'admin' ? 'จัดการทุกอย่าง + ระบบบัญชี' : r === 'staff' ? 'จัดการสต็อกและออเดอร์' : 'ช้อปปิ้งและอ่านอีบุ๊ก'}
                        </span>
                      </div>
                      {role === r && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-stone-500">|</span>
            <button
              onClick={onOpenMyEbooks}
              className="hover:text-amber-300 transition flex items-center gap-1 text-[11px]"
            >
              <BookOpen className="w-3 h-3" />
              <span className="hidden md:inline">ชั้นหนังสือ E-Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveView('home');
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="flex items-center gap-2 sm:gap-3 text-left group"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-900/10 group-hover:scale-105 transition duration-200 shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-thai text-lg sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition leading-tight">
                  Chot Thean
                </span>
                <span className="text-[9px] sm:text-[11px] font-medium tracking-wide text-amber-800 uppercase">
                  โชติเทียน บุ๊กสโตร์
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ค้นหาชื่อหนังสือ, ผู้เขียน, หรือคำสำคัญ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-9 py-2.5 bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-amber-600 rounded-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-150 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-stone-100 text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-3">
                  ผลการค้นหาแนะนำ ({searchResults.length})
                </div>
                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                  {searchResults.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        onSelectBook(book.id);
                        setIsSearchFocused(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-amber-50/60 transition text-left group"
                    >
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-stone-900 truncate group-hover:text-amber-800">
                          {book.title}
                        </h4>
                        <p className="text-xs text-stone-500 truncate">{book.author} · {book.categoryName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-amber-700">฿{book.price}</span>
                          {book.format === 'both' && (
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                              เล่ม + E-Book
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Admin & Cashboard shortcut (Desktop / Tablet) */}
            <button
              onClick={onOpenAdmin}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shadow-xs ${
                activeView === 'admin'
                  ? 'bg-amber-800 text-white shadow-sm ring-2 ring-amber-600/30'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80'
              }`}
              title="เปิดระบบแคชบอร์ดและแอดมินหลังบ้าน"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>แอดมิน & แคชบอร์ด</span>
            </button>

            {/* Quick Login / Register button (Desktop) */}
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition border border-stone-200/60"
              title="เข้าสู่ระบบ หรือ สมัครสมาชิก"
            >
              <User className="w-3.5 h-3.5 text-stone-600" />
              <span>เข้าสู่ระบบ</span>
            </button>

            {/* Notifications (Hidden on small mobile to prevent crowding) */}
            <div ref={notifRef} className="relative hidden sm:block">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition relative"
                aria-label="การแจ้งเตือน"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-in fade-in duration-150">
                  <div className="p-3.5 border-b border-stone-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-stone-900">การแจ้งเตือน</span>
                    <span className="text-xs text-stone-500">{unreadNotifs.length} รายการใหม่</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-stone-400">
                        ยังไม่มีการแจ้งเตือน
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => markNotificationAsRead(item.id)}
                          className={`p-3.5 hover:bg-stone-50 transition cursor-pointer text-left ${
                            !item.isRead ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-semibold text-stone-800">{item.title}</h5>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-stone-600 mt-1 line-clamp-2">{item.message}</p>
                          <span className="text-[10px] text-stone-400 mt-1.5 block">
                            {new Date(item.createdAt).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist (Hidden on small mobile) */}
            <button
              onClick={onOpenWishlist}
              className="hidden sm:flex p-2.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition relative"
              aria-label="สิ่งที่อยากได้"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-full bg-stone-900 hover:bg-amber-900 text-white transition shadow-sm relative group shrink-0"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingCart className="w-4 h-4 text-amber-300 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold hidden sm:inline">ตะกร้า</span>
              {totalItems > 0 && (
                <span className="min-w-[18px] h-4.5 sm:w-5 sm:h-5 bg-amber-500 text-stone-950 text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition"
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-600/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs ring-2 ring-amber-600/20">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-in fade-in duration-150">
                  <div className="p-4 border-b border-stone-100 bg-stone-50/60">
                    <p className="text-xs text-stone-400 font-medium">เข้าสู่ระบบในชื่อ</p>
                    <p className="text-sm font-bold text-stone-900 truncate mt-0.5">
                      {profile?.displayName || 'ผู้เยี่ยมชม'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-900">
                        {role === 'admin' ? 'ผู้ดูแลร้าน (Admin)' : role === 'staff' ? 'เจ้าหน้าที่คลัง (Staff)' : 'สมาชิกลูกค้า (Customer)'}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 text-xs">
                    {/* Always accessible Admin & Cashboard link */}
                    <button
                      onClick={() => {
                        onOpenAdmin();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 flex items-center justify-between text-amber-950 font-semibold transition mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span>ระบบหลังบ้าน & แคชบอร์ด</span>
                      </div>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                        POS
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenMyEbooks();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 flex items-center gap-2.5 text-stone-700 transition"
                    >
                      <BookOpen className="w-4 h-4 text-stone-500" />
                      <span>ชั้นหนังสือ E-Book ของฉัน</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenOrders();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 flex items-center gap-2.5 text-stone-700 transition"
                    >
                      <Layers className="w-4 h-4 text-stone-500" />
                      <span>ประวัติและสถานะคำสั่งซื้อ</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenProfile();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 flex items-center gap-2.5 text-stone-700 transition"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      <span>ข้อมูลโปรไฟล์และที่อยู่จัดส่ง</span>
                    </button>

                    <button
                      onClick={() => {
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 flex items-center gap-2.5 text-stone-700 transition border-t border-stone-100 mt-1"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>เข้าสู่ระบบ / สลับบัญชี</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-stone-100">
                    {!user ? (
                      <button
                        onClick={() => {
                          loginWithGoogle().catch(() => {});
                          setShowUserMenu(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-amber-800 transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>เข้าสู่ระบบด้วย Google</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-medium transition flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 md:hidden hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ค้นหาชื่อหนังสือ, ผู้เขียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-stone-100 border border-stone-200 rounded-full text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="hidden md:flex items-center gap-2 py-2 overflow-x-auto border-t border-stone-100 text-xs font-medium text-stone-600 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full transition shrink-0 ${
              selectedCategory === null
                ? 'bg-amber-800 text-white font-semibold shadow-xs'
                : 'bg-stone-100/70 hover:bg-stone-200 text-stone-700'
            }`}
          >
            หนังสือทั้งหมด
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-amber-800 text-white font-semibold shadow-xs'
                  : 'bg-stone-100/70 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            หมวดหมู่หนังสือ
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg text-xs font-medium text-left ${
                selectedCategory === null ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-stone-50'
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-xs font-medium text-left truncate ${
                  selectedCategory === cat.id ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-1.5 text-xs">
            {/* Always accessible Admin & Cashboard button */}
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl bg-amber-800 text-white font-semibold flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span>ระบบหลังบ้าน & แคชบอร์ด (Admin & POS)</span>
              </div>
              <span className="text-[10px] bg-amber-900 text-amber-100 px-2 py-0.5 rounded-full">
                แอดมิน
              </span>
            </button>

            {/* Login / Register button */}
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold flex items-center gap-2"
            >
              <User className="w-4 h-4 text-stone-600" />
              <span>เข้าสู่ระบบ / สมัครสมาชิก / สลับบัญชี</span>
            </button>

            <button
              onClick={() => {
                onOpenMyEbooks();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg hover:bg-stone-50 flex items-center gap-2 text-stone-700"
            >
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>ชั้นหนังสือ E-Book ของฉัน</span>
            </button>
            <button
              onClick={() => {
                onOpenOrders();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg hover:bg-stone-50 flex items-center gap-2 text-stone-700"
            >
              <Layers className="w-4 h-4 text-stone-500" />
              <span>ประวัติและสถานะคำสั่งซื้อ</span>
            </button>

            {profile && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 mt-1 border-t border-stone-100"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
