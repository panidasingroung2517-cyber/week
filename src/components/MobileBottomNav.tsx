import React from 'react';
import { Home, Search, ShoppingBag, BookOpen, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenMyEbooks: () => void;
  onFocusSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenCart,
  onOpenAdmin,
  onOpenMyEbooks,
  onFocusSearch,
}) => {
  const { totalItems } = useCart();
  const { role } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-lg px-2 py-1 safe-area-bottom">
      <div className="flex items-center justify-around">
        {/* 1. Home */}
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[56px] ${
            activeView === 'home'
              ? 'text-amber-800 font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${activeView === 'home' ? 'scale-110 text-amber-800' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-tight">หน้าแรก</span>
        </button>

        {/* 2. Search / Explore */}
        <button
          onClick={() => {
            if (activeView !== 'home') setActiveView('home');
            onFocusSearch();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[56px] text-stone-500 hover:text-stone-800 font-medium"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">ค้นหา</span>
        </button>

        {/* 3. Shopping Cart (with Badge) */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[56px] text-stone-500 hover:text-stone-800 font-medium relative group"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 group-active:scale-110 transition-transform" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">ตะกร้า</span>
        </button>

        {/* 4. My E-Books Shelf */}
        <button
          onClick={onOpenMyEbooks}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[56px] ${
            activeView === 'my-ebooks'
              ? 'text-amber-800 font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <BookOpen className={`w-5 h-5 transition-transform ${activeView === 'my-ebooks' ? 'scale-110 text-amber-800' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-tight">E-Book</span>
        </button>

        {/* 5. Admin Backoffice & Cashboard */}
        <button
          onClick={onOpenAdmin}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition min-w-[56px] ${
            activeView === 'admin'
              ? 'text-amber-800 font-bold'
              : 'text-stone-500 hover:text-amber-900 font-medium'
          }`}
        >
          <div className="relative">
            <ShieldCheck className={`w-5 h-5 transition-transform ${activeView === 'admin' ? 'scale-110 text-amber-700' : ''}`} />
            {role === 'admin' && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">แคชบอร์ด</span>
        </button>
      </div>
    </nav>
  );
};
