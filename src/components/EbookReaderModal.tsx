import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Lock,
  Download,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Bookmark,
  CloudCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Book, ReadingProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBooks } from '../context/BookContext';
import { useToast } from './Toast';

interface EbookReaderModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isSampleOnly?: boolean;
}

export const EbookReaderModal: React.FC<EbookReaderModalProps> = ({
  book,
  isOpen,
  onClose,
  isSampleOnly = false,
}) => {
  const { profile, purchasedEbookIds, isStaff } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const { getReadingProgress, saveReadingProgress } = useBooks();
  const { showToast } = useToast();

  const totalChapters = 10;
  const totalPages = book?.pages || 250;

  // Retrieve saved progress from Firestore/Local
  const savedProgress = book ? getReadingProgress(book.id) : null;

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [theme, setTheme] = useState<'paper' | 'sepia' | 'dark'>('paper');
  const [activeChapter, setActiveChapter] = useState(savedProgress?.currentChapter || 1);
  const [currentPage, setCurrentPage] = useState(
    savedProgress?.currentPage || Math.max(1, Math.round(totalPages / totalChapters))
  );
  const [resumedNotice, setResumedNotice] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Security Verification check:
  const hasAccess = book ? (purchasedEbookIds.includes(book.id) || isStaff || isSampleOnly) : false;
  const isFullVersion = book ? (purchasedEbookIds.includes(book.id) || isStaff) : false;

  // Initial resume reading detection
  useEffect(() => {
    if (!isOpen || !book) return;
    if (savedProgress && savedProgress.currentPage > 1) {
      setActiveChapter(savedProgress.currentChapter);
      setCurrentPage(savedProgress.currentPage);
      setResumedNotice(
        `เปิดต่อจากจุดเดิมที่คุณอ่านค้างไว้: บทที่ ${savedProgress.currentChapter} (หน้าที่ ${savedProgress.currentPage} · ${savedProgress.progressPercent}%)`
      );
    }
  }, [book?.id, isOpen]);

  // Auto-save reading progress to Firestore when chapter or page changes
  useEffect(() => {
    if (!isOpen || !book || !isFullVersion) return;

    const timer = setTimeout(async () => {
      await saveReadingProgress(
        profile?.id || 'guest',
        book.id,
        activeChapter,
        currentPage,
        totalChapters,
        totalPages,
        book.title
      );
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeChapter, currentPage, book?.id, isFullVersion, profile?.id, isOpen]);

  if (!isOpen || !book) return null;

  const currentPercent = Math.min(100, Math.max(1, Math.round((currentPage / totalPages) * 100)));

  const handleNextChapter = () => {
    if (activeChapter < totalChapters) {
      const nextChap = activeChapter + 1;
      const nextPage = Math.min(totalPages, Math.round((nextChap / totalChapters) * totalPages));
      setActiveChapter(nextChap);
      setCurrentPage(nextPage);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapter > 1) {
      const prevChap = activeChapter - 1;
      const prevPage = Math.max(1, Math.round(((prevChap - 1) / totalChapters) * totalPages) + 1);
      setActiveChapter(prevChap);
      setCurrentPage(prevPage);
    }
  };

  const handleResetProgress = () => {
    setActiveChapter(1);
    setCurrentPage(1);
    setResumedNotice(null);
    showToast('เริ่มอ่านใหม่ตั้งแต่บทที่ 1 เรียบร้อย', 'info');
  };

  const contentToDisplay = isFullVersion
    ? book.ebookContent || book.sampleContent || 'เนื้อหา E-Book พร้อมสำหรับการอ่าน'
    : book.sampleContent || 'เนื้อหาบทตัวอย่างสำหรับการทดลองอ่านฟรี';

  const themeStyles = {
    paper: 'bg-[#FAF8F5] text-stone-900 border-stone-200',
    sepia: 'bg-[#F4ECD8] text-[#5C4033] border-[#E6D7B9]',
    dark: 'bg-[#18181B] text-[#E4E4E7] border-[#27272A]',
  };

  const textStyles = {
    sm: 'text-xs sm:text-sm leading-relaxed',
    base: 'text-sm sm:text-base leading-relaxed',
    lg: 'text-base sm:text-lg leading-loose',
    xl: 'text-lg sm:text-xl leading-loose',
  };

  const handleDownload = () => {
    if (!isFullVersion) {
      showToast('กรุณาสั่งซื้อ E-Book ฉบับเต็มเพื่อดาวน์โหลดไฟล์', 'error');
      return;
    }
    const blob = new Blob([contentToDisplay], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title}_ChotThean_eBook.txt`;
    link.click();
    showToast('ดาวน์โหลด E-Book สำเร็จเรียบร้อย!', 'success');
  };

  const handleBuyEbook = () => {
    addToCart(book, 'ebook', 1);
    onClose();
    setIsCartOpen(true);
    showToast(`เพิ่ม E-Book "${book.title}" ลงในตะกร้าแล้ว`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl h-[94vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-colors duration-200 ${themeStyles[theme]}`}
      >
        {/* Top Reader Controls Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-inherit bg-black/5 backdrop-blur-xs">
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-serif-thai text-sm sm:text-base font-bold truncate">
                {book.title}
              </h3>
              <p className="text-[11px] opacity-70 truncate">{book.author} · สำนักพิมพ์ {book.publisher}</p>
            </div>
            {isFullVersion ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>ฉบับเต็ม</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500/20 text-amber-900 px-2 py-0.5 rounded-full border border-amber-500/30">
                <span>หน้าตัวอย่างทดลองอ่าน</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Reading progress sync indicator */}
            {isFullVersion && (
              <div
                className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                  justSaved ? 'bg-emerald-500/20 text-emerald-800' : 'opacity-60'
                }`}
                title="ความคืบหน้าจะบันทึกไปยัง Firestore อัตโนมัติ"
              >
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{justSaved ? 'บันทึกคลาวด์แล้ว' : 'บันทึกอัตโนมัติ'}</span>
              </div>
            )}

            {/* Font size */}
            <div className="hidden sm:flex items-center bg-black/5 rounded-xl p-1 border border-inherit text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded ${fontSize === 'sm' ? 'bg-white shadow-xs font-bold' : ''}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 rounded ${fontSize === 'base' ? 'bg-white shadow-xs font-bold' : ''}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded ${fontSize === 'lg' ? 'bg-white shadow-xs font-bold' : ''}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`px-2 py-0.5 rounded ${fontSize === 'xl' ? 'bg-white shadow-xs font-bold' : ''}`}
              >
                A++
              </button>
            </div>

            {/* Reading themes */}
            <div className="flex items-center bg-black/5 rounded-xl p-1 border border-inherit">
              <button
                onClick={() => setTheme('paper')}
                className={`p-1.5 rounded-lg ${theme === 'paper' ? 'bg-white shadow-xs text-amber-900' : 'opacity-70'}`}
                title="โหมดกระดาษถนอมสายตา"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded-lg ${theme === 'sepia' ? 'bg-[#FAF0D7] shadow-xs text-amber-950' : 'opacity-70'}`}
                title="โหมดซีเปีย วอร์ม"
              >
                <Coffee className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-stone-800 shadow-xs text-amber-400' : 'opacity-70'}`}
                title="โหมดมืด"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Download if purchased */}
            {isFullVersion && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-xl hover:bg-black/10 transition"
                title="ดาวน์โหลดไฟล์สำหรับอ่านออฟไลน์"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumed Reading Banner Alert */}
        {resumedNotice && (
          <div className="px-6 py-2 bg-amber-500/15 border-b border-inherit flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{resumedNotice}</span>
            </div>
            <button
              onClick={handleResetProgress}
              className="text-[11px] hover:underline flex items-center gap-1 font-semibold opacity-75 hover:opacity-100"
            >
              <RotateCcw className="w-3 h-3" />
              <span>เริ่มอ่านใหม่</span>
            </button>
          </div>
        )}

        {/* Reader Content Area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 max-w-3xl mx-auto w-full">
          {!hasAccess ? (
            /* Locked screen if access denied */
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-serif-thai text-xl font-bold">
                จำเป็นต้องชำระเงินเพื่ออ่าน E-Book ฉบับเต็ม
              </h3>
              <p className="text-xs max-w-sm mx-auto opacity-80">
                คุณยังไม่ได้สั่งซื้อ E-Book เล่มนี้ หรืออยู่ในระหว่างรอการยืนยันชำระเงิน
              </p>
              <button
                onClick={handleBuyEbook}
                className="mt-4 px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition flex items-center gap-2 mx-auto shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>สั่งซื้อ E-Book ทันที ฿{book.price}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Chapter Header */}
              <div className="text-center pb-6 border-b border-inherit">
                <span className="text-[11px] uppercase tracking-widest opacity-60 font-mono">
                  CHOT THEAN DIGITAL READER · CHAPTER {activeChapter} / {totalChapters}
                </span>
                <h2 className="font-serif-thai text-2xl sm:text-3xl font-bold mt-2">
                  {book.title}
                </h2>
                <p className="text-xs opacity-70 mt-1">{book.author}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs opacity-60 font-mono">
                  <span>หน้าที่ {currentPage} จาก {totalPages} หน้า</span>
                  <span>·</span>
                  <span>ความคืบหน้า {currentPercent}%</span>
                </div>
              </div>

              {/* Reading Progress Visual Slider / Bar */}
              <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-700 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>

              {/* Text Content */}
              <div className={`font-serif-thai whitespace-pre-line leading-relaxed ${textStyles[fontSize]}`}>
                {contentToDisplay}
              </div>

              {/* Sample callout if not full */}
              {!isFullVersion && (
                <div className="mt-12 p-6 rounded-3xl bg-amber-900/10 border border-amber-800/30 text-center space-y-3">
                  <Bookmark className="w-8 h-8 text-amber-800 mx-auto" />
                  <h4 className="font-serif-thai text-lg font-bold">
                    สิ้นสุดหน้าตัวอย่างทดลองอ่าน
                  </h4>
                  <p className="text-xs opacity-80 max-w-md mx-auto">
                    เพลิดเพลินกับเรื่องราวแบบเต็มอรรถรส สั่งซื้อ E-Book เล่มนี้เพื่อปลดล็อกทุกบททันที
                  </p>
                  <button
                    onClick={handleBuyEbook}
                    className="px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition flex items-center gap-2 mx-auto shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-200" />
                    <span>ซื้อ E-Book ฉบับเต็ม ฿{book.price}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Pagination / Chapter Navigator with reading progress */}
        <div className="px-6 py-3 border-t border-inherit flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-85 bg-black/5">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              หน้าที่ {currentPage} / {totalPages} ({currentPercent}%)
            </span>
            <div className="w-24 bg-black/15 rounded-full h-1.5 overflow-hidden hidden sm:block">
              <div
                className="bg-amber-700 h-full transition-all duration-300 rounded-full"
                style={{ width: `${currentPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevChapter}
              disabled={activeChapter <= 1}
              className="flex items-center gap-1 hover:underline disabled:opacity-30 disabled:no-underline"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>บทย้อนหลัง</span>
            </button>

            <select
              value={activeChapter}
              onChange={(e) => {
                const chap = Number(e.target.value);
                const page = Math.min(totalPages, Math.round((chap / totalChapters) * totalPages));
                setActiveChapter(chap);
                setCurrentPage(page);
              }}
              className="bg-transparent border border-inherit rounded-lg px-2 py-1 text-xs font-bold cursor-pointer"
            >
              {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch} className="bg-white text-stone-900">
                  บทที่ {ch}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextChapter}
              disabled={activeChapter >= totalChapters}
              className="flex items-center gap-1 hover:underline disabled:opacity-30 disabled:no-underline"
            >
              <span>บทถัดไป</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
