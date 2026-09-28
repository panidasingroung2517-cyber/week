import React, { useState } from 'react';
import {
  X,
  Star,
  Heart,
  ShoppingCart,
  BookOpen,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Globe,
  Share2,
  Eye,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Book, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBooks } from '../context/BookContext';
import { useToast } from './Toast';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onOpenReader: (book: Book, isSampleOnly?: boolean) => void;
  onBuyNow: (book: Book, format: 'physical' | 'ebook', quantity: number) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onOpenReader,
  onBuyNow,
}) => {
  const { wishlist, toggleWishlist, profile, purchasedEbookIds } = useAuth();
  const { addToCart } = useCart();
  const { reviews, addReview } = useBooks();
  const { showToast } = useToast();

  const [selectedFormat, setSelectedFormat] = useState<'physical' | 'ebook'>(
    book?.format === 'ebook' ? 'ebook' : 'physical'
  );
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!book) return null;

  const isWishlisted = wishlist.includes(book.id);
  const isPurchasedEbook = purchasedEbookIds.includes(book.id);
  const bookReviews = reviews.filter((r) => r.bookId === book.id && r.status === 'approved');

  const discountPercent =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart(book, selectedFormat, quantity);
    showToast(`เพิ่ม "${book.title}" (${selectedFormat === 'ebook' ? 'E-Book' : 'หนังสือเล่ม'}) ลงในตะกร้าแล้ว`, 'success');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      showToast('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว', 'error');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('กรุณากรอกหัวข้อและความคิดเห็นให้ครบถ้วน', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReview({
        bookId: book.id,
        userId: profile.id,
        userName: profile.displayName || 'ผู้อ่าน',
        userAvatar: profile.photoURL,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        isVerifiedPurchase: isPurchasedEbook || true,
      });
      showToast('ส่งความคิดเห็นและให้คะแนนเรียบร้อยแล้ว ขอบคุณสำหรับรีวิวครับ!', 'success');
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
    } catch {
      showToast('เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with Close */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
              {book.categoryName}
            </span>
            <span className="text-xs text-stone-400">ISBN: {book.isbn}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleWishlist(book.id);
                showToast(isWishlisted ? 'นำออกจากสิ่งที่อยากได้แล้ว' : 'บันทึกลงในสิ่งที่อยากได้แล้ว', 'info');
              }}
              className={`p-2 rounded-full transition ${
                isWishlisted ? 'bg-rose-50 text-rose-600' : 'hover:bg-stone-100 text-stone-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Book Cover & Quick Reader Action */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[280px] aspect-[3/4.2] rounded-2xl overflow-hidden shadow-2xl border border-stone-200 bg-stone-100">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none" />
                {discountPercent && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
                    ลด {discountPercent}%
                  </span>
                )}
              </div>

              {/* Sample Reading & E-Book Button */}
              <div className="w-full max-w-[280px] mt-4 flex flex-col gap-2">
                <button
                  onClick={() => onOpenReader(book, !isPurchasedEbook)}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-800 text-amber-900 bg-amber-50 hover:bg-amber-100 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Eye className="w-4 h-4 text-amber-700" />
                  <span>{isPurchasedEbook ? 'เปิดอ่าน E-Book ฉบับเต็ม' : 'ทดลองอ่านตัวอย่างฟรี (Sample)'}</span>
                </button>
              </div>
            </div>

            {/* Book Details */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h1 className="font-serif-thai text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {book.title}
                </h1>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-600 mt-2">
                  <span className="font-semibold text-stone-800">ผู้เขียน: {book.author}</span>
                  {book.translator && <span>| แปล: {book.translator}</span>}
                  <span>| สำนักพิมพ์: {book.publisher}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(book.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-stone-800">{book.rating.toFixed(1)} / 5</span>
                <span className="text-xs text-stone-400">({book.reviewCount} รีวิวจากผู้อ่านจริง)</span>
              </div>

              {/* Price */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-stone-900">
                    ฿{book.price}
                  </span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <span className="text-sm text-stone-400 line-through">
                      ฿{book.originalPrice}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      ประหยัด ฿{book.originalPrice! - book.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Format Selection */}
              {book.format === 'both' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    เลือกรูปแบบหนังสือ
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('physical')}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        selectedFormat === 'physical'
                          ? 'border-amber-700 bg-amber-50/80 text-amber-950 font-semibold ring-2 ring-amber-500/20'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-amber-800" />
                        <div>
                          <div className="text-xs font-bold">หนังสือเล่ม (รูปเล่ม)</div>
                          <div className="text-[11px] text-stone-500">
                            {book.stock > 0 ? `สต็อก ${book.stock} เล่ม` : 'สินค้าหมด'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold">฿{book.price}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat('ebook')}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        selectedFormat === 'ebook'
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-semibold ring-2 ring-emerald-500/20'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="text-xs font-bold">E-Book (ไฟล์ดิจิทัล)</div>
                          <div className="text-[11px] text-stone-500">อ่านได้ทันทีหลังชำระเงิน</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold">฿{book.price}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="space-y-3 pt-2">
                {selectedFormat === 'physical' && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-600">จำนวน:</span>
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-100 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold min-w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(book.stock || 1, quantity + 1))}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-stone-400">
                      (พร้อมจัดส่งทันที)
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={selectedFormat === 'physical' && book.stock <= 0}
                    className="py-3 px-4 rounded-xl border border-stone-800 text-stone-900 font-semibold text-xs hover:bg-stone-100 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-700" />
                    <span>เพิ่มลงในตะกร้า</span>
                  </button>

                  <button
                    onClick={() => {
                      onBuyNow(book, selectedFormat, quantity);
                      onClose();
                    }}
                    disabled={selectedFormat === 'physical' && book.stock <= 0}
                    className="py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-amber-900/10 disabled:opacity-50"
                  >
                    <span>สั่งซื้อทันที</span>
                  </button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-3 text-xs text-stone-500 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-stone-400" />
                  <span>จัดส่งฟรีเมื่อช้อปครบ ฿400</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-stone-400" />
                  <span>รับประกันหนังสือแท้ 100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Book Synopsis & Specifications */}
          <div className="pt-6 border-t border-stone-200">
            <h2 className="font-serif-thai text-lg font-bold text-stone-900 mb-3">
              เรื่องย่อ / รายละเอียดหนังสือ
            </h2>
            <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-[#FCFBF9] p-5 rounded-2xl border border-stone-200/60">
              {book.description}
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block mb-1">จำนวนหน้า</span>
                <span className="font-bold text-stone-800">{book.pages} หน้า</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block mb-1">ภาษา</span>
                <span className="font-bold text-stone-800">{book.language}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block mb-1">ปีที่พิมพ์</span>
                <span className="font-bold text-stone-800">ค.ศ. {book.publishedYear}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block mb-1">หมวดหมู่</span>
                <span className="font-bold text-stone-800">{book.categoryName}</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif-thai text-lg font-bold text-stone-900">
                  รีวิวและความคิดเห็นจากผู้อ่าน ({bookReviews.length})
                </h2>
                <p className="text-xs text-stone-500">แบ่งปันความรู้สึกของคุณหลังจากอ่านเล่มนี้</p>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{showReviewForm ? 'ปิดแบบฟอร์ม' : 'เขียนรีวิว'}</span>
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="mb-6 p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  เขียนรีวิวสำหรับ "{book.title}"
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    คะแนนความพึงพอใจ:
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-amber-800">
                      {reviewRating} จาก 5 ดาว
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    หัวข้อรีวิว:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="สรุปความประทับใจสั้นๆ เช่น เนื้อเรื่องสนุกมาก อ่านวางไม่ลง..."
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ความคิดเห็นและรีวิวฉบับเต็ม:
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="เล่าความรู้สึก เนื้อหาที่ชอบ หรือข้อคิดที่ได้รับ..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-amber-800 text-white font-semibold text-xs hover:bg-amber-900 transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'กำลังส่ง...' : 'เผยแพร่รีวิว'}</span>
                </button>
              </form>
            )}

            {/* Reviews List */}
            {bookReviews.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl text-stone-400 text-xs">
                ยังไม่มีรีวิวสำหรับหนังสือเล่มนี้ เป็นคนแรกที่แบ่งปันความคิดเห็น!
              </div>
            ) : (
              <div className="space-y-3">
                {bookReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                          {rev.userName.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-stone-900">{rev.userName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ผู้ซื้อจริง</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date(rev.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>

                    <h4 className="text-xs font-bold text-stone-900">{rev.title}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
