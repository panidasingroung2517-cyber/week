import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Truck, Check, Sparkles, BookOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    shippingFee,
    discountAmount,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { showToast } = useToast();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const result = applyCoupon(couponInput);
    if (result.success) {
      showToast(result.message, 'success');
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError(result.message);
      showToast(result.message, 'error');
    }
  };

  const remainingForFreeShipping = Math.max(0, 400 - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-800" />
              <h2 className="font-serif-thai text-lg font-bold text-stone-900">
                ตะกร้าสินค้า ({totalItems})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress alert */}
          <div className="bg-amber-50/70 px-5 py-2.5 border-b border-amber-200/50 flex items-center gap-2.5 text-xs">
            <Truck className="w-4 h-4 text-amber-700 shrink-0" />
            {remainingForFreeShipping === 0 ? (
              <span className="font-semibold text-emerald-800">
                🎉 ยินดีด้วย! คุณได้รับสิทธิ์จัดส่งฟรีสำหรับออเดอร์นี้
              </span>
            ) : (
              <span className="text-stone-700">
                ช้อปเพิ่มอีกเพียง <b>฿{remainingForFreeShipping}</b> เพื่อรับสิทธิ์{' '}
                <b className="text-amber-900">ส่งฟรีทั่วไทย!</b>
              </span>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif-thai text-base font-bold text-stone-800">
                  ตะกร้าของคุณยังว่างเปล่า
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  เลือกชมหนังสือแนะนำ หนังสือเรียน หรือนิยายยอดนิยม แล้วเพิ่มลงตะกร้าได้เลย
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-amber-800 transition"
                >
                  เลือกชมหนังสือ
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.book.id}-${item.format}`} className="py-4 flex gap-3.5 items-start">
                  <img
                    src={item.book.coverUrl}
                    alt={item.book.title}
                    className="w-16 h-22 object-cover rounded-xl shadow-xs border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                        {item.book.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.book.id, item.format)}
                        className="text-stone-400 hover:text-rose-600 p-1 shrink-0 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {item.format === 'ebook' ? 'E-Book ดิจิทัล' : 'หนังสือเล่ม'}
                      </span>
                      <span className="text-xs font-bold text-amber-800">฿{item.book.price}</span>
                    </div>

                    {/* Quantity controls (only for physical books) */}
                    <div className="flex items-center justify-between mt-3">
                      {item.format === 'physical' ? (
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                          <button
                            onClick={() => updateQuantity(item.book.id, item.format, item.quantity - 1)}
                            className="px-2.5 py-0.5 text-stone-600 hover:bg-stone-200 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.book.id, item.format, item.quantity + 1)}
                            className="px-2.5 py-0.5 text-stone-600 hover:bg-stone-200 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>1 สิทธิ์เข้าอ่านถาวร</span>
                        </span>
                      )}

                      <span className="text-xs font-bold text-stone-900">
                        ฿{item.book.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Coupon & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/80 space-y-4">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-800" />
                      <div>
                        <span className="font-bold text-amber-950 font-mono">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-stone-600 ml-1.5">
                          (-฿{discountAmount})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-500 hover:text-rose-600 text-xs font-medium underline"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ใส่โค้ดส่วนลด เช่น WELCOME50"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-amber-800 text-white font-semibold text-xs transition"
                    >
                      ใช้โค้ด
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span className="font-semibold text-stone-800">฿{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>ส่วนลดคูปอง</span>
                    <span className="font-semibold">-฿{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-semibold text-stone-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">ฟรี</span>
                    ) : (
                      `฿${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-950">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-lg text-amber-900">฿{finalTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-900/15 group"
              >
                <span>ดำเนินการสั่งซื้อ (฿{finalTotal})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
