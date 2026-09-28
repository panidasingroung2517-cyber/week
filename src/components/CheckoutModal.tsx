import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBooks } from '../context/BookContext';
import { PaymentMethod, Order } from '../types';
import { useToast } from './Toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrder: (orderId: string) => void;
  onOpenMyEbooks: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onViewOrder,
  onOpenMyEbooks,
}) => {
  const { profile, addPurchasedEbooks } = useAuth();
  const { cartItems, subtotal, shippingFee, discountAmount, finalTotal, appliedCoupon, clearCart } =
    useCart();
  const { createOrder } = useBooks();
  const { showToast } = useToast();

  const [name, setName] = useState(profile?.displayName || 'คุณสมชาย ใจดี');
  const [phone, setPhone] = useState(profile?.phone || '081-234-5678');
  const [address, setAddress] = useState(
    profile?.address || '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110'
  );
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedPromptPay, setCopiedPromptPay] = useState(false);

  if (!isOpen) return null;

  const hasPhysicalBooks = cartItems.some((i) => i.format === 'physical');
  const hasEbooks = cartItems.some((i) => i.format === 'ebook');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || (hasPhysicalBooks && !address.trim())) {
      showToast('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cartItems.map((item) => ({
        bookId: item.book.id,
        title: item.book.title,
        coverUrl: item.book.coverUrl,
        format: item.format,
        price: item.book.price,
        quantity: item.quantity,
      }));

      const newOrder = await createOrder({
        userId: profile?.id || 'guest-user',
        userEmail: profile?.email || 'customer@chotthean.com',
        userName: name,
        userPhone: phone,
        shippingAddress: hasPhysicalBooks ? address : 'E-Book (จัดส่งดิจิทัล)',
        items: orderItems,
        subtotal,
        discountAmount,
        couponCode: appliedCoupon?.code,
        shippingFee,
        total: finalTotal,
        status: paymentMethod === 'cod' ? 'confirmed' : 'confirmed',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        notes,
      });

      // Unlock purchased ebooks for user immediately
      const purchasedBookIds = cartItems
        .filter((i) => i.format === 'ebook')
        .map((i) => i.book.id);

      if (purchasedBookIds.length > 0) {
        await addPurchasedEbooks(purchasedBookIds);
      }

      clearCart();
      setCompletedOrder(newOrder);

      // Trigger Celebration Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      showToast('สั่งซื้อสินค้าสำเร็จ ขอบคุณที่อุดหนุนโชติเทียนครับ!', 'success');
    } catch (err) {
      console.error('Order placement error:', err);
      showToast('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPromptPay = () => {
    navigator.clipboard.writeText('0812345678');
    setCopiedPromptPay(true);
    setTimeout(() => setCopiedPromptPay(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-100">
          <h2 className="font-serif-thai text-xl font-bold text-stone-900">
            {completedOrder ? 'สั่งซื้อสินค้าสำเร็จ!' : 'ขั้นตอนการชำระเงินและจัดส่ง'}
          </h2>
          {!completedOrder && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {completedOrder ? (
            /* Success Confirmation Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  หมายเลขคำสั่งซื้อ #{completedOrder.id}
                </span>
                <h3 className="font-serif-thai text-2xl font-bold text-stone-900 mt-2">
                  ขอบคุณสำหรับคำสั่งซื้อของคุณ!
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                  ระบบได้บันทึกคำสั่งซื้อเรียบร้อยแล้ว หนังสือจะถูกจัดส่งไปยัง {completedOrder.shippingAddress}
                </p>
              </div>

              {/* Order Items Snapshot */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2 text-xs">
                <div className="font-bold text-stone-800 pb-1 border-b border-stone-200 flex justify-between">
                  <span>รายการสินค้า ({completedOrder.items.length})</span>
                  <span className="text-amber-900">ยอดรวม ฿{completedOrder.total}</span>
                </div>
                {completedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-stone-700 truncate max-w-[200px]">
                      {it.title} ({it.format === 'ebook' ? 'E-Book' : `x${it.quantity}`})
                    </span>
                    <span className="font-medium text-stone-900">฿{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
                {hasEbooks && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMyEbooks();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <BookOpen className="w-4 h-4 text-amber-200" />
                    <span>ไปที่ชั้นหนังสือ E-Book ทันที</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onViewOrder(completedOrder.id);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4 text-stone-300" />
                  <span>ติดตามสถานะพัสดุ</span>
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Recipient Details */}
              <div className="space-y-4">
                <h3 className="font-serif-thai text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                  <span>ข้อมูลผู้รับและการจัดส่ง</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      ชื่อ-นามสกุล ผู้รับ:
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      เบอร์โทรศัพท์ติดต่อ:
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                {hasPhysicalBooks && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      ที่อยู่จัดส่งพัสดุ:
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="บ้านเลขที่, ซอย, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    หมายเหตุเพิ่มเติม (ถ้ามี):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="เช่น ฝากไว้ที่ป้อมยาม, โทรแจ้งก่อนส่ง..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="font-serif-thai text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs flex items-center justify-center font-mono">
                    2
                  </span>
                  <span>เลือกช่องทางการชำระเงิน</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* PromptPay */}
                  <div
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-left ${
                      paymentMethod === 'promptpay'
                        ? 'border-amber-700 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                      <QrCode className="w-4 h-4 text-amber-700" />
                      <span>พร้อมเพย์ QR Code</span>
                    </div>
                    <p className="text-[11px] text-stone-500">สแกนจ่ายผ่านแอปธนาคารทุกแห่ง ฟรีค่าธรรมเนียม</p>
                  </div>

                  {/* Credit Card */}
                  <div
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-left ${
                      paymentMethod === 'credit_card'
                        ? 'border-amber-700 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs mb-1">
                      <CreditCard className="w-4 h-4 text-stone-700" />
                      <span>บัตรเครดิต / เดบิต</span>
                    </div>
                    <p className="text-[11px] text-stone-500">รองรับ Visa, Mastercard, JCB ระบบปลอดภัย 3D Secure</p>
                  </div>

                  {/* COD */}
                  <div
                    onClick={() => {
                      if (hasPhysicalBooks) setPaymentMethod('cod');
                      else showToast('คำสั่งซื้อที่มีเฉพาะ E-Book ไม่สามารถชำระเงินปลายทางได้', 'info');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-left ${
                      !hasPhysicalBooks
                        ? 'opacity-40 cursor-not-allowed border-stone-200'
                        : paymentMethod === 'cod'
                        ? 'border-amber-700 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs mb-1">
                      <Truck className="w-4 h-4 text-stone-700" />
                      <span>เก็บเงินปลายทาง</span>
                    </div>
                    <p className="text-[11px] text-stone-500">จ่ายเงินสดกับเจ้าหน้าที่จัดส่งพัสดุเมื่อได้รับของ</p>
                  </div>
                </div>

                {/* PromptPay QR Preview Simulator */}
                {paymentMethod === 'promptpay' && (
                  <div className="p-4 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                        Thai QR Payment / PromptPay
                      </div>
                      <p className="text-xs text-stone-300">
                        บัญชี: <b>ร้านหนังสือ โชติเทียน</b>
                      </p>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="font-mono text-xs text-amber-200 bg-stone-800 px-2 py-0.5 rounded">
                          081-234-5678
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyPromptPay}
                          className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedPromptPay ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPromptPay ? 'คัดลอกแล้ว' : 'คัดลอกเบอร์'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        * ระบบจำลองการชำระเงินอัตโนมัติ กดปุ่มยืนยันเพื่อผ่านขั้นตอนทันที
                      </p>
                    </div>

                    <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center shrink-0">
                      <QrCode className="w-20 h-20 text-stone-900" />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Final Summary */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>ส่วนลด ({appliedCoupon?.code})</span>
                    <span>-฿{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>ค่าจัดส่ง</span>
                  <span>{shippingFee === 0 ? 'ฟรี' : `฿${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <span>ยอดรวมที่ต้องชำระ</span>
                  <span className="text-lg text-amber-900">฿{finalTotal}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-amber-900/20 disabled:opacity-50"
              >
                <span>{isProcessing ? 'กำลังประมวลผลคำสั่งซื้อ...' : `ยืนยันและชำระเงิน (฿${finalTotal})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
