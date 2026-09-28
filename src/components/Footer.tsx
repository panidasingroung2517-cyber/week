import React from 'react';
import { Flame, ShieldCheck, Truck, BookOpen, Clock, Heart } from 'lucide-react';

interface FooterProps {
  onCategoryClick: (catId: string) => void;
  categories: { id: string; name: string }[];
}

export const Footer: React.FC<FooterProps> = ({ onCategoryClick, categories }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md">
                <Flame className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="font-serif-thai text-2xl font-bold tracking-tight text-white block">
                  Chot Thean
                </span>
                <span className="text-[10px] text-amber-400 uppercase font-semibold">
                  โชติเทียน ออนไลน์ บุ๊กสโตร์
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              ร้านขายหนังสือออนไลน์ “โชติเทียน” จุดประกายปัญญา เติมเต็มจินตนาการ คัดสรรวรรณกรรมทรงคุณค่า นิยาย มังงะ หนังสือเตรียมสอบ และอีบุ๊กคุณภาพสูงเพื่อนักอ่านชาวไทยทุกคน
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-stone-400">รองรับการชำระเงิน:</span>
              <span className="text-[11px] bg-stone-800 px-2.5 py-1 rounded text-stone-300 font-mono">
                PromptPay QR
              </span>
              <span className="text-[11px] bg-stone-800 px-2.5 py-1 rounded text-stone-300 font-mono">
                Visa / Master
              </span>
              <span className="text-[11px] bg-stone-800 px-2.5 py-1 rounded text-stone-300 font-mono">
                COD
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              หมวดหมู่ยอดนิยม
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onCategoryClick(c.id)}
                    className="hover:text-amber-400 transition"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              บริการลูกค้า
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>คำถามที่พบบ่อย (FAQ)</li>
              <li>เงื่อนไขการจัดส่งและค่าบริการ</li>
              <li>การรับประกันและเปลี่ยนคืนหนังสือ</li>
              <li>วิธีอ่านและใช้งาน E-Book</li>
              <li>นโยบายความเป็นส่วนตัว</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              ติดต่อร้านค้า
            </h4>
            <div className="text-xs text-stone-400 space-y-1.5 leading-relaxed">
              <p>ร้านหนังสือ โชติเทียน (Chot Thean Bookstore)</p>
              <p>โทร: 02-123-4567 / 081-234-5678</p>
              <p>อีเมล: contact@chotthean.com</p>
              <p>เวลาทำการ: ทุกวัน 08:30 - 20:00 น.</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Chot Thean (โชติเทียน). สงวนลิขสิทธิ์ทั้งหมด.</p>
          <p className="flex items-center gap-1">
            <span>สรรค์สร้างเพื่อคนรักการอ่าน</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>ในประเทศไทย</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
