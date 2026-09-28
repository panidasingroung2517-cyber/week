import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, ShieldCheck, LogOut, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { UserRole } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, user, role, updateUserProfile, loginWithGoogle, logout, loginAsDemo } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName,
        phone,
        address,
      });
      showToast('บันทึกข้อมูลโปรไฟล์สำเร็จเรียบร้อย', 'success');
      onClose();
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg ring-4 ring-amber-50">
              {profile?.displayName?.charAt(0) || <User className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-serif-thai text-xl font-bold text-stone-900">
                ข้อมูลโปรไฟล์สมาชิก
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
                <ShieldCheck className="w-3 h-3 text-amber-700" />
                <span>
                  {role === 'admin'
                    ? 'สิทธิ์: ผู้ดูแลระบบ (Admin)'
                    : role === 'staff'
                    ? 'สิทธิ์: พนักงานคลัง (Staff)'
                    : 'สิทธิ์: สมาชิกลูกค้า (Customer)'}
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Role Switcher Quick Bar */}
        <div className="p-3.5 rounded-2xl bg-stone-900 text-stone-200 space-y-2">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>สลับบทบาทผู้ใช้สำหรับทดสอบระบบ (Demo Switcher)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(['admin', 'staff', 'customer'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  loginAsDemo(r);
                  showToast(`สลับไปใช้สิทธิ์ "${r.toUpperCase()}" เรียบร้อย`, 'info');
                }}
                className={`py-2 px-2.5 rounded-xl font-semibold transition text-center ${
                  role === r
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                }`}
              >
                {r === 'admin' ? '👑 Admin' : r === 'staff' ? '📦 Staff' : '👤 Customer'}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ชื่อ-นามสกุล / ชื่อที่แสดง:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              อีเมลบัญชีผู้ใช้:
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={profile?.email || 'customer@chotthean.com'}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              เบอร์โทรศัพท์ติดต่อ:
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ที่อยู่จัดส่งพัสดุเริ่มต้น:
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด, รหัสไปรษณีย์"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition shadow-md shadow-amber-900/10"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>

        {/* Google sign-in status & Logout */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          {!user ? (
            <button
              onClick={() => loginWithGoogle().catch(() => {})}
              className="text-xs text-amber-800 hover:underline font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>เชื่อมต่อบัญชี Google จริง</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>เชื่อมต่อ Google แล้ว</span>
            </span>
          )}

          <button
            onClick={() => {
              logout();
              onClose();
              showToast('ออกจากระบบเรียบร้อย', 'info');
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
