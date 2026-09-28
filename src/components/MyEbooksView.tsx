import React from 'react';
import { BookOpen, Download, ArrowLeft, CheckCircle2, Bookmark, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';
import { Book } from '../types';
import { useToast } from './Toast';

interface MyEbooksViewProps {
  onBackToStore: () => void;
  onOpenReader: (book: Book) => void;
}

export const MyEbooksView: React.FC<MyEbooksViewProps> = ({
  onBackToStore,
  onOpenReader,
}) => {
  const { purchasedEbookIds, isStaff } = useAuth();
  const { books, readingProgress } = useBooks();
  const { showToast } = useToast();

  // If user is staff/admin, they can preview all ebooks in catalog; if customer, they see purchased ones
  const myEbooks = isStaff
    ? books.filter((b) => b.format === 'ebook' || b.format === 'both')
    : books.filter((b) => purchasedEbookIds.includes(b.id));

  const handleDownload = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    const content = book.ebookContent || book.sampleContent || 'Chot Thean E-Book Content';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title}_eBook.txt`;
    link.click();
    showToast(`ดาวน์โหลด E-Book "${book.title}" เรียบร้อยแล้ว`, 'success');
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
          <span>กลับไปหน้าร้านค้า</span>
        </button>
        <div className="flex items-center gap-2.5 mt-1">
          <BookOpen className="w-6 h-6 text-amber-800" />
          <h1 className="font-serif-thai text-2xl sm:text-3xl font-bold text-stone-900">
            ชั้นหนังสือ E-Book ของฉัน ({myEbooks.length})
          </h1>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          {isStaff
            ? 'โหมดผู้ดูแล/เจ้าหน้าที่: สามารถเข้าอ่านและตรวจสอบเนื้อหา E-Book ทั้งหมดในร้านได้ทันที พร้อมบันทึกความคืบหน้าขึ้น Firestore'
            : 'คลังหนังสือดิจิทัลที่คุณสั่งซื้อแล้ว บันทึกหน้าที่คุณอ่านค้างไว้บนคลาวด์อัตโนมัติ เพื่อให้คุณกลับมาอ่านต่อได้อย่างไร้รอยต่อ'}
        </p>
      </div>

      {/* Bookshelf Grid */}
      <div className="mt-8">
        {myEbooks.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif-thai text-lg font-bold text-stone-800">
              ยังไม่มี E-Book ในชั้นหนังสือ
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              เมื่อคุณสั่งซื้อ E-Book ระบบจะปลดล็อกและส่งหนังสือมายังชั้นหนังสือนี่โดยอัตโนมัติ
            </p>
            <button
              onClick={onBackToStore}
              className="mt-2 px-5 py-2.5 rounded-xl bg-amber-800 text-white font-semibold text-xs hover:bg-amber-900 transition"
            >
              เลือกซื้อ E-Book ยอดนิยม
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {myEbooks.map((book) => {
              const prog = readingProgress[book.id];
              const percent = prog?.progressPercent || 0;

              return (
                <div
                  key={book.id}
                  onClick={() => onOpenReader(book)}
                  className="group bg-white rounded-2xl border border-stone-200 p-3 hover:shadow-xl hover:border-amber-400 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden bg-stone-100 shadow-sm mb-3">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>อ่านได้ทันที</span>
                      </span>

                      {/* Progress Badge if read */}
                      {prog && prog.currentPage > 1 && (
                        <div className="absolute bottom-2 left-2 right-2 bg-stone-900/90 backdrop-blur-xs text-white p-1.5 rounded-lg text-[10px] space-y-1">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-amber-300 font-bold truncate">
                              บทที่ {prog.currentChapter}
                            </span>
                            <span className="font-mono text-stone-300">{percent}%</span>
                          </div>
                          <div className="w-full bg-stone-700 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-800 font-semibold truncate block">
                        {book.categoryName}
                      </span>
                      <h4 className="font-serif-thai text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">{book.author}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReader(book);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-200" />
                      <span>{prog && prog.currentPage > 1 ? `อ่านต่อ (บทที่ ${prog.currentChapter})` : 'เปิดอ่าน'}</span>
                    </button>
                    <button
                      onClick={(e) => handleDownload(book, e)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
                      title="ดาวน์โหลดไฟล์"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
