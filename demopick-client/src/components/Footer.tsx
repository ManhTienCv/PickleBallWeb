import React from 'react'
import { Link } from 'react-router-dom'
import PickleballLogo from '@/components/PickleballLogo'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Calendar,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-border bg-card text-card-foreground mt-16 transition-colors duration-300">
      {/* 1. THANH LỢI ÍCH & CAM KẾT (VALUE PROPOSITIONS BAR) */}
      <div className="border-b border-border/70 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-5 sm:px-7 lg:px-9 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">100% Chính Hãng</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Selkirk, Joola, CRBN, Franklin chuẩn USAPA</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Đặt Sân Tức Thì</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Khóa giữ chỗ 10 phút, check-in QR 2 giây</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Giao Hàng Hỏa Tốc</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Ship nhanh 2h nội thành, toàn quốc 24-48h</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Đổi Trả Uy Tín</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Đổi mới trong 7 ngày, bảo hành đến 12 tháng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NỘI DUNG FOOTER CHÍNH (3 CỘT THÔNG TIN CÂN ĐỐI) */}
      <div className="container mx-auto max-w-7xl px-5 sm:px-7 lg:px-9 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* CỘT 1: THƯƠNG HIỆU & LIÊN HỆ CƠ SỞ (6 CỘT) */}
          <div className="lg:col-span-6 space-y-5">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group select-none">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/10">
                <PickleballLogo size={28} />
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-2xl text-foreground tracking-tight">Pick Web</span>
                <span className="ml-1 text-xs font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">Club & Shop</span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Hệ thống tổ hợp thể thao Pickleball chuẩn thi đấu quốc tế kết hợp siêu thị phân phối vợt, bóng thi đấu và phụ kiện chính hãng hàng đầu Việt Nam.
            </p>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Cụm liên hợp 8 sân thể thao Pickleball, Số 28 Dịch Vọng Hậu, Cầu Giấy, Hà Nội</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Hotline đặt sân & hỗ trợ: <strong className="text-foreground font-bold">1900 6868</strong> (08:00 - 22:00)</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Email hỗ trợ: <strong className="text-foreground">support@demopick.vn</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Mở cửa vận hành: <strong className="text-foreground">05:00 – 23:00</strong> (Tất cả các ngày)</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: DỊCH VỤ SÂN BÃI (3 CỘT) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Dịch Vụ Đặt Sân</span>
            </h3>

            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/booking" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Sơ đồ 8 sân (Trong nhà & Ngoài trời)</span>
                </Link>
              </li>
              <li>
                <Link to="/booking" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Lưới ca giờ thi đấu (17 ca/ngày)</span>
                </Link>
              </li>
              <li>
                <Link to="/booking" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Bảng giá giờ thường & giờ cao điểm</span>
                </Link>
              </li>
              <li>
                <Link to="/booking" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Quy định giữ chỗ tạm thời 10 phút</span>
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Vé điện tử & Check-in quét mã QR</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: CỬA HÀNG THIẾT BỊ (3 CỘT) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Thiết Bị Thể Thao</span>
            </h3>

            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Vợt Pickleball Carbon</span>
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Bóng thi đấu chuẩn USAPA</span>
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Túi đựng vợt & Balo cao cấp</span>
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Quấn cán & Phụ kiện bảo hộ</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Mã khuyến mãi & Voucher</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. DÒNG BẢN QUYỀN DƯỚI CÙNG (SUB-FOOTER) */}
      <div className="border-t border-border bg-muted/40 py-5">
        <div className="container mx-auto max-w-7xl px-5 sm:px-7 lg:px-9 text-center text-xs text-muted-foreground">
          <p>
            © 2026 <strong className="text-foreground">Pick Web (DemoPick)</strong> — Nền tảng Đặt sân Thể thao & Thương mại điện tử Pickleball. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  )
}
