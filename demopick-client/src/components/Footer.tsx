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
  Layers,
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

      {/* 2. NỘI DUNG FOOTER CHÍNH (3 CỘT THÔNG TIN CHUẨN XÁC) */}
      <div className="container mx-auto max-w-7xl px-5 sm:px-7 lg:px-9 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* CỘT 1: THƯƠNG HIỆU & LIÊN HỆ CƠ SỞ (6 CỘT) */}
          <div className="lg:col-span-6 space-y-5">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group select-none">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/10">
                <PickleballLogo size={28} />
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-2xl text-foreground tracking-tight">Pick</span>
                <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">Club & Shop</span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Nền tảng thể thao trực tuyến kết hợp đặt sân Pickleball tự động và cung cấp dụng cụ thi đấu chính hãng. Giữ chỗ chuẩn xác, check-in mã QR tức thì và hỗ trợ người chơi 24/7.
            </p>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Cụm 8 sân thể thao Pickleball, Số 28 Dịch Vọng Hậu, Cầu Giấy, Hà Nội</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Hotline đặt sân & hỗ trợ:{' '}
                  <a href="tel:19006868" className="text-foreground font-bold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    1900 6868
                  </a>{' '}
                  (08:00 - 22:00)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Email hỗ trợ:{' '}
                  <a href="mailto:support@demopick.vn" className="text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    support@demopick.vn
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Mở cửa vận hành: <strong className="text-foreground">05:00 – 23:00</strong> (Tất cả các ngày trong tuần)</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: DỊCH VỤ & TIỆN ÍCH (3 CỘT - CÁC TRANG CHỨC NĂNG RIÊNG BIỆT) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Dịch Vụ & Tiện Ích</span>
            </h3>

            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/booking" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Đặt sân trực tuyến (8 Sân Pro)</span>
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Tra cứu vé & Check-in QR</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Giỏ hàng & Khuyến mãi</span>
                </Link>
              </li>
              <li>
                <Link to="/wishlist" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Sản phẩm yêu thích đã lưu</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Hồ sơ & Tài khoản hội viên</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: THIẾT BỊ THỂ THAO (3 CỘT - BỘ LỌC DANH MỤC TRỰC TIẾP) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Thiết Bị Thể Thao</span>
            </h3>

            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products?category=V%E1%BB%A3t%20Pickleball" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Vợt Pickleball Carbon</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=B%C3%B3ng%20Pickleball" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Bóng thi đấu chuẩn USAPA</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=Ph%E1%BB%A5%20ki%E1%BB%87n%20%26%20Bao%20v%E1%BB%A3t" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Phụ kiện & Bao vợt</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=Qu%E1%BA%A7n%20%C3%A1o%20%26%20Trang%20ph%E1%BB%A5c" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Quần áo & Trang phục</span>
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={scrollToTop} className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Tất cả sản phẩm thiết bị</span>
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
            © 2026 <strong className="text-foreground">Pick (DemoPick)</strong> — Nền tảng Đặt sân Thể thao & Thương mại điện tử Pickleball. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  )
}
