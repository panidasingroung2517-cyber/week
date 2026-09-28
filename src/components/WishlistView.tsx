import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { Book } from '../types';

interface WishlistViewProps {
  onBackToStore: () => void;
  onSelectBook: (book: Book) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  onBackToStore,
  onSelectBook,
}) => {
  const { wishlist, toggleWishlist } = useAuth();
  const { books } = useBooks();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const wishlistedBooks = books.filter((b) => wishlist.includes(b.id));

  const handleAddAndNotify = (book: Book) => {
    const fmt = book.format === 'ebook' ? 'ebook' : 'physical';
    addToCart(book, fmt, 1);
    showToast(`เพิ่ม "${book.title}" ลงในตะกร้าเรียบร้อย`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-stone-200">
        <button
          onClick={onBackToStore}
          className="text-xs text-amber-800 hover:underline font-semibold mb-1 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับไปเลือกซื้อหนังสือ</span>
        </button>
        <div className="flex items-center gap-2 mt-1">
          <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
          <h1 className="font-serif-thai text-2xl sm:text-3xl font-bold text-stone-900">
            รายการหนังสือที่อยากได้ ({wishlistedBooks.length})
          </h1>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          หนังสือที่คุณบันทึกไว้สำหรับตัดสินใจซื้อในภายหลัง
        </p>
      </div>

      {/* Grid */}
      <div className="mt-8">
        {wishlistedBooks.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <Heart className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif-thai text-lg font-bold text-stone-800">
              ยังไม่มีหนังสือในรายการสิ่งที่อยากได้
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              กดไอคอนรูปหัวใจบนหน้าปกหนังสือเล่มที่คุณสนใจเพื่อบันทึกไว้ที่นี่
            </p>
            <button
              onClick={onBackToStore}
              className="mt-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-amber-800 transition"
            >
              เลือกดูหนังสือแนะนำ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistedBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => onSelectBook(book)}
              >
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-20 h-28 object-cover rounded-xl border border-stone-100 shadow-xs shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[10px] text-amber-800 font-semibold">
                      {book.categoryName}
                    </span>
                    <h4 className="font-serif-thai text-sm font-bold text-stone-900 line-clamp-2 leading-snug">
                      {book.title}
                    </h4>
                    <p className="text-xs text-stone-500 truncate">{book.author}</p>
                    <span className="text-sm font-bold text-stone-950 mt-1 block">
                      ฿{book.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddAndNotify(book);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-stone-900 hover:bg-amber-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                      <span>ใส่ตะกร้า</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(book.id);
                        showToast(`นำออกจากสิ่งที่อยากได้แล้ว`, 'info');
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition"
                      title="ลบออกจากรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
