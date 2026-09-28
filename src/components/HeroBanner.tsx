import React from 'react';
import { BookOpen, Sparkles, Truck, ShieldCheck, Tag, ArrowRight, Copy, Check } from 'lucide-react';
import { useToast } from './Toast';

interface HeroBannerProps {
  onGenreSelect: (genre: string | null) => void;
  selectedGenre: string | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onGenreSelect, selectedGenre }) => {
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`คัดลอกโค้ด "${code}" สำเร็จ! สามารถนำไปวางในขั้นตอนชำระเงินได้ทันที`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const genres = [
    { id: null, label: 'ทั้งหมด' },
    { id: 'novel', label: '📖 นิยาย & วรรณกรรม' },
    { id: 'comic', label: '⚡ การ์ตูน & มังงะ' },
    { id: 'academic', label: '🎓 เตรียมสอบ & วิชาการ' },
    { id: 'knowledge', label: '💡 พัฒนาตนเอง & ธุรกิจ' },
    { id: 'children', label: '🎨 หนังสือเด็ก & นิทาน' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#F5F0E8] via-[#FAF7F2] to-[#FAF8F5] pt-6 pb-8 border-b border-stone-200">
      {/* Subtle decorative background watermarks */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-orange-100/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>เทศกาลเปิดร้านใหม่ · โชติเทียน บุ๊กสโตร์</span>
            </div>

            <h1 className="font-serif-thai text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-[1.2] tracking-tight">
              จุดประกายปัญญา <br className="hidden sm:inline" />
              <span className="text-amber-800 underline decoration-amber-400/40 decoration-wavy decoration-2">
                เติมเต็มทุกจินตนาการ
              </span>
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl">
              คลังหนังสือเล่มคุณภาพและ E-Book พร้อมอ่านทันที ไม่ว่าจะเป็นนิยายคลาสสิก การ์ตูนยอดนิยม คู่มือเตรียมสอบ ไปจนถึงวรรณกรรมระดับโลก จัดส่งรวดเร็วทั่วประเทศไทย
            </p>

            {/* Coupons fast showcase */}
            <div className="pt-2">
              <div className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                <span>โค้ดส่วนลดพิเศษวันนี้ (กดเพื่อคัดลอก)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyCoupon('WELCOME50')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-amber-300 shadow-xs hover:border-amber-500 hover:bg-amber-50/50 transition group text-left"
                >
                  <span className="font-mono text-xs font-bold text-amber-900">WELCOME50</span>
                  <span className="text-[11px] text-stone-500">ลด ฿50</span>
                  {copiedCode === 'WELCOME50' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-stone-400 group-hover:text-amber-700" />
                  )}
                </button>

                <button
                  onClick={() => copyCoupon('FREESHIP')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 shadow-xs hover:border-emerald-500 hover:bg-emerald-50/50 transition group text-left"
                >
                  <span className="font-mono text-xs font-bold text-emerald-900">FREESHIP</span>
                  <span className="text-[11px] text-stone-500">ส่งฟรี</span>
                  {copiedCode === 'FREESHIP' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-stone-400 group-hover:text-emerald-700" />
                  )}
                </button>

                <button
                  onClick={() => copyCoupon('CHOTTHEAN15')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-stone-200 shadow-xs hover:border-amber-500 hover:bg-amber-50/50 transition group text-left"
                >
                  <span className="font-mono text-xs font-bold text-stone-900">CHOTTHEAN15</span>
                  <span className="text-[11px] text-stone-500">ลด 15%</span>
                  {copiedCode === 'CHOTTHEAN15' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-stone-400 group-hover:text-amber-700" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Hero Feature Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-stone-900 text-stone-100 p-6 sm:p-7 shadow-2xl border border-stone-800">
              <div className="absolute top-4 right-4 bg-amber-500 text-stone-950 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full">
                BESTSELLER 2026
              </div>

              <div className="flex items-start gap-4">
                <img
                  src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80"
                  alt="ความทรงจำที่โปรยปรายในฤดูใบไม้ผลิ"
                  className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-xl shadow-lg border border-stone-700 shrink-0"
                />
                <div className="space-y-1.5">
                  <span className="text-amber-400 text-xs font-semibold tracking-wide">
                    หนังสือแนะนำประจำสัปดาห์
                  </span>
                  <h3 className="font-serif-thai text-base sm:text-lg font-bold text-white line-clamp-2">
                    ความทรงจำที่โปรยปรายในฤดูใบไม้ผลิ
                  </h3>
                  <p className="text-xs text-stone-400">กิตติศักดิ์ โชคชัย</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-lg font-bold text-amber-400">฿320</span>
                    <span className="text-xs text-stone-500 line-through">฿380</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded">
                      -16%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-5 mt-5 border-t border-stone-800 text-center text-xs">
                <div className="p-2 rounded-xl bg-stone-800/60">
                  <Truck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-stone-300 text-[11px] block">ส่งไว 1-2 วัน</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-800/60">
                  <BookOpen className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-stone-300 text-[11px] block">E-Book อ่านทันที</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-800/60">
                  <ShieldCheck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-stone-300 text-[11px] block">ของแท้ 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Genre Filter Buttons */}
        <div className="mt-8 pt-6 border-t border-stone-200/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genres.map((g) => (
              <button
                key={g.id || 'all'}
                onClick={() => onGenreSelect(g.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                  selectedGenre === g.id
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
