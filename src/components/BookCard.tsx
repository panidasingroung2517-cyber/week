import React from 'react';
import { Star, Heart, ShoppingCart, BookOpen, Smartphone } from 'lucide-react';
import { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect, onOpenReader }) => {
  const { wishlist, toggleWishlist, purchasedEbookIds } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isWishlisted = wishlist.includes(book.id);
  const isPurchasedEbook = purchasedEbookIds.includes(book.id);

  const discountPercent =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Default to physical if available, else ebook
    const defaultFormat = book.format === 'ebook' ? 'ebook' : 'physical';
    addToCart(book, defaultFormat, 1);
    showToast(`เพิ่ม "${book.title}" (${defaultFormat === 'ebook' ? 'E-Book' : 'หนังสือเล่ม'}) ลงในตะกร้าแล้ว`, 'success');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(book.id);
    if (!isWishlisted) {
      showToast(`บันทึก "${book.title}" ลงในรายการสิ่งที่อยากได้แล้ว`, 'info');
    }
  };

  return (
    <div
      onClick={() => onSelect(book)}
      className="group relative bg-white rounded-2xl border border-stone-200/80 p-3.5 sm:p-4 hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Badges & Wishlist Button */}
      <div className="relative aspect-[3/4.2] w-full rounded-xl overflow-hidden bg-stone-100 shadow-inner mb-3">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Soft spine shadow simulation on the left edge */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full transition-transform active:scale-90 shadow-md ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Format Badge */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {book.format === 'both' ? (
            <span className="text-[10px] font-semibold bg-stone-900/85 backdrop-blur-xs text-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" />
              <span>เล่ม + E-Book</span>
            </span>
          ) : book.format === 'ebook' ? (
            <span className="text-[10px] font-semibold bg-emerald-900/85 backdrop-blur-xs text-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Smartphone className="w-2.5 h-2.5" />
              <span>E-Book</span>
            </span>
          ) : (
            <span className="text-[10px] font-semibold bg-indigo-900/85 backdrop-blur-xs text-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" />
              <span>หนังสือเล่ม</span>
            </span>
          )}
        </div>

        {/* Owned badge if purchased */}
        {isPurchasedEbook && (
          <div className="absolute bottom-2 right-2 bg-amber-500 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
            มีในคลัง
          </div>
        )}
      </div>

      {/* Book Information */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-medium text-amber-800 line-clamp-1">
            {book.categoryName}
          </span>
          <h3 className="font-serif-thai text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-800 transition line-clamp-2 leading-snug">
            {book.title}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{book.author}</p>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 my-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-stone-700">{book.rating.toFixed(1)}</span>
            <span className="text-[11px] text-stone-400">({book.reviewCount})</span>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold text-stone-950">
                  ฿{book.price}
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-xs text-stone-400 line-through">
                    ฿{book.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 block">
                {book.format === 'ebook'
                  ? 'ดาวน์โหลดทันที'
                  : book.stock > 0
                  ? `เหลือ ${book.stock} เล่ม`
                  : 'สินค้าหมดชั่วคราว'}
              </span>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={book.format === 'physical' && book.stock <= 0}
              className={`p-2.5 rounded-xl transition shadow-xs flex items-center justify-center ${
                book.format === 'physical' && book.stock <= 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-amber-800 text-white active:scale-95'
              }`}
              title="เพิ่มลงตะกร้าทันที"
            >
              <ShoppingCart className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
