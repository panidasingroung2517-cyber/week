import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Calculator,
} from 'lucide-react';
import { useAuth, ADMIN_BOOTSTRAP_EMAIL, ADMIN_SECRET_PIN } from '../context/AuthContext';
import { useToast } from './Toast';

interface AuthModalProps {
  onSuccessAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccessAdmin }) => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginWithAdminPin,
    loginAsDemo,
  } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage('');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
      showToast('เข้าสู่ระบบด้วยบัญชี Google สำเร็จเรียบร้อย!', 'success');
      handleClose();
      if (onSuccessAdmin) onSuccessAdmin();
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google');
      showToast('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในขณะนี้', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const ok = await loginWithEmail(email, password);
      if (ok) {
        showToast(`ยินดีต้อนรับเข้าสู่ระบบ โชติเทียน (${email})`, 'success');
        handleClose();
        if (onSuccessAdmin && (email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() || email.includes('admin') || email.includes('staff'))) {
          onSuccessAdmin();
        }
      }
    } catch {
      setErrorMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const ok = await registerWithEmail(name, email, password, address);
      if (ok) {
        showToast(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${name} สู่ครอบครัวโชติเทียน`, 'success');
        handleClose();
      }
    } catch {
      setErrorMessage('เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const ok = loginWithAdminPin(adminPin);
    if (ok) {
      showToast('ยืนยันรหัสผ่านแอดมินสำเร็จ! กำลังเข้าสู่ระบบแคชบอร์ด...', 'success');
      handleClose();
      if (onSuccessAdmin) onSuccessAdmin();
    } else {
      setErrorMessage(`รหัส PIN ไม่ถูกต้อง (ทดสอบด้วยรหัส: ${ADMIN_SECRET_PIN})`);
      showToast('รหัส PIN แอดมินไม่ถูกต้อง', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF9F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center font-bold">
              {authModalTab === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif-thai text-base font-bold text-stone-900">
                {authModalTab === 'login'
                  ? 'เข้าสู่ระบบสมาชิก'
                  : authModalTab === 'register'
                  ? 'สมัครสมาชิกใหม่'
                  : 'เข้าสู่ระบบแอดมิน & แคชเชียร์'}
              </h3>
              <p className="text-[10px] text-stone-500">ร้านหนังสือออนไลน์ โชติเทียน (Chot Thean)</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-1.5 bg-stone-100/80 border-b border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setErrorMessage('');
            }}
            className={`py-2 rounded-xl transition ${
              authModalTab === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('register');
              setErrorMessage('');
            }}
            className={`py-2 rounded-xl transition ${
              authModalTab === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            สมัครสมาชิก
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('admin');
              setErrorMessage('');
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              authModalTab === 'admin'
                ? 'bg-amber-800 text-white shadow-xs font-bold'
                : 'text-amber-900 hover:text-amber-950 font-medium'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>แคชเชียร์/Admin</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: CUSTOMER LOGIN */}
          {authModalTab === 'login' && (
            <div className="space-y-4">
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 font-semibold text-xs text-stone-800 flex items-center justify-center gap-2 shadow-xs transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google Account</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-stone-400">
                <div className="flex-1 h-px bg-stone-200" />
                <span>หรือใช้อีเมลและรหัสผ่าน</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">อีเมลผู้ใช้:</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">รหัสผ่าน:</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-amber-800 text-white font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* 1-Click Fast Demo Accounts */}
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-2">
                  คลิกเดียวเพื่อทดสอบระบบ (Demo Quick Accounts):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      loginAsDemo('customer');
                      showToast('เข้าสู่ระบบในฐานะ คุณนักอ่าน (สมาชิก)', 'success');
                      handleClose();
                    }}
                    className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border text-left"
                  >
                    <span className="font-bold text-stone-900 block truncate">👤 สมาชิกคุณนักอ่าน</span>
                    <span className="text-[10px] text-stone-500">ช้อปปิ้ง & อ่าน E-Book</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loginAsDemo('admin');
                      showToast('เข้าสู่ระบบในฐานะ Admin Manager', 'success');
                      handleClose();
                      if (onSuccessAdmin) onSuccessAdmin();
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left"
                  >
                    <span className="font-bold text-amber-950 block truncate">👑 ผู้ดูแลร้าน (Admin)</span>
                    <span className="text-[10px] text-amber-800">เข้าถึงแคชบอร์ด & POS</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>สมัครสมาชิกวันนี้ รับโค้ดลด 50 บาท (<b>WELCOME50</b>) ทันที!</span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">ชื่อ-นามสกุล:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณสมศรี มีความสุข"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">อีเมลของคุณ:</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">กำหนดรหัสผ่าน:</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">ที่อยู่จัดส่งพัสดุเริ่มต้น (ตัวเลือก):</label>
                <textarea
                  rows={2}
                  placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold transition shadow-sm"
              >
                ยืนยันการสมัครสมาชิก
              </button>
            </form>
          )}

          {/* TAB 3: ADMIN & CASHIER ACCESS PORTAL */}
          {authModalTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-stone-900 text-stone-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ระบบหลังบ้านและแคชบอร์ด (Admin Backoffice)</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  สำหรับผู้จัดการร้านและเจ้าหน้าที่แคชเชียร์ กรอกรหัส PIN หรืออีเมลผู้ดูแลเพื่อเข้าสู่ระบบ
                </p>
              </div>

              <form onSubmit={handleAdminPinLogin} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    รหัสผ่านพินแอดมิน (Admin Passcode PIN):
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="ใส่ PIN เช่น 8888"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 font-mono text-center tracking-widest text-base border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none bg-amber-50/30"
                    />
                    <KeyRound className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-1">
                    * รหัส PIN ทดสอบค่าเริ่มต้นของระบบคือ <b>8888</b>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-amber-900/15"
                >
                  <Calculator className="w-4 h-4 text-amber-200" />
                  <span>ปลดล็อกเข้าสู่แคชบอร์ด & หลังบ้าน</span>
                </button>
              </form>

              <div className="pt-2 border-t border-stone-100 flex flex-col gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemo('admin');
                    showToast('ล็อกอินเข้าสู่สิทธิ์ Admin ผู้ดูแลระบบเรียบร้อย', 'success');
                    handleClose();
                    if (onSuccessAdmin) onSuccessAdmin();
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold flex items-center justify-between"
                >
                  <span>เข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบทันที</span>
                  <span className="text-[10px] text-amber-800 font-bold">1-Click</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loginAsDemo('staff');
                    showToast('ล็อกอินเข้าสู่สิทธิ์เจ้าหน้าที่แคชเชียร์เรียบร้อย', 'success');
                    handleClose();
                    if (onSuccessAdmin) onSuccessAdmin();
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold flex items-center justify-between"
                >
                  <span>เข้าสู่ระบบในฐานะเจ้าหน้าที่แคชเชียร์ (Staff)</span>
                  <span className="text-[10px] text-blue-700 font-bold">POS Only</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
