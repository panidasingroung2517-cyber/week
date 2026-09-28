import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Printer,
  X,
  FileText,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';
import { Order, OrderStatus } from '../types';

interface OrdersViewProps {
  onBackToStore: () => void;
  onOpenReader: (bookId: string) => void;
  selectedOrderId?: string | null;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onBackToStore,
  onOpenReader,
  selectedOrderId,
}) => {
  const { profile, isAdmin, isStaff } = useAuth();
  const { orders } = useBooks();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<Order | null>(null);

  // Show user's orders (or all orders if admin viewing dashboard)
  const userOrders = isStaff
    ? orders
    : orders.filter((o) => o.userId === profile?.id || o.userEmail === profile?.email);

  const filteredOrders = userOrders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>รอตรวจสอบ</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>ยืนยันออเดอร์แล้ว</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <Package className="w-3 h-3 text-indigo-600" />
            <span>กำลังแพ็คสินค้า</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>จัดส่งแล้ว</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>จัดส่งสำเร็จ</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-full">
            <span>ยกเลิกแล้ว</span>
          </span>
        );
    }
  };

  const statusSteps = [
    { key: 'confirmed', label: 'ยืนยันคำสั่งซื้อ' },
    { key: 'processing', label: 'กำลังแพ็คพัสดุ' },
    { key: 'shipped', label: 'จัดส่งแล้ว' },
    { key: 'delivered', label: 'สำเร็จ' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <button
            onClick={onBackToStore}
            className="text-xs text-amber-800 hover:underline font-semibold mb-1 block"
          >
            ← กลับไปหน้าร้านค้า
          </button>
          <h1 className="font-serif-thai text-2xl sm:text-3xl font-bold text-stone-900">
            ประวัติและสถานะคำสั่งซื้อ
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            ติดตามสถานะการจัดส่งพัสดุและใบเสร็จคำสั่งซื้อของคุณ
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'confirmed', label: 'ยืนยันแล้ว' },
            { id: 'processing', label: 'กำลังแพ็ค' },
            { id: 'shipped', label: 'จัดส่งแล้ว' },
            { id: 'delivered', label: 'สำเร็จ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="mt-6 space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <Package className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif-thai text-lg font-bold text-stone-800">
              ไม่พบประวัติคำสั่งซื้อ
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              เมื่อคุณทำการสั่งซื้อสินค้า รายการและสถานะพัสดุจะปรากฏที่นี่
            </p>
            <button
              onClick={onBackToStore}
              className="mt-2 px-5 py-2.5 rounded-xl bg-amber-800 text-white font-semibold text-xs hover:bg-amber-900 transition"
            >
              เลือกซื้อหนังสือเลย
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition"
              >
                {/* Order Top Bar */}
                <div className="p-5 border-b border-stone-100 bg-[#FAF9F7] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      #{order.id}
                    </span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-600">
                      {new Date(order.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-stone-400">·</span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewInvoiceOrder(order)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-white text-stone-700 font-medium text-xs transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>ดูใบเสร็จ</span>
                    </button>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                {order.status !== 'cancelled' && (
                  <div className="px-6 py-4 bg-white border-b border-stone-100">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {statusSteps.map((step, idx) => {
                        const isDone = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;

                        return (
                          <div key={step.key} className="space-y-1.5">
                            <div className="relative flex items-center justify-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition ${
                                  isDone
                                    ? 'bg-amber-800 text-white'
                                    : 'bg-stone-200 text-stone-500'
                                }`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                            </div>
                            <span
                              className={`block font-medium ${
                                isCurrent
                                  ? 'text-amber-900 font-bold'
                                  : isDone
                                  ? 'text-stone-800'
                                  : 'text-stone-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {order.trackingNumber && (
                      <div className="mt-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-amber-900">
                          <Truck className="w-4 h-4 text-amber-700" />
                          <span>
                            เลขพัสดุ: <b>{order.trackingNumber}</b> (Flash Express)
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500">
                          คาดว่าจะถึงภายใน 1-2 วันทำการ
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="p-5 divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded-xl border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-stone-500">
                            {item.format === 'ebook' ? 'E-Book ดิจิทัล' : `หนังสือเล่ม x${item.quantity}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {item.format === 'ebook' && (
                          <button
                            onClick={() => onOpenReader(item.bookId)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 border border-amber-300"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                            <span>เปิดอ่าน</span>
                          </button>
                        )}
                        <span className="text-xs font-bold text-stone-900">
                          ฿{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Total */}
                <div className="p-5 border-t border-stone-100 bg-[#FAF9F7] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-stone-500">
                    ที่อยู่จัดส่ง: <b className="text-stone-800">{order.shippingAddress}</b>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-stone-600">
                      ชำระโดย: <b className="capitalize">{order.paymentMethod}</b>
                    </span>
                    <span className="text-base font-bold text-stone-950">
                      ยอดสุทธิ: <b className="text-amber-900 text-lg">฿{order.total}</b>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoice Receipt Modal */}
      {viewInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif-thai text-xl font-bold text-stone-900">
                  ใบเสร็จรับเงิน / คำสั่งซื้อ
                </h3>
                <p className="text-xs text-stone-500">ร้านหนังสือออนไลน์ โชติเทียน (Chot Thean)</p>
                <p className="text-xs font-mono font-bold text-amber-800 mt-1">
                  #{viewInvoiceOrder.id}
                </p>
              </div>
              <button
                onClick={() => setViewInvoiceOrder(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-stone-600">
              <p>
                <b>ลูกค้า:</b> {viewInvoiceOrder.userName} ({viewInvoiceOrder.userPhone})
              </p>
              <p>
                <b>ที่อยู่จัดส่ง:</b> {viewInvoiceOrder.shippingAddress}
              </p>
              <p>
                <b>วันที่สั่งซื้อ:</b> {new Date(viewInvoiceOrder.createdAt).toLocaleString('th-TH')}
              </p>
              <p>
                <b>วิธีชำระเงิน:</b> {viewInvoiceOrder.paymentMethod.toUpperCase()} (
                {viewInvoiceOrder.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'})
              </p>
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
                  <tr>
                    <th className="p-3">รายการ</th>
                    <th className="p-3 text-center">จำนวน</th>
                    <th className="p-3 text-right">ยอดรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {viewInvoiceOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <span className="font-bold text-stone-800 block truncate max-w-[200px]">
                          {it.title}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {it.format === 'ebook' ? 'E-Book' : 'หนังสือเล่ม'}
                        </span>
                      </td>
                      <td className="p-3 text-center">{it.quantity}</td>
                      <td className="p-3 text-right font-bold text-stone-800">
                        ฿{it.price * it.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-xs text-stone-600 border-t border-stone-100 pt-3">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า</span>
                <span>฿{viewInvoiceOrder.subtotal}</span>
              </div>
              {viewInvoiceOrder.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>ส่วนลด ({viewInvoiceOrder.couponCode})</span>
                  <span>-฿{viewInvoiceOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span>{viewInvoiceOrder.shippingFee === 0 ? 'ฟรี' : `฿${viewInvoiceOrder.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>ยอดชำระสุทธิ</span>
                <span className="text-amber-900">฿{viewInvoiceOrder.total}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-stone-500" />
                <span>พิมพ์ใบเสร็จ</span>
              </button>
              <button
                onClick={() => setViewInvoiceOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-amber-800"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
